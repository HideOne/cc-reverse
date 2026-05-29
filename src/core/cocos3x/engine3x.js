/*
 * Cocos Creator 3.x reverse-engineering orchestrator.
 *
 * High-level flow:
 *   1. Discover bundles under <buildRoot>/assets/<name>/config.json
 *      (plus subpackages and the runtime settings.json).
 *   2. Optionally decrypt each bundle's index.jsc if encrypted === true.
 *   3. For each bundle, parse config.json, iterate `paths`, and for every
 *      uuid:
 *        - Locate its import/<uuid>.json (or .cconb); parse for class + deps.
 *        - Locate its native file if one exists (from extensionMap or
 *          _native hints inside the document).
 *        - Copy both into the output tree, preserving the original project
 *          path from `config.paths[uuid].path` so the result mirrors the
 *          editor's asset layout.
 *   4. Recover user scripts from src/chunks/*.js (SystemJS modules).
 *   5. Emit a minimal project.json so Cocos Creator 3.x recognises the output.
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { logger } = require('../../utils/logger');
const { uuidUtils } = require('../../utils/uuidUtils');
const { parseBundleConfig, getImportPath, getNativePath, findBundleConfigPath } = require('./bundleConfig');
const { isCcon, decodeCcon } = require('./ccon');
const { inspect } = require('./deserializer');
const { rehydrateIFileData, expandEditorUuids, expandEditorFormat } = require('./rehydrate');
const { recoverSpinePathGroup, recoverSpriteAtlasPlist, recoverEffectAsset, recoverMaterialAsset } = require('./editorAssetRecovery');
const { writeCocos2xProject } = require('./projectScaffold');
const parser = require('@babel/parser');
const generate = require('@babel/generator');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * Native extensions we know how to detect from a JSON document's `_native`
 * field or the bundle's extensionMap.
 */
const KNOWN_NATIVE_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.pvr', '.pkm', '.astc',
  '.mp3', '.ogg', '.wav', '.m4a',
  '.txt', '.json', '.xml', '.plist',
  '.bin', '.cconb', '.ccon',
  '.ttf', '.otf', '.fnt',
  '.atlas', '.skel',
]);

/**
 * Class name → output subdirectory convention. Unknown classes land in `raw`.
 */
const CLASS_DIR = {
  'cc.SceneAsset': 'scene',
  'cc.Prefab': 'prefab',
  'cc.SpriteFrame': 'texture',
  'cc.ImageAsset': 'texture',
  'cc.Texture2D': 'texture',
  'cc.TextureCube': 'texture',
  'cc.AudioClip': 'audio',
  'cc.TextAsset': 'text',
  'cc.JsonAsset': 'json',
  'cc.BufferAsset': 'buffer',
  'cc.Mesh': 'mesh',
  'cc.Material': 'material',
  'cc.EffectAsset': 'effect',
  'cc.AnimationClip': 'animation',
  'cc.SkeletalAnimationClip': 'animation',
  'cc.Skeleton': 'skeleton',
  'cc.ParticleAsset': 'particle',
  'cc.Terrain': 'terrain',
  'cc.TerrainAsset': 'terrain',
  'cc.LabelAtlas': 'font',
  'cc.BitmapFont': 'font',
  'cc.TTFFont': 'font',
  'sp.SkeletonData': 'spine',
  'dragonBones.DragonBonesAsset': 'dragonbones',
  'dragonBones.DragonBonesAtlasAsset': 'dragonbones',
};

/**
 * Main entry point for 3.x projects. Invoked from reverseEngine when the
 * detector decides we're in 3.x territory.
 *
 * @param {object} options
 * @param {string} options.sourcePath
 * @param {string} options.outputPath
 * @param {string[]} [options.bundleFilter]  if provided, only these bundles.
 * @param {boolean}  [options.assetsOnly]
 * @param {boolean}  [options.scriptsOnly]
 * @param {string}   [options.key]  XXTEA key for encrypted bundle index files.
 * @param {boolean}  [options.verbose]
 */
async function reverseProject3x(options) {
  const {
    sourcePath,
    outputPath,
    bundleFilter,
    assetsOnly = false,
    scriptsOnly = false,
    verbose = false,
  } = options;

  await mkdir(outputPath, { recursive: true });
  await mkdir(path.join(outputPath, 'assets'), { recursive: true });

  const projectFlavor = detectProjectFlavor(sourcePath);
  const summary = {
    engine: '3.x',
    bundles: [],
    scripts: { total: 0 },
    warnings: [],
    flavor: projectFlavor.flavor,
    cocosVersion: projectFlavor.version,
  };

  if (!scriptsOnly) {
    const bundles = await discoverBundles(sourcePath);
    for (const bundleDir of bundles) {
      const name = path.basename(bundleDir);
      if (Array.isArray(bundleFilter) && bundleFilter.length > 0
          && !bundleFilter.includes(name)) {
        logger.debug(`Skipping bundle ${name} (not in --bundle filter)`);
        continue;
      }
      if (projectFlavor.flavor === '2.4.x-bundle' && name === 'internal') {
        logger.info(`Skipping built-in bundle "${name}" (not needed in editor project)`);
        continue;
      }
      try {
        const result = await unpackBundle({
          bundleDir, outputPath, verbose, flavor: projectFlavor.flavor,
        });
        summary.bundles.push(result);
      } catch (err) {
        logger.error(`Failed to unpack bundle ${name}:`, err);
        summary.warnings.push(`bundle ${name}: ${err.message}`);
      }
    }
  }

  if (!assetsOnly) {
    summary.scripts = await recoverScripts(sourcePath, outputPath, verbose);
  }

  if (projectFlavor.flavor === '2.4.x-bundle') {
    await writeCocos2xProject(outputPath, {
      projectName: path.basename(sourcePath),
      cocosVersion: projectFlavor.version || '2.4.14',
      settings: projectFlavor.settings || {},
      bundles: summary.bundles,
    });
  } else {
    await writeProjectDescriptor(outputPath);
  }

  await writeRecoveryReport(outputPath, summary, sourcePath);
  return summary;
}

