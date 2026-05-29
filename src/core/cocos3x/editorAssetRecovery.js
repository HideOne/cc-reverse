/*
 * Recover Cocos Creator 2.4 editor-native asset formats from bundle builds:
 *   sp.SkeletonData  -> .json + .atlas + texture
 *   cc.SpriteAtlas   -> .plist (+ texture handled separately)
 *   cc.EffectAsset   -> .effect (CCEffect source)
 *   cc.Material      -> .mtl
 */
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const { uuidUtils } = require('../../utils/uuidUtils');
const { logger } = require('../../utils/logger');
const { getImportPath } = require('./bundleConfig');
const {
  parseCreatorPackJSON,
  generateFormat3Plist,
  resolvePackOutputPath,
} = require('./jsonToPlistConverter');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

function decodeUuid(id) {
  return uuidUtils.decodeUuid(id);
}

function extractTypedItem(doc, typeName) {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.find((item) => item && item.__type__ === typeName) || doc[0] || null;
  }
  if (doc.__type__ === typeName || !typeName) return doc;
  return doc;
}

/**
 * Parse sprite frame rect data from rehydrated or compact import docs.
 * @param {*} doc
 * @returns {{ name: string, rect: number[], offset: number[], originalSize: number[], rotated: boolean }|null}
 */
function parseFrameRectFromDoc(doc) {
  if (!doc) return null;

  if (doc.name && Array.isArray(doc.rect)) {
    return extractFrameFields(doc);
  }

  if (Array.isArray(doc)) {
    if (doc[0] && doc[0].name && Array.isArray(doc[0].rect)) {
      return extractFrameFields(doc[0]);
    }
    if (Array.isArray(doc[0]) && doc[0][0] && doc[0][0].name && Array.isArray(doc[0][0].rect)) {
      return extractFrameFields(doc[0][0]);
    }
  }

  if (doc.__cc_reverse__ === 'bad-mask' && Array.isArray(doc.objectData)) {
    const inner = doc.objectData[0] && doc.objectData[0][0];
    if (inner && inner.name && Array.isArray(inner.rect)) {
      return extractFrameFields(inner);
    }
  }

  const item = extractTypedItem(doc, 'cc.SpriteFrame');
  if (!item) return null;

  const content = item.content || item;
  const name = content.name || item._name;
  const rect = Array.isArray(content.rect) ? content.rect : null;
  if (!name || !rect) return null;

  return extractFrameFields({
    name,
    rect,
    offset: content.offset,
    originalSize: content.originalSize,
    rotated: content.rotated != null ? content.rotated : item._rotated,
  });
}

function extractFrameFields(obj) {
  const rect = obj.rect;
  return {
    name: obj.name,
    rect,
    offset: Array.isArray(obj.offset) ? obj.offset : [0, 0],
    originalSize: Array.isArray(obj.originalSize)
      ? obj.originalSize
      : [rect[2] || 0, rect[3] || 0],
    rotated: obj.rotated === 1 || obj.rotated === true,
  };
}

function frameToPlistEntry(frame) {
  const [x, y, w, h] = frame.rect;
  const ox = Array.isArray(frame.offset) ? frame.offset[0] : frame.offset.x;
  const oy = Array.isArray(frame.offset) ? frame.offset[1] : frame.offset.y;
  const ow = Array.isArray(frame.originalSize) ? frame.originalSize[0] : frame.originalSize.w;
  const oh = Array.isArray(frame.originalSize) ? frame.originalSize[1] : frame.originalSize.h;
  return {
    rect: [x, y, w, h],
    offset: [ox || 0, oy || 0],
    originalSize: [ow || w, oh || h],
    rotated: !!frame.rotated,
  };
}

function computeAtlasPixelSize(frames) {
  let width = 0;
  let height = 0;
  for (const frame of Object.values(frames)) {
    const [x, y, w, h] = frame.rect;
    width = Math.max(width, x + w);
    height = Math.max(height, y + h);
  }
  return { width, height };
}

