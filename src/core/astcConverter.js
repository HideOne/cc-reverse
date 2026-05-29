/*
 * Post-process recovered assets: decode .astc with tool/astcenc-avx2.exe,
 * then encode PNG to WebP for Cocos Creator 2.4 editor compatibility.
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const { logger } = require('../utils/logger');

const execFileAsync = promisify(execFile);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const DEFAULT_ASTCENC = path.resolve(__dirname, '../../tool/astcenc-avx2.exe');
const DEFAULT_CWEBP = path.resolve(__dirname, '../../tool/cwebp.exe');
const COCOS_ASTC_MAGIC = 0x5CA1AB13;
const KHR_ASTC_HEADER = Buffer.from([0x13, 0xAB, 0xA1, 0x5C]);

/**
 * Walk a directory tree and collect all .astc file paths.
 * @param {string} rootDir
 * @returns {Promise<string[]>}
 */
async function findAstcFiles(rootDir) {
  const results = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      let st;
      try {
        st = await stat(fullPath);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        await walk(fullPath);
      } else if (entry.endsWith('.astc')) {
        results.push(fullPath);
      }
    }
  }

  await walk(rootDir);
  return results;
}

/**
 * Resolve astcenc executable path.
 * @param {string} [customPath]
 * @returns {string|null}
 */