/**
 * Decide whether this 3.x-style layout is actually a Cocos Creator 2.4 bundle
 * build (scenes use `.fire`, settings is `window._CCSettings`) or a true 3.x
 * build (`.scene`, `src/settings.json`).
 */
function detectProjectFlavor(sourcePath) {
  // 3.x marker.
  const settings3xPath = path.join(sourcePath, 'src', 'settings.json');
  if (fs.existsSync(settings3xPath)) {
    try {
      const s = JSON.parse(fs.readFileSync(settings3xPath, 'utf-8'));
      return { flavor: '3.x', settings: s };
    } catch {
      // fall through
    }
  }
  // Also check for hashed settings.*.json (3.x web builds).
  const srcDir = path.join(sourcePath, 'src');
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    const hashed = files.find(f => /^settings\..+\.json$/.test(f));
    if (hashed) {
      try {
        const s = JSON.parse(fs.readFileSync(path.join(srcDir, hashed), 'utf-8'));
        return { flavor: '3.x', settings: s };
      } catch {
        // fall through
      }
    }
  }

  // 2.4.x marker: src/settings.js containing `window._CCSettings = { ... }`.
  const settings2xPath = path.join(sourcePath, 'src', 'settings.js');
  if (fs.existsSync(settings2xPath)) {
    try {
      const text = fs.readFileSync(settings2xPath, 'utf-8');
      if (text.includes('_CCSettings') || text.includes('CCSettings')) {
        const settings = parseCCSettingsScript(text);
        return { flavor: '2.4.x-bundle', settings, version: settings.CCSettings?.engineVersion };
      }
    } catch {
      // fall through
    }
  }

  return { flavor: 'unknown', settings: {} };
}

function parseCCSettingsScript(text) {
  // Evaluate in a sandbox: window._CCSettings = { ... };
  try {
    const sandboxed = `let window = {}; ${text}; window`;
    // eslint-disable-next-line no-eval
    const result = eval(sandboxed);
    return result._CCSettings || result.CCSettings || {};
  } catch {
    return {};
  }
}

/**
 * Walk <buildRoot>/assets for subdirectories that contain a config.json.
 * Also checks <buildRoot>/subpackages for mini-game subpackages.
 */
async function discoverBundles(sourcePath) {
  const bundles = [];
  const candidates = [
    path.join(sourcePath, 'assets'),
    path.join(sourcePath, 'subpackages'),
  ];
  for (const root of candidates) {
    if (!fs.existsSync(root)) continue;
    const entries = await readdir(root);
    for (const entry of entries) {
      const bundleDir = path.join(root, entry);
      try {
        const st = await stat(bundleDir);
        if (!st.isDirectory()) continue;
        const cfgPath = findBundleConfigPath(bundleDir);
        if (cfgPath) bundles.push(bundleDir);
      } catch {
        // ignore
      }
    }
  }
  return bundles;
}

/**
 * Unpack a single bundle. Returns a summary record.
 */