function buildPlistMeta({
  atlasUuid, textureUuid, frames, atlasWidth, atlasHeight,
}) {
  const subMetas = {};

  for (const [frameKey, frame] of Object.entries(frames)) {
    const [trimX, trimY, width, height] = frame.rect;
    const [offsetX, offsetY] = frame.offset;
    const [rawWidth, rawHeight] = frame.originalSize;
    subMetas[frameKey] = {
      ver: '1.0.6',
      uuid: frame.sfUuid ? decodeUuid(frame.sfUuid) : uuidUtils.generateUuid(),
      importer: 'sprite-frame',
      rawTextureUuid: textureUuid,
      trimType: 'auto',
      trimThreshold: 1,
      rotated: !!frame.rotated,
      offsetX,
      offsetY,
      trimX,
      trimY,
      width,
      height,
      rawWidth,
      rawHeight,
      borderTop: 0,
      borderBottom: 0,
      borderLeft: 0,
      borderRight: 0,
      spriteType: 'normal',
      subMetas: {},
    };
  }

  return {
    ver: '1.2.6',
    uuid: atlasUuid,
    importer: 'asset',
    rawTextureUuid: textureUuid,
    size: { width: atlasWidth, height: atlasHeight },
    type: 'Texture Packer',
    subMetas,
  };
}

/**
 * Write cc.SpriteAtlas as Creator 2.4 .plist (+ .plist.meta).
 */
async function recoverSpriteAtlasPlist({
  cfg, uuid, outBase, doc, peekImportDoc, textureUuidHint,
}) {
  const atlasItem = extractTypedItem(doc, 'cc.SpriteAtlas');
  if (!atlasItem) return false;

  const atlasName = atlasItem._name || path.basename(outBase);
  const plistBaseName = atlasName.endsWith('.plist')
    ? atlasName.slice(0, -6)
    : path.basename(outBase);
  const plistPath = path.join(path.dirname(outBase), `${plistBaseName}.plist`);

  const spriteFrames = atlasItem._spriteFrames || {};
  const plistFrames = {};

  for (const [frameName, ref] of Object.entries(spriteFrames)) {
    const sfUuid = ref && (ref.__uuid__ || ref);
    let frameDoc = null;
    if (sfUuid && peekImportDoc) {
      frameDoc = await peekImportDoc(sfUuid);
    }
    const parsed = parseFrameRectFromDoc(frameDoc);
    const key = frameName.endsWith('.png') ? frameName : `${frameName}.png`;
    plistFrames[key] = {
      ...frameToPlistEntry(parsed || {
        name: frameName,
        rect: [0, 0, 0, 0],
        offset: [0, 0],
        originalSize: [0, 0],
        rotated: false,
      }),
      sfUuid,
    };
  }

  const { width, height } = computeAtlasPixelSize(plistFrames);
  const textureFileName = `${plistBaseName}.png`;
  const plistXml = generateFormat3Plist(
    { textureFileName, frames: plistFrames, size: [width, height] },
    {
      textureFileName,
      smartupdate: `$TexturePacker:SmartUpdate:${uuidUtils.generateUuid()}$`,
    },
  );

  await writeFile(plistPath, plistXml);

  let textureUuid = textureUuidHint || null;
  if (!textureUuid && cfg && cfg.paths && cfg.paths[uuid]) {
    const assetPath = cfg.paths[uuid].path;
    const sibling = Object.entries(cfg.paths).find(([, info]) => (
      info.path === assetPath && info.type === 'cc.Texture2D' && !info.subAsset
    ));
    if (sibling) textureUuid = decodeUuid(sibling[0]);
  }

  const meta = buildPlistMeta({
    atlasUuid: decodeUuid(uuid),
    textureUuid: textureUuid || '',
    frames: plistFrames,
    baseName: plistBaseName,
    atlasWidth: width,
    atlasHeight: height,
  });
  await writeFile(`${plistPath}.meta`, JSON.stringify(meta, null, 2));

  const staleJson = `${outBase}.json`;
  const staleJsonMeta = `${staleJson}.meta`;
  if (fs.existsSync(staleJson)) {
    try { await promisify(fs.unlink)(staleJson); } catch { /* ignore */ }
  }
  if (fs.existsSync(staleJsonMeta)) {
    try { await promisify(fs.unlink)(staleJsonMeta); } catch { /* ignore */ }
  }

  const rel = path.basename(plistPath);
  logger.info(`Recovered sprite atlas: ${rel}`);
  return true;
}

