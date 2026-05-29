/*
 * Port of d:\suyu\cocosRes\src\json-to-plist-converter.ts
 * Converts Cocos Creator 2.4 bundle import JSON (pack files) to Creator format-3 plist.
 */
const { uuidUtils } = require('../../utils/uuidUtils');

/**
 * @param {any[]} jsonData Raw import/pack JSON
 * @returns {{ atlasName: string, textureFileName: string, frames: Record<string, Frame>, size: number[] }}
 */
function parseCreatorPackJSON(jsonData) {
  const actualData = jsonData[5] || [];
  /** @type {Record<string, { rect: number[], offset: number[], originalSize: number[], rotated: boolean }>} */
  const frames = {};
  let atlasName = 'atlas.plist';
  let textureFileName = 'atlas.png';
  let maxWidth = 0;
  let maxHeight = 0;

  actualData.forEach((item) => {
    if (!Array.isArray(item) || item.length === 0) return;

    const firstElement = item[0];

    if (Array.isArray(firstElement) && firstElement.length > 0) {
      const innerArray = firstElement[0];

      if (Array.isArray(innerArray) && innerArray.length >= 2
        && typeof innerArray[1] === 'string' && innerArray[1].includes('.plist')) {
        atlasName = innerArray[1];
        textureFileName = atlasName.replace(/\.plist$/i, '.png');
      } else if (typeof innerArray === 'object' && innerArray !== null && innerArray.name) {
        addFrame(frames, innerArray);
        updateMaxSize(innerArray, (w, h) => {
          maxWidth = Math.max(maxWidth, w);
          maxHeight = Math.max(maxHeight, h);
        });
      }
    } else if (typeof firstElement === 'object' && firstElement !== null && firstElement.name) {
      addFrame(frames, firstElement);
      updateMaxSize(firstElement, (w, h) => {
        maxWidth = Math.max(maxWidth, w);
        maxHeight = Math.max(maxHeight, h);
      });
    }
  });

  return { atlasName, textureFileName, frames, size: [maxWidth, maxHeight] };
}

function addFrame(frames, frame) {
  const frameName = frame.name;
  frames[frameName] = {
    rect: frame.rect || [0, 0, 0, 0],
    offset: frame.offset || [0, 0],
    originalSize: frame.originalSize || [0, 0],
    rotated: frame.rotated === 1 || frame.rotated === true,
  };
}

function updateMaxSize(frame, setter) {
  const [x, y, w, h] = frame.rect || [0, 0, 0, 0];
  setter(x + w, y + h);
}

/**
 * Build Creator / TexturePacker format-3 plist XML (matches cocosRes output).
 * Rotated frames keep logical width/height in textureRect; textureRotated marks rotation.
 */
function generateFormat3Plist(atlasData, options = {}) {
  const { textureFileName, frames, size } = atlasData;
  const texName = options.textureFileName || textureFileName;
  const smartupdate = options.smartupdate || '$TexturePacker:SmartUpdate:generated$';

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '    <dict>',
    '        <key>frames</key>',
    '        <dict>',
  ];

  for (const frameName of Object.keys(frames).sort()) {
    const frame = frames[frameName];
    const [x, y, width, height] = frame.rect;
    const [offsetX, offsetY] = frame.offset;
    const [origWidth, origHeight] = frame.originalSize;
    const key = frameName.endsWith('.png') ? frameName : `${frameName}.png`;

    lines.push(`            <key>${key}</key>`);
    lines.push('            <dict>');
    lines.push('                <key>aliases</key>');
    lines.push('                <array/>');
    lines.push('                <key>spriteOffset</key>');
    lines.push(`                <string>{${offsetX},${offsetY}}</string>`);
    lines.push('                <key>spriteSize</key>');
    lines.push(`                <string>{${origWidth},${origHeight}}</string>`);
    lines.push('                <key>spriteSourceSize</key>');
    lines.push(`                <string>{${origWidth},${origHeight}}</string>`);
    lines.push('                <key>textureRect</key>');
    lines.push(`                <string>{{${x},${y}},{${width},${height}}}</string>`);
    lines.push('                <key>textureRotated</key>');
    lines.push(`                <${frame.rotated ? 'true' : 'false'}/>`);
    lines.push('            </dict>');
  }

  lines.push('        </dict>');
  lines.push('        <key>metadata</key>');
  lines.push('        <dict>');
  lines.push('            <key>format</key>');
  lines.push('            <integer>3</integer>');
  lines.push('            <key>pixelFormat</key>');
  lines.push('            <string>RGBA8888</string>');
  lines.push('            <key>premultiplyAlpha</key>');
  lines.push('            <false/>');
  lines.push(`            <key>realTextureFileName</key><string>${texName}</string>`);
  lines.push(`            <key>size</key><string>{${size[0]},${size[1]}}</string>`);
  lines.push(`            <key>smartupdate</key><string>${smartupdate}</string>`);
  lines.push(`            <key>textureFileName</key><string>${texName}</string>`);
  lines.push('        </dict>');
  lines.push('    </dict>');
  lines.push('</plist>');
  return lines.join('\n');
}

function resolvePackOutputPath(cfg, jsonData) {
  const dep = jsonData[1] && jsonData[1][0];
  if (!dep) return null;
  const decoded = uuidUtils.decodeUuid(String(dep));
  const info = cfg.paths[decoded] || cfg.paths[String(dep)];
  return info && info.path ? info.path : null;
}

module.exports = {
  parseCreatorPackJSON,
  generateFormat3Plist,
  resolvePackOutputPath,
};