async function unpackBundle({ bundleDir, outputPath, verbose, flavor = 'unknown' }) {
  const cfgPath = findBundleConfigPath(bundleDir);
  if (!cfgPath) {
    throw new Error(`No config.json in ${bundleDir}`);
  }
  const raw = JSON.parse(await readFile(cfgPath, 'utf-8'));
  const cfg = parseBundleConfig(raw, bundleDir);

  logger.info(`Bundle "${cfg.name}": ${cfg.uuids.length} uuids, ${Object.keys(cfg.paths).length} paths`);

  // Main bundle assets live at assets/<path> in the editor; named bundles use assets/<name>/.
  const bundleOut = cfg.name === 'main'
    ? path.join(outputPath, 'assets')
    : path.join(outputPath, 'assets', cfg.name);
  await mkdir(bundleOut, { recursive: true });

  // Build uuid → { packUuid, position } so we can recover packed assets.
  // packs[packUuid] = [uuidIndex, uuidIndex, ...] where uuidIndex -> cfg.uuids[i].
  cfg._packIndex = {};
  for (const packUuid of Object.keys(cfg.packs)) {
    const children = cfg.packs[packUuid];
    for (let i = 0; i < children.length; i += 1) {
      const childUuid = children[i];
      cfg._packIndex[childUuid] = { packUuid, position: i };
    }
  }
  // Remember pack files we've already copied so we only copy once per bundle.
  cfg._copiedPacks = new Set();

  const result = {
    name: cfg.name,
    encrypted: cfg.encrypted,
    uuidCount: cfg.uuids.length,
    pathCount: Object.keys(cfg.paths).length,
    sceneCount: Object.keys(cfg.scenes).length,
    recovered: 0,
    missing: 0,
    warnings: [],
  };

  // Track which uuids we've already processed so we don't duplicate work when
  // a uuid appears in both `paths` and `scenes` and the catch-all uuids pass.
  const handled = new Set();

  // 1) Group paths by project path — merge Texture2D + SpriteFrame sub-assets.
  const pathGroups = new Map();
  for (const uuid of Object.keys(cfg.paths)) {
    const info = cfg.paths[uuid];
    const key = info.path || uuid;
    if (!pathGroups.has(key)) pathGroups.set(key, []);
    pathGroups.get(key).push({ uuid, info });
  }

  for (const entries of pathGroups.values()) {
    const skeletonEntry = entries.find((e) => e.info.type === 'sp.SkeletonData');
    if (skeletonEntry && flavor === '2.4.x-bundle') {
      try {
        const ok = await recoverSpinePathGroup({
          cfg,
          entries,
          bundleOut,
          peekImportDoc: (u) => peekImportDoc(cfg, u),
          globNative: (u) => globNativeByUuid(cfg, u),
        });
        for (const { uuid } of entries) handled.add(uuid);
        if (ok) result.recovered += 1;
        else result.missing += 1;
      } catch (err) {
        result.warnings.push(`${skeletonEntry.info.path}: ${err.message}`);
      }
      continue;
    }

    const textureEntry = entries.find((e) => e.info.type === 'cc.Texture2D' && !e.info.subAsset);
    const spriteEntry = entries.find((e) => e.info.type === 'cc.SpriteFrame' || e.info.subAsset);

    if (textureEntry && spriteEntry) {
      const sfDoc = await peekImportDoc(cfg, spriteEntry.uuid);
      const linked = parseSpriteFrameFromDoc(sfDoc, spriteEntry.uuid);
      try {
        const ok = await unpackAsset({
          cfg,
          uuid: textureEntry.uuid,
          info: { ...textureEntry.info, linkedSpriteFrame: linked || undefined },
          bundleOut,
          verbose,
          flavor,
        });
        handled.add(textureEntry.uuid);
        handled.add(spriteEntry.uuid);
        if (ok) result.recovered += 1;
        else result.missing += 1;
      } catch (err) {
        result.warnings.push(`${textureEntry.info.path}: ${err.message}`);
      }
      continue;
    }

    for (const { uuid, info } of entries) {
      if (info.subAsset) {
        handled.add(uuid);
        continue;
      }
      try {
        const ok = await unpackAsset({ cfg, uuid, info, bundleOut, verbose, flavor });
        handled.add(uuid);
        if (ok) result.recovered += 1;
        else result.missing += 1;
      } catch (err) {
        result.warnings.push(`${info.path}: ${err.message}`);
      }
    }
  }

  // 2) Scenes — often listed only under config.scenes, not under paths.
  for (const sceneName of Object.keys(cfg.scenes)) {
    const uuid = cfg.scenes[sceneName];
    if (!uuid || handled.has(uuid)) continue;
    // Scene names use the full `db://assets/scene/foo.fire` form in 2.4+ bundles.
    let pathStr = sceneName
      .replace(/^db:\/\/(assets\/)?/, '')
      .replace(/\.(fire|scene)$/, '');
    const bundlePrefix = `${cfg.name}/`;
    if (pathStr.startsWith(bundlePrefix)) {
      pathStr = pathStr.slice(bundlePrefix.length);
    }
    const info = { path: pathStr, type: 'cc.SceneAsset', subAsset: false };
    try {
      const ok = await unpackAsset({ cfg, uuid, info, bundleOut, verbose, flavor });
      handled.add(uuid);
      if (ok) result.recovered += 1;
      else result.missing += 1;
    } catch (err) {
      result.warnings.push(`scene ${sceneName}: ${err.message}`);
    }
  }

  // 3) UUID-only assets (in uuids[] but not in paths/scenes). Typical for
  //    packed dependencies referenced by prefabs/scenes. Extract them under
  //    _packed/<2>/<uuid> so the editor can still resolve cross-asset refs.
  const pending = cfg.uuids.filter(
    (u) => !handled.has(u) && !(cfg.redirect && cfg.redirect[u]),
  );
  const spriteByTexture = new Map();
  for (const uuid of pending) {
    const doc = await peekImportDoc(cfg, uuid);
    const sf = parseSpriteFrameFromDoc(doc, uuid);
    if (sf?.textureUuid) spriteByTexture.set(sf.textureUuid, sf);
  }

  for (const uuid of pending) {
    const linked = spriteByTexture.get(uuid);
    if (linked) {
      const info = {
        path: `Texture/${linked.name}`,
        type: 'cc.Texture2D',
        subAsset: false,
        linkedSpriteFrame: linked,
      };
      try {
        const ok = await unpackAsset({ cfg, uuid, info, bundleOut, verbose, flavor });
        handled.add(uuid);
        handled.add(linked.sfUuid);
        if (ok) result.recovered += 1;
      } catch (err) {
        logger.debug(`Texture ${uuid} failed: ${err.message}`);
      }
      continue;
    }
    if ([...spriteByTexture.values()].some((sf) => sf.sfUuid === uuid)) {
      handled.add(uuid);
      continue;
    }

    const info = {
      path: `_packed/${uuid.slice(0, 2)}/${uuid}`,
      type: null,
      subAsset: false,
    };
    try {
      const ok = await unpackAsset({ cfg, uuid, info, bundleOut, verbose, flavor });
      handled.add(uuid);
      if (ok) result.recovered += 1;
    } catch (err) {
      // These are often internal/packed — don't count as warnings.
      logger.debug(`Packed uuid ${uuid} skipped: ${err.message}`);
    }
  }

  if (flavor === '2.4.x-bundle') {
    const bootBundleDir = path.join(outputPath, '_boot', 'bundles', cfg.name);
    await mkdir(bootBundleDir, { recursive: true });
    await copyFile(cfgPath, path.join(bootBundleDir, path.basename(cfgPath)));
    for (const scriptName of ['game.js', 'index.js']) {
      const src = path.join(bundleDir, scriptName);
      if (fs.existsSync(src)) {
        await copyFile(src, path.join(bootBundleDir, scriptName));
        result.scriptBundle = scriptName;
      }
    }
  } else {
    await copyFile(cfgPath, path.join(bundleOut, 'config.original.json'));
    for (const scriptName of ['game.js', 'index.js']) {
      const src = path.join(bundleDir, scriptName);
      if (fs.existsSync(src)) {
        await copyFile(src, path.join(bundleOut, scriptName));
        result.scriptBundle = scriptName;
      }
    }
  }

  return result;
}