async function copyNativeTexture({ cfg, uuid, destBase, globNative }) {
  const decoded = decodeUuid(uuid);
  const candidates = [];

  if (globNative) {
    const globbed = await globNative(uuid);
    if (globbed) candidates.push(globbed);
    if (decoded !== uuid) {
      const globbed2 = await globNative(decoded);
      if (globbed2) candidates.push(globbed2);
    }
  }

  for (const item of candidates) {
    if (!item || !item.ext.match(/^\.(png|jpg|jpeg|webp)$/i)) continue;
    const dest = destBase + item.ext;
    await copyFile(item.src, dest);
    return { copied: true, ext: item.ext, decoded };
  }
  return { copied: false, decoded };
}

/**
 * Recover a spine folder (.json + .atlas + texture) for a shared path group.
 */
async function recoverSpinePathGroup({
  cfg, entries, bundleOut, peekImportDoc, globNative,
}) {
  const skeletonEntry = entries.find((e) => e.info.type === 'sp.SkeletonData');
  if (!skeletonEntry) return false;

  const relPath = skeletonEntry.info.path
    || entries.find((e) => e.info.type === 'cc.Texture2D')?.info.path;
  if (!relPath) return false;

  const outBase = path.join(bundleOut, relPath);
  await mkdir(path.dirname(outBase), { recursive: true });

  const textureEntry = entries.find((e) => e.info.type === 'cc.Texture2D' && !e.info.subAsset);
  const atlasEntry = entries.find((e) => e.info.type === 'cc.Asset');

  const skDoc = await peekImportDoc(skeletonEntry.uuid);
  const skItem = extractTypedItem(skDoc, 'sp.SkeletonData');
  if (!skItem) return false;

  const skUuid = decodeUuid(skeletonEntry.uuid);
  const baseName = path.basename(relPath);

  if (skItem._skeletonJson) {
    const jsonText = typeof skItem._skeletonJson === 'string'
      ? skItem._skeletonJson
      : JSON.stringify(skItem._skeletonJson, null, 2);
    await writeFile(`${outBase}.json`, jsonText);
    await writeFile(`${outBase}.json.meta`, JSON.stringify({
      ver: '1.2.5',
      uuid: skUuid,
      importer: 'spine-data',
      textures: textureEntry ? [decodeUuid(textureEntry.uuid)] : [],
      scale: 1,
      subMetas: {},
    }, null, 2));
  }

  let atlasText = typeof skItem._atlasText === 'string' ? skItem._atlasText.trim() : '';
  if (!atlasText && atlasEntry && globNative) {
    const globbed = await globNative(atlasEntry.uuid);
    if (globbed && globbed.ext === '.atlas') {
      atlasText = (await promisify(fs.readFile)(globbed.src, 'utf-8')).trim();
    }
  }
  if (atlasText) {
    await writeFile(`${outBase}.atlas`, `${atlasText}\n`);
    await writeFile(`${outBase}.atlas.meta`, JSON.stringify({
      ver: '1.0.0',
      uuid: atlasEntry ? decodeUuid(atlasEntry.uuid) : uuidUtils.generateUuid(),
      subMetas: {},
    }, null, 2));
  }

  if (textureEntry) {
    const texUuid = decodeUuid(textureEntry.uuid);
    const copied = await copyNativeTexture({
      cfg, uuid: textureEntry.uuid, destBase: outBase, globNative,
    });
    const texExt = copied.copied ? copied.ext : '.png';
    await writeFile(`${outBase}${texExt}.meta`, JSON.stringify({
      ver: '2.3.7',
      uuid: texUuid,
      importer: 'texture',
      type: 'raw',
      wrapMode: 'clamp',
      filterMode: 'bilinear',
      premultiplyAlpha: false,
      genMipmaps: false,
      packable: true,
      platformSettings: {},
      subMetas: {},
    }, null, 2));
    if (!copied.copied) {
      logger.debug(`Spine texture not found in build: ${relPath}.png (${texUuid})`);
    }
  }

  logger.info(`Recovered spine: ${relPath} (.json + .atlas)`);
  return true;
}