function resolveAstcencPath(customPath) {
  const candidates = [
    customPath,
    process.env.CC_ASTCENC_PATH,
    DEFAULT_ASTCENC,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

function resolveCwebpPath(customPath) {
  const candidates = [
    customPath,
    process.env.CC_CWEBP_PATH,
    DEFAULT_CWEBP,
    'cwebp',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === 'cwebp') return candidate;
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

async function loadSharp() {
  try {
    return require('sharp');
  } catch {
    return null;
  }
}

/**
 * Cocos Creator wraps ASTC payload with a 16-byte header. Rebuild a standard
 * Khronos .astc header when astcenc cannot read the container directly.
 * @param {Buffer} buf
 * @returns {Buffer|null}
 */
function rebuildKhronosAstc(buf) {
  if (buf.length < 16) return null;
  if (buf.readUInt32LE(0) !== COCOS_ASTC_MAGIC) return null;

  const blockX = buf[4];
  const blockY = buf[5];
  const blockZ = buf[6];
  const dimX = buf[7] | (buf[8] << 8) | (buf[9] << 16);
  const dimY = buf[10] | (buf[11] << 8) | (buf[12] << 16);
  const dimZ = buf[13] | (buf[14] << 8) | (buf[15] << 16);

  const header = Buffer.alloc(16);
  KHR_ASTC_HEADER.copy(header, 0);
  header[4] = blockX;
  header[5] = blockY;
  header[6] = blockZ;
  header[7] = dimX & 0xff;
  header[8] = (dimX >> 8) & 0xff;
  header[9] = (dimX >> 16) & 0xff;
  header[10] = dimY & 0xff;
  header[11] = (dimY >> 8) & 0xff;
  header[12] = (dimY >> 16) & 0xff;
  header[13] = dimZ & 0xff;
  header[14] = (dimZ >> 8) & 0xff;
  header[15] = (dimZ >> 16) & 0xff;

  return Buffer.concat([header, buf.slice(16)]);
}

/**
 * @param {string} astcPath
 * @param {string} tempDir
 * @returns {Promise<{ inputPath: string, cleanup?: string }>}
 */
async function prepareAstcInput(astcPath, tempDir) {
  const buf = await readFile(astcPath);
  const rebuilt = rebuildKhronosAstc(buf);
  if (!rebuilt) {
    return { inputPath: astcPath };
  }

  const normalizedPath = path.join(
    tempDir,
    `${path.basename(astcPath, '.astc')}-normalized-${Date.now()}.astc`,
  );
  await writeFile(normalizedPath, rebuilt);
  return { inputPath: normalizedPath, cleanup: normalizedPath };
}

async function decodeAstcToPng(astcencPath, astcPath, pngPath, tempDir) {
  const prepared = await prepareAstcInput(astcPath, tempDir);
  try {
    await execFileAsync(astcencPath, ['-ds', prepared.inputPath, pngPath], {
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    });
  } finally {
    if (prepared.cleanup) {
      try {
        await unlink(prepared.cleanup);
      } catch {
        // ignore
      }
    }
  }
}

async function encodePngToWebp(pngPath, webpPath) {
  const sharp = await loadSharp();
  if (sharp) {
    await sharp(pngPath).webp({ quality: 90 }).toFile(webpPath);
    return 'sharp';
  }

  const cwebpPath = resolveCwebpPath(global.config?.assets?.cwebpPath);
  if (cwebpPath) {
    await execFileAsync(cwebpPath, ['-q', '90', pngPath, '-o', webpPath], {
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    });
    return cwebpPath === 'cwebp' ? 'cwebp' : path.basename(cwebpPath);
  }

  throw new Error('需要 sharp (npm install sharp) 或 cwebp 才能将解码后的 PNG 转为 WebP');
}

async function updateAstcReferencesInDir(dir, baseName) {
  const astcName = `${baseName}.astc`;
  const webpName = `${baseName}.webp`;
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const jsonPath = path.join(dir, entry);
    const text = await readFile(jsonPath, 'utf-8');
    if (!text.includes(astcName)) continue;
    await writeFile(jsonPath, text.split(astcName).join(webpName));
  }
}

/**
 * Convert a single .astc file to .webp beside it.
 * @param {object} params
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
async function convertOneAstc({
  astcPath,
  astcencPath,
  tempDir,
  verbose,
}) {
  const webpPath = astcPath.replace(/\.astc$/i, '.webp');
  const metaAstc = `${astcPath}.meta`;
  const metaWebp = `${webpPath}.meta`;
  const baseName = path.basename(astcPath, '.astc');
  const tempPng = path.join(
    tempDir,
    `${baseName}-${Date.now()}.png`,
  );

  try {
    await decodeAstcToPng(astcencPath, astcPath, tempPng, tempDir);
    const encoder = await encodePngToWebp(tempPng, webpPath);

    if (fs.existsSync(metaAstc)) {
      const meta = JSON.parse(await readFile(metaAstc, 'utf-8'));
      await writeFile(metaWebp, JSON.stringify(meta, null, 2));
      await unlink(metaAstc);
    }

    await updateAstcReferencesInDir(path.dirname(astcPath), baseName);
    await unlink(astcPath);

    if (verbose) {
      logger.debug(`ASTC -> WebP (${encoder}): ${path.basename(webpPath)}`);
    }

    return { ok: true };
  } catch (err) {
    if (fs.existsSync(webpPath)) {
      try {
        await unlink(webpPath);
      } catch {
        // ignore
      }
    }
    return { ok: false, reason: err.message || String(err) };
  } finally {
    if (fs.existsSync(tempPng)) {
      try {
        await unlink(tempPng);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Convert every .astc under output/assets to .webp.
 * @param {string} outputPath
 * @param {object} [options]
 * @returns {Promise<object>}
 */
async function convertAstcToWebp(outputPath, options = {}) {
  const assetsRoot = path.join(outputPath, 'assets');
  if (!fs.existsSync(assetsRoot)) {
    return { total: 0, converted: 0, failed: 0, skipped: true };
  }

  const astcFiles = await findAstcFiles(assetsRoot);
  if (astcFiles.length === 0) {
    if (options.verbose) logger.debug('未发现 .astc 纹理，跳过 ASTC 转换');
    return { total: 0, converted: 0, failed: 0, skipped: true };
  }

  const astcencPath = resolveAstcencPath(
    options.astcencPath || global.config?.assets?.astcencPath,
  );
  if (!astcencPath) {
    logger.warn('未找到 tool/astcenc-avx2.exe，跳过 ASTC -> WebP 转换');
    return { total: astcFiles.length, converted: 0, failed: 0, skipped: true };
  }

  const tempDir = path.join(outputPath, 'temp', 'astc-decode');
  await fs.promises.mkdir(tempDir, { recursive: true });

  const maxParallel = global.config?.advanced?.maxParallel || 4;
  logger.info(`检测到 ${astcFiles.length} 个 .astc 纹理，使用 astcenc 解码: ${astcencPath}`);

  let converted = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < astcFiles.length; i += maxParallel) {
    const batch = astcFiles.slice(i, i + maxParallel);
    const results = await Promise.all(batch.map((astcPath) => convertOneAstc({
      astcPath,
      astcencPath,
      tempDir,
      verbose: options.verbose,
    })));

    for (let j = 0; j < results.length; j += 1) {
      if (results[j].ok) converted += 1;
      else {
        failed += 1;
        failures.push({ file: batch[j], reason: results[j].reason });
        logger.warn(`ASTC 转换失败: ${batch[j]} (${results[j].reason})`);
      }
    }
  }

  logger.info(`ASTC 转换完成: ${converted} 成功, ${failed} 失败`);
  return { total: astcFiles.length, converted, failed, failures };
}

module.exports = {
  convertAstcToWebp,
  findAstcFiles,
  resolveAstcencPath,
  rebuildKhronosAstc,
};