async function unpackAsset({ cfg, uuid, info, bundleOut, verbose, flavor = 'unknown' }) {
  const importSrc = getImportPath(cfg, uuid, '.json');
  const importSrcCcon = getImportPath(cfg, uuid, '.cconb');
  const nativeExt = cfg.extensionMap[uuid] || null;
  const nativeSrc = nativeExt ? getNativePath(cfg, uuid, nativeExt) : null;

  let className = info.type || 'cc.Asset';
  const outDir = classOutputDir(className);
  const relPath = info.path || `${outDir}/${uuid}`;
  const outBase = path.join(bundleOut, relPath);
  await mkdir(path.dirname(outBase), { recursive: true });

  let importDoc = null;
  let importFromCcon = false;
  let importPackRef = null;
  let importRecovered = false;
  let nativeRecovered = false;
  let resolvedNativeExt = nativeExt || null;

  if (fs.existsSync(importSrc)) {
    const buf = await readFile(importSrc);
    if (isCcon(buf)) {
      importDoc = await decodeCconToDoc(buf, outBase);
      importFromCcon = true;
    } else {
      try {
        importDoc = JSON.parse(buf.toString('utf-8'));
      } catch {
        importDoc = null;
      }
    }
    if (importDoc !== null) importRecovered = true;
  } else if (fs.existsSync(importSrcCcon)) {
    const buf = await readFile(importSrcCcon);
    importDoc = await decodeCconToDoc(buf, outBase);
    importFromCcon = true;
    if (importDoc !== null) importRecovered = true;
  }

  if (!importRecovered && cfg._packIndex && cfg._packIndex[uuid]) {
    const { packUuid, position } = cfg._packIndex[uuid];
    const section = await extractPackSection(cfg, packUuid, position);
    if (section) {
      const disabled = process.env.CC_REVERSE_NO_REHYDRATE === '1';
      importDoc = disabled ? section : (tryRehydrate(section) || section);
      importPackRef = { packUuid, position };
      importRecovered = true;
    }
  }

  if (importDoc) {
    const disabled = process.env.CC_REVERSE_NO_REHYDRATE === '1';
    const normalizedDoc = disabled
      ? importDoc
      : (tryRehydrate(importDoc) || importDoc);
    className = resolveDocClassName(normalizedDoc, className);

    let editorDoc = normalizedDoc;
    if (flavor === '2.4.x-bundle') {
      editorDoc = JSON.parse(JSON.stringify(normalizedDoc));
      if (Array.isArray(editorDoc)) {
        expandEditorFormat(editorDoc);
        expandEditorUuids(editorDoc);
      } else {
        expandEditorUuids(editorDoc);
      }
    }

    if (flavor === '2.4.x-bundle' && className === 'cc.SpriteAtlas') {
      let textureUuidHint = null;
      if (cfg.paths && cfg.paths[uuid]) {
        const assetPath = cfg.paths[uuid].path;
        const sibling = Object.entries(cfg.paths).find(
          ([, info]) => info.path === assetPath && info.type === 'cc.Texture2D' && !info.subAsset,
        );
        if (sibling) textureUuidHint = uuidUtils.decodeUuid(sibling[0]);
      }
      const atlasOk = await recoverSpriteAtlasPlist({
        cfg,
        uuid,
        outBase,
        doc: editorDoc,
        peekImportDoc: (u) => peekImportDoc(cfg, u),
        textureUuidHint,
      });
      if (atlasOk) return true;
    }

    if (flavor === '2.4.x-bundle' && className === 'cc.EffectAsset') {
      const effectOk = await recoverEffectAsset({ uuid, outBase, doc: editorDoc });
      if (effectOk) return true;
    }

    if (flavor === '2.4.x-bundle' && className === 'cc.Material') {
      const materialOk = await recoverMaterialAsset({ uuid, outBase, doc: editorDoc });
      if (materialOk) return true;
    }

    const skipImportWrite = shouldSkipImportWrite(className);
    if (importRecovered && !skipImportWrite) {
      const outDoc = flavor === '2.4.x-bundle' ? editorDoc : normalizedDoc;
      await writeFile(
        outBase + inferImportExt(className),
        JSON.stringify(outDoc, null, 2),
      );
    }
  }

  const importExt = inferImportExt(className);

  if (importDoc && verbose) {
    const info2 = inspect(importDoc);
    if (info2.rootClass) logger.debug(`  ${info.path}  (${info2.rootClass})`);
  }

  // --- Native asset (independent of import) ---
  //   1. extensionMap entry from config.json (3.x native builds).
  //   2. `_native` value embedded in the import document (legacy plain form).
  //   3. Glob native/<prefix>/<uuid>.* on disk — this is how 2.4+ bundle
  //      builds ship, since their extensionMap is often empty.
  if (nativeSrc && fs.existsSync(nativeSrc)) {
    await copyFile(nativeSrc, outBase + (nativeExt || ''));
    resolvedNativeExt = nativeExt;
    nativeRecovered = true;
  } else {
    let probedExt = null;
    if (importDoc) probedExt = probeNativeExtension(importDoc);
    if (probedExt) {
      const probedSrc = getNativePath(cfg, uuid, probedExt);
      if (probedSrc && fs.existsSync(probedSrc)) {
        await copyFile(probedSrc, outBase + probedExt);
        resolvedNativeExt = probedExt;
        nativeRecovered = true;
      }
    }
    if (!nativeRecovered) {
      const globbed = await globNativeByUuid(cfg, uuid);
      if (globbed) {
        await copyFile(globbed.src, outBase + globbed.ext);
        resolvedNativeExt = globbed.ext;
        nativeRecovered = true;
      }
    }
  }

  const recovered = isPureNativeClass(className)
    ? nativeRecovered
    : (className === 'cc.SpriteFrame'
      ? false
      : (importRecovered || nativeRecovered));

  if (recovered && shouldWriteMeta(className, info)) {
    await writeMeta({
      outBase,
      uuid,
      className,
      wasCcon: importFromCcon,
      packRef: importPackRef,
      nativeExt: resolvedNativeExt,
      importExt,
      flavor,
      importRecovered,
      nativeRecovered,
      linkedSpriteFrame: info.linkedSpriteFrame || null,
    });
  }

  return recovered;
}

function classOutputDir(className) {
  if (!className) return 'raw';
  return CLASS_DIR[className] || 'raw';
}