const SPRITE_EFFECT_VS = `  precision highp float;

  #include <cc-global>
  #include <cc-local>

  in vec3 a_position;
  in vec4 a_color;
  out vec4 v_color;

  #if USE_TEXTURE
  in vec2 a_uv0;
  out vec2 v_uv0;
  #endif

  void main () {
    vec4 pos = vec4(a_position, 1);

    #if CC_USE_MODEL
    pos = cc_matViewProj * cc_matWorld * pos;
    #else
    pos = cc_matViewProj * pos;
    #endif

    #if USE_TEXTURE
    v_uv0 = a_uv0;
    #endif

    v_color = a_color;

    gl_Position = pos;
  }`;

const SPRITE_EFFECT_FS = `  precision highp float;

  #include <alpha-test>
  #include <texture>

  in vec4 v_color;

  #if USE_TEXTURE
  in vec2 v_uv0;
  uniform sampler2D texture;
  #endif

  void main () {
    vec4 o = vec4(1, 1, 1, 1);

    #if USE_TEXTURE
      CCTexture(texture, v_uv0, o);
    #endif

    o *= v_color;

    ALPHA_TEST(o);

    #if USE_BGRA
      gl_FragColor = o.bgra;
    #else
      gl_FragColor = o.rgba;
    #endif
  }`;

function isStandardSpriteEffect(shader, pass) {
  if (!shader || !shader.glsl3) return false;
  const props = pass && pass.properties ? Object.keys(pass.properties) : [];
  const onlyBaseProps = props.every((p) => p === 'texture' || p === 'alphaThreshold');
  const extraBlocks = (shader.blocks || []).filter((b) => b.name !== 'ALPHA_TEST');
  return onlyBaseProps && extraBlocks.length === 0;
}

function isStandardSpriteVertex(shader) {
  const vert = (shader.glsl3 && shader.glsl3.vert) || '';
  return vert.includes('a_position')
    && vert.includes('cc_matViewProj')
    && !vert.includes('uniform PROPERTIES')
    && !vert.includes('uniform Property');
}

function glsl3ToCCProgramBody(code) {
  if (!code) return '';
  return code.trim().split('\n').map((line) => `  ${line}`).join('\n');
}

function formatEffectPropertyValue(prop) {
  let val = prop.value;
  if (Array.isArray(val)) val = val[0];
  if (typeof val === 'string') return val;
  return val;
}

function buildCCEffectBlock(pass) {
  const lines = [
    'CCEffect %{',
    '  techniques:',
    '  - passes:',
    '    - vert: vs',
    '      frag: fs',
  ];

  if (pass.blendState && pass.blendState.targets) {
    lines.push('      blendState:', '        targets:');
    for (const t of pass.blendState.targets) {
      lines.push(`        - blend: ${t.blend ? 'true' : 'false'}`);
    }
  }

  if (pass.rasterizerState) {
    const cullMap = { 0: 'none', 1: 'front', 2: 'back' };
    const cull = cullMap[pass.rasterizerState.cullMode] ?? 'none';
    lines.push('      rasterizerState:', `        cullMode: ${cull}`);
  }

  if (pass.properties) {
    lines.push('      properties:');
    for (const [key, prop] of Object.entries(pass.properties)) {
      const val = formatEffectPropertyValue(prop);
      lines.push(`        ${key}: { value: ${val} }`);
    }
  }

  lines.push('}%', '');
  return lines.join('\n');
}

function reconstructEffectSource(item) {
  const shader = item.shaders && item.shaders[0];
  const technique = item.techniques && item.techniques[0];
  const pass = technique && technique.passes && technique.passes[0];
  if (!shader || !pass) return null;

  const header = '// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.\n\n';
  const cceffect = buildCCEffectBlock(pass);

  let vsSource;
  let fsSource;
  if (isStandardSpriteEffect(shader, pass)) {
    vsSource = SPRITE_EFFECT_VS;
    fsSource = SPRITE_EFFECT_FS;
  } else {
    vsSource = isStandardSpriteVertex(shader)
      ? SPRITE_EFFECT_VS
      : glsl3ToCCProgramBody(shader.glsl3 && shader.glsl3.vert);
    fsSource = glsl3ToCCProgramBody(shader.glsl3 && shader.glsl3.frag);
  }

  return [
    header.trimEnd(),
    cceffect,
    'CCProgram vs %{',
    vsSource,
    '}%',
    '',
    'CCProgram fs %{',
    fsSource,
    '}%',
    '',
  ].join('\n');
}

function buildEffectMeta(uuid, shader) {
  const meta = {
    ver: '1.0.27',
    uuid: decodeUuid(uuid),
    importer: 'effect',
    subMetas: {},
  };
  if (shader && shader.glsl1 && shader.glsl3) {
    meta.compiledShaders = [{
      glsl1: {
        vert: shader.glsl1.vert,
        frag: shader.glsl1.frag,
      },
      glsl3: {
        vert: shader.glsl3.vert,
        frag: shader.glsl3.frag,
      },
    }];
  }
  return meta;
}

/**
 * Write cc.EffectAsset as Creator 2.4 .effect source (+ .effect.meta).
 */
async function recoverEffectAsset({ uuid, outBase, doc }) {
  const item = extractTypedItem(doc, 'cc.EffectAsset');
  if (!item) return false;

  const source = reconstructEffectSource(item);
  if (!source) return false;

  const effectPath = `${outBase}.effect`;
  await writeFile(effectPath, source);

  const shader = item.shaders && item.shaders[0];
  await writeFile(`${effectPath}.meta`, JSON.stringify(
    buildEffectMeta(uuid, shader),
    null,
    2,
  ));

  logger.info(`Recovered effect: ${path.basename(effectPath)}`);
  return true;
}

/**
 * Write cc.Material as Creator 2.4 .mtl (+ .mtl.meta).
 */
async function recoverMaterialAsset({ uuid, outBase, doc }) {
  const item = extractTypedItem(doc, 'cc.Material');
  if (!item) return false;

  const mtl = {
    __type__: 'cc.Material',
    _name: item._name || path.basename(outBase),
    _objFlags: item._objFlags || 0,
    _native: item._native || '',
    _effectAsset: item._effectAsset || null,
    _techniqueIndex: item._techniqueIndex != null ? item._techniqueIndex : 0,
    _techniqueData: item._techniqueData || {},
  };

  const mtlPath = `${outBase}.mtl`;
  await writeFile(mtlPath, JSON.stringify(mtl, null, 2));
  await writeFile(`${mtlPath}.meta`, JSON.stringify({
    ver: '1.0.5',
    uuid: decodeUuid(uuid),
    importer: 'material',
    dataAsSubAsset: null,
    subMetas: {},
  }, null, 2));

  logger.info(`Recovered material: ${path.basename(mtlPath)}`);
  return true;
}

function computeAtlasSizeFromFontDefs(fontDefDictionary) {
  let scaleW = 0;
  let scaleH = 0;
  for (const def of Object.values(fontDefDictionary || {})) {
    const rect = def.rect || {};
    scaleW = Math.max(scaleW, (rect.x || 0) + (rect.width || 0));
    scaleH = Math.max(scaleH, (rect.y || 0) + (rect.height || 0));
  }
  return { scaleW, scaleH };
}

function reconstructFntText(item, atlasSize) {
  const cfg = item._fntConfig;
  if (!cfg || !cfg.fontDefDictionary) return null;

  const fontSize = item.fontSize || cfg.fontSize || 32;
  const lineHeight = cfg.commonHeight || fontSize;
  const { scaleW, scaleH } = atlasSize || computeAtlasSizeFromFontDefs(cfg.fontDefDictionary);
  const atlasName = cfg.atlasName || `${item._name || 'font'}.png`;
  const chars = cfg.fontDefDictionary;
  const charIds = Object.keys(chars).sort((a, b) => {
    const ra = chars[a].rect || {};
    const rb = chars[b].rect || {};
    const dx = (ra.x || 0) - (rb.x || 0);
    if (dx !== 0) return dx;
    return (ra.y || 0) - (rb.y || 0);
  });

  const lines = [
    `info face="CustomFont" size=${fontSize} bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1 outline=0`,
    `common lineHeight=${lineHeight} base=${fontSize} scaleW=${scaleW} scaleH=${scaleH} pages=1 packed=0`,
    `page id=0 file="${atlasName}"`,
    `chars count=${charIds.length}`,
  ];

  for (const id of charIds) {
    const def = chars[id];
    const rect = def.rect || {};
    lines.push([
      `char id=${id}`,
      `x=${rect.x || 0}`,
      `y=${rect.y || 0}`,
      `width=${rect.width || 0}`,
      `height=${rect.height || 0}`,
      `xoffset=${def.xOffset || 0}`,
      `yoffset=${def.yOffset || 0}`,
      `xadvance=${def.xAdvance || 0}`,
      'page=0',
      'chnl=15',
    ].join(' '));
  }

  return `${lines.join('\n')}\n`;
}