async function peekImportDoc(cfg, uuid) {
  const importSrc = getImportPath(cfg, uuid, '.json');
  if (importSrc && fs.existsSync(importSrc)) {
    try {
      const raw = JSON.parse(await readFile(importSrc, 'utf-8'));
      const disabled = process.env.CC_REVERSE_NO_REHYDRATE === '1';
      return disabled ? raw : (tryRehydrate(raw) || raw);
    } catch {
      // fall through
    }
  }
  if (cfg._packIndex && cfg._packIndex[uuid]) {
    const { packUuid, position } = cfg._packIndex[uuid];
    const section = await extractPackSection(cfg, packUuid, position);
    if (section) {
      const disabled = process.env.CC_REVERSE_NO_REHYDRATE === '1';
      return disabled ? section : (tryRehydrate(section) || section);
    }
  }
  return null;
}

function resolveDocClassName(doc, fallback = 'cc.Asset') {
  if (!doc) return fallback;
  const info = inspect(doc);
  if (info.rootClass) return info.rootClass;
  if (Array.isArray(doc) && doc[0] && doc[0].__type__) return doc[0].__type__;
  if (doc.__type__) return doc.__type__;
  return fallback;
}

function parseSpriteFrameFromDoc(doc, sfUuid) {
  if (!Array.isArray(doc) || !doc[0]) return null;
  const entry = doc[0];
  if (entry.__type__ !== 'cc.SpriteFrame') return null;
  const content = entry.content || {};
  const name = content.name || 'sprite';
  let textureUuid = null;
  if (entry._textureSetter && entry._textureSetter.__uuid__) {
    textureUuid = uuidUtils.decodeUuid(entry._textureSetter.__uuid__);
  }
  const rect = Array.isArray(content.rect) ? content.rect : [0, 0, 0, 0];
  const offset = Array.isArray(content.offset) ? content.offset : [0, 0];
  const originalSize = Array.isArray(content.originalSize)
    ? content.originalSize
    : [rect[2] || 0, rect[3] || 0];
  return {
    sfUuid,
    name,
    textureUuid,
    subMeta: {
      ver: '1.0.4',
      uuid: sfUuid,
      rawTextureUuid: textureUuid,
      trimType: 'auto',
      trimThreshold: 1,
      rotated: false,
      offsetX: offset[0] || 0,
      offsetY: offset[1] || 0,
      trimX: rect[0] || 0,
      trimY: rect[1] || 0,
      width: rect[2] || 0,
      height: rect[3] || 0,
      rawWidth: originalSize[0] || 0,
      rawHeight: originalSize[1] || 0,
      borderTop: 0,
      borderBottom: 0,
      borderLeft: 0,
      borderRight: 0,
      subMetas: {},
    },
  };
}

function shouldSkipImportWrite(className) {
  return isPureNativeClass(className) || className === 'cc.SpriteFrame';
}

function shouldWriteMeta(className, info) {
  if (info.subAsset) return false;
  if (className === 'cc.SpriteFrame') return false;
  return true;
}

/**
 * Look for a `_native` string inside a legacy plain-form 3.x document and
 * return its extension (if any).
 */
/**
 * Last-resort: scan native/<2>/ for any file whose basename matches `uuid`.
 * Returns { src, ext } or null.
 */
async function globNativeByUuid(cfg, uuid) {
  const dir = path.join(cfg.baseDir, cfg.nativeBase, uuid.slice(0, 2));
  if (!fs.existsSync(dir)) return null;
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }
  // Match both "<uuid>.<ext>" and "<uuid>.<ver>.<ext>"
  for (const entry of entries) {
    if (!entry.startsWith(uuid)) continue;
    const rest = entry.slice(uuid.length);
    if (rest === '' || rest[0] !== '.') continue;
    // Strip version segment if present.
    const lastDot = rest.lastIndexOf('.');
    const ext = lastDot >= 0 ? rest.slice(lastDot) : rest;
    if (!KNOWN_NATIVE_EXTS.has(ext.toLowerCase())) {
      // Still copy unknown extensions — better than dropping the file.
    }
    return { src: path.join(dir, entry), ext };
  }

  const subDir = path.join(dir, uuid);
  try {
    const st = await stat(subDir);
    if (st.isDirectory()) {
      const nested = await readdir(subDir);
      for (const entry of nested) {
        const ext = path.extname(entry).toLowerCase();
        if (!ext) continue;
        return { src: path.join(subDir, entry), ext };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Attempt to rehydrate an IFileData tuple back to source-format JSON.
 * Returns the rehydrated array on success, null if the document isn't in a
 * form we can process (we fall back to writing the raw document as-is).
 */
/**
 * Extract one asset section out of an IPackedFileData and splice it together
 * with the pack's shared header to form a standalone IFileData tuple.
 *
 * IPackedFileData layout:
 *   [version, sharedUuids, sharedStrings, sharedClasses, sharedMasks, sections[]]
 * Each section is the "data area" of an IFileData:
 *   [instances, instanceTypes, refs, dependObjs, dependKeys, dependUuidIndices]
 *
 * Results are cached per-bundle so we only parse each pack file once.
 */
async function extractPackSection(cfg, packUuid, position) {
  if (!cfg._packCache) cfg._packCache = new Map();
  let pack = cfg._packCache.get(packUuid);
  if (!pack) {
    const packSrc = getImportPath(cfg, packUuid, '.json');
    if (!packSrc || !fs.existsSync(packSrc)) return null;
    try {
      pack = JSON.parse(await readFile(packSrc, 'utf-8'));
    } catch {
      pack = null;
    }
    cfg._packCache.set(packUuid, pack);
  }
  if (!Array.isArray(pack) || pack.length < 6) return null;

  const sections = pack[5];
  if (!Array.isArray(sections) || position < 0 || position >= sections.length) {
    return null;
  }
  const section = sections[position];
  if (!Array.isArray(section)) return null;

  // Splice shared header + section data into a standalone IFileData.
  // Section layout (same order as File.Instances onwards):
  //   [instances, instanceTypes, refs, dependObjs, dependKeys, dependUuidIndices]
  return [
    pack[0],                              // version
    pack[1],                              // sharedUuids
    pack[2],                              // sharedStrings
    pack[3],                              // sharedClasses
    pack[4],                              // sharedMasks
    section[0] || [],                     // instances
    section[1] || 0,                      // instanceTypes
    section[2] || null,                   // refs
    section[3] || [],                     // dependObjs
    section[4] || [],                     // dependKeys
    section[5] || [],                     // dependUuidIndices
  ];
}

function tryRehydrate(doc) {
  try {
    if (!Array.isArray(doc) || doc.length < 6) return null;
    // Skip IPackedFileData ({ sections: [...] }) for now — would need to
    // split each section out to its own file. Preserving raw JSON is fine.
    if (doc && typeof doc === 'object' && Array.isArray(doc.sections)) return null;
    return rehydrateIFileData(doc);
  } catch {
    return null;
  }
}

function probeNativeExtension(doc) {
  const visit = (obj, depth) => {
    if (!obj || typeof obj !== 'object' || depth > 4) return null;
    if (typeof obj._native === 'string' && obj._native.length > 0) {
      const n = obj._native;
      const m = n.match(/(\.[A-Za-z0-9]{2,5})$/);
      if (m && KNOWN_NATIVE_EXTS.has(m[1].toLowerCase())) return m[1];
    }
    if (Array.isArray(obj)) {
      for (const it of obj) {
        const r = visit(it, depth + 1);
        if (r) return r;
      }
      return null;
    }
    for (const k of Object.keys(obj)) {
      const r = visit(obj[k], depth + 1);
      if (r) return r;
    }
    return null;
  };
  return visit(doc, 0);
}

async function decodeCconToDoc(buf, outBase) {
  const decoded = decodeCcon(buf);
  if (decoded.version === 1 && decoded.document) {
    // Persist chunks alongside the JSON so mesh/animation payloads are not lost.
    for (let i = 0; i < decoded.chunks.length; i += 1) {
      await writeFile(`${outBase}.chunk${i}.bin`, decoded.chunks[i]);
    }
    return decoded.document;
  }
  // V2 (notepack) — preserve raw blobs; we can't currently decode.
  if (decoded.rawJson) {
    await writeFile(outBase + '.ccon-v2.rawjson', decoded.rawJson);
  }
  for (let i = 0; i < decoded.chunks.length; i += 1) {
    await writeFile(`${outBase}.chunk${i}.bin`, decoded.chunks[i]);
  }
  return null;
}

async function writeMeta({
  outBase, uuid, className, wasCcon, packRef, nativeExt, importExt, flavor,
  importRecovered, nativeRecovered, linkedSpriteFrame,
}) {
  const ext = resolveMetaExt({
    nativeExt, importExt, className, importRecovered, nativeRecovered,
  });
  const metaPath = outBase + ext + '.meta';
  const meta = buildMetaContent(
    className, uuid, flavor, wasCcon, packRef, linkedSpriteFrame,
  );
  await writeFile(metaPath, JSON.stringify(meta, null, 2));
}

function buildMetaContent(className, uuid, flavor, wasCcon, packRef, linkedSpriteFrame) {
  if (flavor === '2.4.x-bundle') {
    const base = { uuid, subMetas: {} };
    switch (className) {
      case 'cc.SceneAsset':
        return {
          ver: '1.3.2',
          ...base,
          importer: 'scene',
          asyncLoadAssets: false,
          autoReleaseAssets: false,
        };
      case 'cc.Texture2D':
      case 'cc.ImageAsset': {
        const meta = {
          ver: '2.3.7',
          ...base,
          importer: 'texture',
          type: linkedSpriteFrame ? 'sprite' : 'raw',
          wrapMode: 'clamp',
          filterMode: 'bilinear',
          premultiplyAlpha: false,
          genMipmaps: false,
          packable: true,
          platformSettings: {},
        };
        if (linkedSpriteFrame) {
          meta.subMetas = {
            [linkedSpriteFrame.name]: {
              ...linkedSpriteFrame.subMeta,
              importer: 'sprite-frame',
            },
          };
        }
        return meta;
      }
      default:
        return { ver: '1.0.0', ...base };
    }
  }

  const meta = {
    ver: '1.2.7',
    uuid,
    importer: classToImporter(className),
    downloadMode: 0,
    duration: 0,
    subMetas: {},
  };
  if (wasCcon) meta.source = 'ccon';
  if (packRef) {
    meta.packedIn = packRef.packFile;
    meta.packPosition = packRef.position;
  }
  return meta;
}

function resolveMetaExt({
  nativeExt, importExt, className, importRecovered, nativeRecovered,
}) {
  if (nativeRecovered && nativeExt) return nativeExt;
  if (importRecovered && importExt) return importExt;
  return inferMetaExt(className, importExt);
}

function inferMetaExt(className, importExt) {
  // The meta extension mirrors the asset file extension. When the asset is
  // native-only (texture/audio/font), the meta sits next to the native file.
  switch (className) {
    case 'cc.SceneAsset':    return '.fire';  // 2.4 convention; 3.x editor also reads .fire
    case 'cc.Prefab':        return '.prefab';
    case 'cc.EffectAsset':   return '.effect';
    case 'cc.Material':      return '.mtl';
    case 'cc.AnimationClip': return '.anim';
    case 'cc.SpriteFrame':   return '';       // sits next to the texture basename
    case 'cc.Texture2D':     return '';
    case 'cc.ImageAsset':    return '';
    case 'cc.AudioClip':     return '';
    case 'cc.TTFFont':       return '';
    case 'cc.BitmapFont':    return '';
    default:                 return importExt || '.json';
  }
}

function inferImportExt(className) {
  switch (className) {
    case 'cc.SceneAsset':    return '.fire';
    case 'cc.Prefab':        return '.prefab';
    case 'cc.EffectAsset':   return '.effect';
    case 'cc.Material':      return '.mtl';
    case 'cc.AnimationClip': return '.anim';
    default:                 return '.json';
  }
}

function isPureNativeClass(className) {
  switch (className) {
    case 'cc.Texture2D':
    case 'cc.ImageAsset':
    case 'cc.TextureCube':
    case 'cc.AudioClip':
    case 'cc.TTFFont':
    case 'cc.BitmapFont':
    case 'cc.LabelAtlas':
      return true;
    default:
      return false;
  }
}

function classToImporter(className) {
  if (!className) return 'asset';
  const map = {
    'cc.SceneAsset': 'scene',
    'cc.Prefab': 'prefab',
    'cc.SpriteFrame': 'sprite-frame',
    'cc.ImageAsset': 'image',
    'cc.Texture2D': 'texture',
    'cc.AudioClip': 'audio-clip',
    'cc.TextAsset': 'text',
    'cc.JsonAsset': 'json',
    'cc.Mesh': 'mesh',
    'cc.Material': 'material',
    'cc.EffectAsset': 'effect',
    'cc.AnimationClip': 'animation-clip',
    'sp.SkeletonData': 'spine',
  };
  return map[className] || 'asset';
}

async function recover24BundleScripts(sourcePath, outputPath, verbose) {
  const assetsDir = path.join(sourcePath, 'assets');
  if (!fs.existsSync(assetsDir)) return 0;

  let count = 0;
  const entries = await readdir(assetsDir);
  const ccClassPattern = /cc\._RF\.push\([^,]+,\s*"([^"]+)"\s*,\s*"([^"]+)"\)\s*,\s*(cc\.Class\(\{[\s\S]*?\}\))/g;
  const blockPattern = /cc\._RF\.push\([^,]+,\s*"([^"]+)"\s*,\s*"([^"]+)"\)\s*;([\s\S]*?)cc\._RF\.pop\(\)/g;

  for (const entry of entries) {
    if (entry === 'internal') continue;
    const indexPath = path.join(assetsDir, entry, 'index.js');
    if (!fs.existsSync(indexPath)) continue;

    const bundleName = entry;
    const scriptOut = bundleName === 'main'
      ? path.join(outputPath, 'assets', 'Script')
      : path.join(outputPath, 'assets', bundleName, 'Script');
    const text = await readFile(indexPath, 'utf-8');
    const recovered = new Set();

    let match = ccClassPattern.exec(text);
    while (match) {
      const rfId = match[1];
      const scriptName = match[2];
      recovered.add(scriptName);
      const relPath = bundleName === 'main'
        ? `assets/Script/${scriptName}.js`
        : `assets/${bundleName}/Script/${scriptName}.js`;
      await writeRecoveredScript({
        scriptOut,
        scriptName,
        ext: '.js',
        importer: 'javascript',
        source: formatRecoveredScript(match[3]),
        rfId,
        relPath,
        verbose,
      });
      count += 1;
      match = ccClassPattern.exec(text);
    }

    match = blockPattern.exec(text);
    while (match) {
      const rfId = match[1];
      const scriptName = match[2];
      if (recovered.has(scriptName)) {
        match = blockPattern.exec(text);
        continue;
      }
      const body = match[3];
      if (body.includes('cc._decorator') || body.includes('__decorate')) {
        const relPath = bundleName === 'main'
          ? `assets/Script/${scriptName}.ts`
          : `assets/${bundleName}/Script/${scriptName}.ts`;
        await writeRecoveredScript({
          scriptOut,
          scriptName,
          ext: '.ts',
          importer: 'typescript',
          source: reconstructTypeScriptScript(body),
          rfId,
          relPath,
          verbose,
        });
        recovered.add(scriptName);
        count += 1;
      }
      match = blockPattern.exec(text);
    }

    if (recovered.size > 0) {
      await writeScriptFolderMeta(scriptOut);
    }
  }

  return count;
}

async function writeRecoveredScript({
  scriptOut, scriptName, ext, importer, source, rfId, relPath, verbose,
}) {
  const scriptUuid = uuidUtils.decodeScriptRfUuid(rfId);
  await mkdir(scriptOut, { recursive: true });
  const dest = path.join(scriptOut, `${scriptName}${ext}`);
  await writeFile(dest, source);
  await writeFile(dest + '.meta', JSON.stringify({
    ver: '1.1.0',
    uuid: scriptUuid,
    importer,
    isPlugin: false,
    loadPluginInWeb: true,
    loadPluginInNative: true,
    loadPluginInEditor: false,
    subMetas: {},
  }, null, 2));
  logger.info(`Recovered script: ${relPath}`);
  if (verbose) logger.debug(`  uuid: ${scriptUuid}`);
}

function reconstructTypeScriptScript(body) {
  const props = [];
  const typedRe = /\[f\((cc\.[\w.]+)\)\],[\w.]+\.prototype,"(\w+)"/g;
  let m = typedRe.exec(body);
  while (m) {
    props.push({ name: m[2], decoratorArg: m[1], tsType: m[1] });
    m = typedRe.exec(body);
  }

  const untypedRe = /\[f\],[\w.]+\.prototype,"(\w+)"/g;
  m = untypedRe.exec(body);
  while (m) {
    if (!props.some((p) => p.name === m[1])) {
      props.push({ name: m[1], decoratorArg: null, tsType: 'string' });
    }
    m = untypedRe.exec(body);
  }

  const defaults = {};
  const defaultRe = /[\w.]+\.(\w+)=(null|"[^"]*"|'[^']*'|\d+)/g;
  m = defaultRe.exec(body);
  while (m) {
    defaults[m[1]] = m[2];
    m = defaultRe.exec(body);
  }

  const methods = [];
  const methodRe = /\.prototype\.(\w+)=function/g;
  m = methodRe.exec(body);
  while (m) {
    if (m[1] !== 'constructor') methods.push(m[1]);
    m = methodRe.exec(body);
  }

  const lines = [
    'const {ccclass, property} = cc._decorator;',
    '',
    '@ccclass',
    'export default class NewClass extends cc.Component {',
    '',
  ];

  for (const prop of props) {
    if (prop.decoratorArg) {
      lines.push(`    @property(${prop.decoratorArg})`);
    } else {
      lines.push('    @property');
    }
    const def = defaults[prop.name] != null ? defaults[prop.name] : 'null';
    lines.push(`    ${prop.name}: ${prop.tsType} = ${def};`);
    lines.push('');
  }

  for (const method of methods) {
    lines.push(`    ${method} () {`);
    lines.push('');
    lines.push('    }');
    lines.push('');
  }

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

function formatRecoveredScript(classExpr) {
  try {
    const ast = parser.parseExpression(classExpr);
    return `${generate(ast, { quotes: 'single', compact: false }).code};\n`;
  } catch {
    return `${classExpr};\n`;
  }
}

async function writeScriptFolderMeta(scriptOut) {
  const metaPath = `${scriptOut}.meta`;
  if (fs.existsSync(metaPath)) return;
  await writeFile(metaPath, JSON.stringify({
    ver: '1.1.3',
    uuid: uuidUtils.generateUuid(),
    importer: 'folder',
    isBundle: false,
    bundleName: '',
    priority: 1,
    compressionType: {},
    optimizeHotUpdate: {},
    inlineSpriteFrames: {},
    isRemoteBundle: {},
    subMetas: {},
  }, null, 2));
}

/**
 * Recover user scripts from src/chunks (SystemJS) into assets/Scripts.
 *
 * 3.x ships TypeScript compiled to ES5. We preserve filenames where possible.
 */
async function recoverScripts(sourcePath, outputPath, verbose) {
  let total = await recover24BundleScripts(sourcePath, outputPath, verbose);

  const candidates = [
    path.join(sourcePath, 'src', 'chunks'),
    path.join(sourcePath, 'src'),
    path.join(sourcePath, 'cocos-js'),
  ];
  const scriptsOut = path.join(outputPath, 'assets', 'Scripts');

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const entries = await readdir(dir);
    for (const entry of entries) {
      if (entry.endsWith('.js')) continue;
      if (entry === 'settings.js') continue;
      if (entry.startsWith('system.') || entry.startsWith('polyfills.')) continue;
      if (entry === 'cc.js') continue;
      const src = path.join(dir, entry);
      const dest = path.join(scriptsOut, entry);
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(src, dest);
      await writeScriptMeta(dest);
      if (verbose) logger.debug(`Script: ${entry}`);
      total += 1;
    }
  }

  // Recursive walk of src/assets/ (WeChat mini-game "_plugs" / plugin SDKs
  // live here as compiled .js files).
  const srcAssets = path.join(sourcePath, 'src', 'assets');
  if (fs.existsSync(srcAssets)) {
    for await (const file of walkJsFiles(srcAssets)) {
      const rel = path.relative(srcAssets, file);
      const dest = path.join(scriptsOut, 'plugs', rel);
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(file, dest);
      await writeScriptMeta(dest);
      total += 1;
    }
  }

  // Preserve top-level bootstrap scripts (main.js, game.js, ccRequire.js,
  // adapter-min.js, physics-min.js, cocos2d-js-min.js) under _boot/. These
  // aren't user code but make the recovered project runnable for inspection.
  const bootFiles = [
    'main.js', 'game.js', 'game.json', 'ccRequire.js',
    'adapter-min.js', 'physics-min.js',
  ];
  const bootOut = path.join(outputPath, '_boot');
  for (const name of bootFiles) {
    const src = path.join(sourcePath, name);
    if (fs.existsSync(src)) {
      await mkdir(bootOut, { recursive: true });
      await copyFile(src, path.join(bootOut, name));
    }
  }
  const cocosDir = path.join(sourcePath, 'cocos');
  if (fs.existsSync(cocosDir)) {
    const cocosOut = path.join(bootOut, 'cocos');
    await mkdir(cocosOut, { recursive: true });
    for (const f of await readdir(cocosDir)) {
      await copyFile(path.join(cocosDir, f), path.join(cocosOut, f));
    }
  }

  return { total };
}

async function* walkJsFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(root, e.name);
    if (e.isDirectory()) {
      yield* walkJsFiles(full);
    } else if (e.isFile() && e.name.endsWith('.js')) {
      yield full;
    }
  }
}

async function writeScriptMeta(scriptPath) {
  const meta = {
    ver: '1.0.8',
    uuid: uuidUtils.generateUuid(),
    isPlugin: false,
    loadPluginInWeb: true,
    loadPluginInNative: true,
    loadPluginInEditor: false,
    subMetas: {},
  };
  await writeFile(scriptPath + '.meta', JSON.stringify(meta, null, 2));
}

async function writeProjectDescriptor(outputPath) {
  const descriptor = {
    name: 'recovered-cocos3-project',
    version: '3.0.0',
    engine: 'cocos-creator-3',
    packages: ['assets'],
    recoveredBy: 'cc-reverse',
  };
  await writeFile(
    path.join(outputPath, 'project.json'),
    JSON.stringify(descriptor, null, 2),
  );
}

async function writeRecoveryReport(outputPath, summary, sourcePath) {
  const lines = [];
  lines.push('# Recovery Report');
  lines.push('');
  lines.push(`- Input: \`${sourcePath}\``);
  lines.push(`- Engine: ${summary.engine}`);
  lines.push('');
  lines.push('## Bundles');
  lines.push('');
  if (summary.bundles.length === 0) {
    lines.push('_No bundles recovered._');
  } else {
    lines.push('| Name | Encrypted | UUIDs | Paths | Recovered | Missing |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const b of summary.bundles) {
      lines.push(`| ${b.name} | ${b.encrypted ? 'yes' : 'no'} | ${b.uuidCount} | ${b.pathCount} | ${b.recovered} | ${b.missing} |`);
    }
  }
  lines.push('');
  lines.push(`## Scripts`);
  lines.push('');
  lines.push(`- Files recovered: ${summary.scripts.total}`);
  if (summary.warnings.length) {
    lines.push('');
    lines.push('## Warnings');
    lines.push('');
    for (const w of summary.warnings) lines.push(`- ${w}`);
  }
  await writeFile(path.join(outputPath, 'RECOVERY_REPORT.md'), lines.join('\n'));
}

module.exports = { reverseProject3x, discoverBundles };