function findSiblingTextureUuid(cfg, fontUuid) {
  if (!cfg?.paths?.[fontUuid]) return null;
  const assetPath = cfg.paths[fontUuid].path;
  const sibling = Object.entries(cfg.paths).find(([, info]) => (
    info.path === assetPath && info.type === 'cc.Texture2D' && !info.subAsset
  ));
  return sibling ? decodeUuid(sibling[0]) : null;
}

/**
 * Write cc.BitmapFont as Creator 2.4 .fnt (+ .fnt.meta) from _fntConfig.
 */
async function recoverBitmapFont({ cfg, uuid, outBase, doc }) {
  const item = extractTypedItem(doc, 'cc.BitmapFont');
  if (!item || !item._fntConfig) return false;

  const atlasSize = computeAtlasSizeFromFontDefs(item._fntConfig.fontDefDictionary);
  const fntText = reconstructFntText(item, atlasSize);
  if (!fntText) return false;

  const fntPath = `${outBase}.fnt`;
  await writeFile(fntPath, fntText);
  await writeFile(`${fntPath}.meta`, JSON.stringify({
    ver: '2.1.2',
    uuid: decodeUuid(uuid),
    importer: 'bitmap-font',
    textureUuid: findSiblingTextureUuid(cfg, uuid) || '',
    fontSize: item.fontSize || item._fntConfig.fontSize || 32,
    subMetas: {},
  }, null, 2));

  logger.info(`Recovered bitmap font: ${path.basename(fntPath)}`);
  return true;
}

/**
 * Regenerate plists from bundle pack JSON (same flow as cocosRes dealRes.ts).
 * Pack files hold authoritative sprite-frame rect/rotation data.
 */
async function recoverPlistsFromPacks(cfg, bundleOut) {
  let count = 0;
  for (const packUuid of Object.keys(cfg.packs || {})) {
    const packPath = getImportPath(cfg, packUuid, '.json');
    if (!packPath || !fs.existsSync(packPath)) continue;

    let jsonData;
    try {
      jsonData = JSON.parse(await readFile(packPath, 'utf-8'));
    } catch {
      continue;
    }

    const atlasData = parseCreatorPackJSON(jsonData);
    const frameCount = Object.keys(atlasData.frames).length;
    if (frameCount === 0) continue;

    const relPath = resolvePackOutputPath(cfg, jsonData);
    if (!relPath) continue;

    const plistBase = path.basename(relPath);
    const plistPath = path.join(bundleOut, `${relPath}.plist`);
    await mkdir(path.dirname(plistPath), { recursive: true });

    const plistXml = generateFormat3Plist(atlasData, {
      textureFileName: `${plistBase}.png`,
      smartupdate: `$TexturePacker:SmartUpdate:${uuidUtils.generateUuid()}$`,
    });
    await writeFile(plistPath, plistXml);
    count += 1;
    logger.info(`Recovered sprite atlas (pack): ${path.basename(plistPath)} (${frameCount} frames)`);
  }
  return count;
}

module.exports = {
  recoverSpinePathGroup,
  recoverSpriteAtlasPlist,
  recoverPlistsFromPacks,
  recoverEffectAsset,
  recoverMaterialAsset,
  recoverBitmapFont,
  parseFrameRectFromDoc,
  frameToPlistEntry,
  reconstructFntText,
};
