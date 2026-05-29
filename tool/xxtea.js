var http = require('http');
var zlib = require('zlib');
var fs = require('fs');
var path = require('path');

/**
 * XXTEA 加密/解密
 */
var XXTEA = {
    DELTA: 0x9E3779B9,

    bytesToUint32Array: function (bytes) {
        var len = bytes.length;
        var n = Math.ceil(len / 4);
        var result = new Uint32Array(n);
        for (var i = 0; i < len; i++) {
            result[i >> 2] |= (bytes[i] & 0xFF) << ((i & 3) << 3);
        }
        return result;
    },

    bytesToUint32ArrayWithLength: function (bytes) {
        var len = bytes.length;
        var n = Math.ceil(len / 4) + 1;
        var result = new Uint32Array(n);
        for (var i = 0; i < len; i++) {
            result[i >> 2] |= (bytes[i] & 0xFF) << ((i & 3) << 3);
        }
        result[n - 1] = len;
        return result;
    },

    uint32ArrayToBytes: function (data, length) {
        var result = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            result[i] = (data[i >> 2] >>> ((i & 3) << 3)) & 0xFF;
        }
        return result;
    },

    uint32ArrayToBytesAll: function (data) {
        var length = data.length * 4;
        var result = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            result[i] = (data[i >> 2] >>> ((i & 3) << 3)) & 0xFF;
        }
        return result;
    },

    keyToUint32Array: function (keyBytes) {
        var k = new Uint32Array(4);
        for (var i = 0; i < 16 && i < keyBytes.length; i++) {
            k[i >> 2] |= (keyBytes[i] & 0xFF) << ((i & 3) << 3);
        }
        return k;
    },

    MX: function (z, y, sum, p, e, k) {
        return (((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z));
    },

    decrypt: function (dataBytes, keyBytes) {
        if (!dataBytes || dataBytes.length < 8) return null;

        var v = this.bytesToUint32Array(dataBytes);
        var k = this.keyToUint32Array(keyBytes);
        var n = v.length;

        if (n < 2) return null;

        var rounds = Math.floor(52 / n) + 6;
        var sum = (rounds * this.DELTA) >>> 0;
        var y = v[0];
        var z, e, p;

        while (sum !== 0) {
            e = (sum >>> 2) & 3;
            for (p = n - 1; p > 0; p--) {
                z = v[p - 1];
                v[p] = (v[p] - this.MX(z, y, sum, p, e, k)) >>> 0;
                y = v[p];
            }
            z = v[n - 1];
            v[0] = (v[0] - this.MX(z, y, sum, 0, e, k)) >>> 0;
            y = v[0];
            sum = (sum - this.DELTA) >>> 0;
        }

        var origLen = v[n - 1];
        if (origLen < (4 * n - 7) || origLen > (4 * n - 4)) {
            return null;
        }

        return this.uint32ArrayToBytes(v, origLen);
    },

    encrypt: function (dataBytes, keyBytes) {
        if (!dataBytes || dataBytes.length === 0) return null;

        var v = this.bytesToUint32ArrayWithLength(dataBytes);
        var k = this.keyToUint32Array(keyBytes);
        var n = v.length;

        if (n < 2) {
            var newV = new Uint32Array(2);
            newV[0] = v[0] || 0;
            newV[1] = dataBytes.length;
            v = newV;
            n = 2;
        }

        var rounds = Math.floor(52 / n) + 6;
        var sum = 0;
        var z = v[n - 1];
        var y, e, p;

        while (rounds-- > 0) {
            sum = (sum + this.DELTA) >>> 0;
            e = (sum >>> 2) & 3;
            for (p = 0; p < n - 1; p++) {
                y = v[p + 1];
                v[p] = (v[p] + this.MX(z, y, sum, p, e, k)) >>> 0;
                z = v[p];
            }
            y = v[0];
            v[n - 1] = (v[n - 1] + this.MX(z, y, sum, p, e, k)) >>> 0;
            z = v[n - 1];
        }

        return this.uint32ArrayToBytesAll(v);
    },

    stringToBytes: function (str) {
        var bytes = new Uint8Array(16);
        for (var i = 0; i < str.length && i < 16; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    }
};

// =============== HTTP 服务器 ===============

var KEY = "cashwin";  // 默认密钥
var DEFAULT_PORT = 3888;

// 解析命令行参数
function parseArgs() {
    var args = process.argv.slice(2);
    var config = { port: DEFAULT_PORT };

    for (var i = 0; i < args.length; i++) {
        if (args[i] === '-p' || args[i] === '--port') {
            var portNum = parseInt(args[i + 1], 10);
            if (!isNaN(portNum) && portNum > 0 && portNum < 65536) {
                config.port = portNum;
            }
            i++;
        } else if (args[i] === '-h' || args[i] === '--help') {
            console.log('');
            console.log('用法: node xxtea.js [选项]');
            console.log('');
            console.log('选项:');
            console.log('  -p, --port <端口>   指定服务器端口 (默认: ' + DEFAULT_PORT + ')');
            console.log('  -h, --help          显示帮助信息');
            console.log('');
            console.log('示例:');
            console.log('  node xxtea.js -p 8080');
            console.log('  node xxtea.js --port 3000');
            console.log('');
            process.exit(0);
        } else if (/^\d+$/.test(args[i])) {
            // 支持直接传端口号: node xxtea.js 8080
            var portNum = parseInt(args[i], 10);
            if (portNum > 0 && portNum < 65536) {
                config.port = portNum;
            }
        }
    }

    return config;
}

var CONFIG = parseArgs();
var PORT = CONFIG.port;

/**
 * 解析 multipart/form-data
 */
function parseMultipart(buffer, boundary) {
    var parts = [];
    var boundaryBuffer = Buffer.from('--' + boundary);
    var endBoundary = Buffer.from('--' + boundary + '--');

    var start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2;

    while (start < buffer.length) {
        var end = buffer.indexOf(boundaryBuffer, start);
        if (end === -1) break;

        var part = buffer.slice(start, end - 2);
        var headerEnd = part.indexOf('\r\n\r\n');

        if (headerEnd !== -1) {
            var headers = part.slice(0, headerEnd).toString();
            var content = part.slice(headerEnd + 4);

            var filenameMatch = headers.match(/filename="([^"]+)"/);
            var filename = filenameMatch ? filenameMatch[1] : 'unknown';

            parts.push({
                filename: filename,
                data: content
            });
        }

        start = end + boundaryBuffer.length + 2;
    }

    return parts;
}

/**
 * 处理文件：根据扩展名加密或解密
 */
function processFile(filename, data, customKey) {
    var key = customKey || KEY;
    var keyBytes = XXTEA.stringToBytes(key);
    var ext = path.extname(filename).toLowerCase();

    var result = {
        success: false,
        action: '',
        originalName: filename,
        outputName: '',
        data: null,
        message: ''
    };

    try {
        if (ext === '.jsc') {
            // 解密 JSC -> JS
            result.action = 'decrypt';
            result.outputName = filename.replace(/\.jsc$/i, '.js');

            var dataBytes = new Uint8Array(data);
            var decrypted = XXTEA.decrypt(dataBytes, keyBytes);

            if (!decrypted) {
                result.message = 'XXTEA 解密失败';
                return result;
            }

            // 检查是否是 GZIP
            if (decrypted[0] === 0x1f && decrypted[1] === 0x8b) {
                var decompressed = zlib.gunzipSync(Buffer.from(decrypted));
                result.data = decompressed;
            } else {
                result.data = Buffer.from(decrypted);
            }

            result.success = true;
            result.message = '解密成功';

        } else if (ext === '.js') {
            // 加密 JS -> JSC
            result.action = 'encrypt';
            result.outputName = filename.replace(/\.js$/i, '.jsc');

            // GZIP 压缩
            var compressed = zlib.gzipSync(data);

            // XXTEA 加密
            var encrypted = XXTEA.encrypt(new Uint8Array(compressed), keyBytes);

            if (!encrypted) {
                result.message = 'XXTEA 加密失败';
                return result;
            }

            result.data = Buffer.from(encrypted);
            result.success = true;
            result.message = '加密成功';

        } else {
            result.message = '不支持的文件类型，只支持 .js 和 .jsc';
        }
    } catch (e) {
        result.message = '处理失败: ' + e.message;
    }

    return result;
}


/**
 * 创建 HTTP 服务器
 */
var server = http.createServer(function (req, res) {
    // CORS 支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API 信息页面
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            name: 'XXTEA API Server',
            version: '1.0.0',
            endpoints: {
                'POST /process': '表单上传文件 (multipart/form-data)',
                'POST /api/encrypt': '直接加密二进制数据',
                'POST /api/decrypt': '直接解密二进制数据'
            },
            headers: {
                'X-Key': '自定义密钥 (可选，默认: ' + KEY + ')'
            },
            note: '前端页面请使用 index.html 单独部署'
        }, null, 2));
        return;
    }

    // 处理文件上传
    if (req.method === 'POST' && req.url === '/process') {
        var chunks = [];

        req.on('data', function (chunk) {
            chunks.push(chunk);
        });

        req.on('end', function () {
            var buffer = Buffer.concat(chunks);
            var contentType = req.headers['content-type'] || '';

            // 解析 multipart boundary
            var boundaryMatch = contentType.match(/boundary=(.+)/);
            if (!boundaryMatch) {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('无效的请求格式');
                return;
            }

            var boundary = boundaryMatch[1];
            var parts = parseMultipart(buffer, boundary);

            if (parts.length === 0) {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('未找到上传的文件');
                return;
            }

            // 获取文件和密钥
            var filePart = parts.find(p => p.filename && (p.filename.endsWith('.js') || p.filename.endsWith('.jsc')));
            var keyPart = parts.find(p => !p.filename.endsWith('.js') && !p.filename.endsWith('.jsc'));
            var customKey = keyPart ? keyPart.data.toString().trim() : null;

            if (!filePart) {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('请上传 .js 或 .jsc 文件');
                return;
            }

            // 处理文件
            var result = processFile(filePart.filename, filePart.data, customKey);

            if (result.success) {
                var outputFilename = result.outputName;
                var mimeType = outputFilename.endsWith('.js') ? 'application/javascript' : 'application/octet-stream';

                res.writeHead(200, {
                    'Content-Type': mimeType,
                    'Content-Disposition': 'attachment; filename="' + outputFilename + '"',
                    'X-Action': result.action,
                    'X-Message': encodeURIComponent(result.message)
                });
                res.end(result.data);

                console.log('[' + new Date().toISOString() + '] ' + result.action.toUpperCase() + ': ' + filePart.filename + ' -> ' + outputFilename);
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(result.message);

                console.log('[' + new Date().toISOString() + '] ERROR: ' + result.message);
            }
        });

        return;
    }

    // API: 直接处理二进制数据
    if (req.method === 'POST' && req.url.startsWith('/api/')) {
        var action = req.url.split('/')[2];  // encrypt 或 decrypt
        var chunks = [];

        req.on('data', function (chunk) {
            chunks.push(chunk);
        });

        req.on('end', function () {
            var buffer = Buffer.concat(chunks);
            var customKey = req.headers['x-key'] || KEY;
            var keyBytes = XXTEA.stringToBytes(customKey);

            try {
                var result;

                if (action === 'decrypt') {
                    var decrypted = XXTEA.decrypt(new Uint8Array(buffer), keyBytes);
                    if (decrypted && decrypted[0] === 0x1f && decrypted[1] === 0x8b) {
                        result = zlib.gunzipSync(Buffer.from(decrypted));
                    } else if (decrypted) {
                        result = Buffer.from(decrypted);
                    } else {
                        throw new Error('解密失败');
                    }
                } else if (action === 'encrypt') {
                    var compressed = zlib.gzipSync(buffer);
                    var encrypted = XXTEA.encrypt(new Uint8Array(compressed), keyBytes);
                    if (encrypted) {
                        result = Buffer.from(encrypted);
                    } else {
                        throw new Error('加密失败');
                    }
                } else {
                    throw new Error('未知操作: ' + action);
                }

                res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                res.end(result);

            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end(e.message);
            }
        });

        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

// 启动服务器
server.listen(PORT, function () {
    console.log('');
    console.log('===========================================');
    console.log('  XXTEA 加密/解密 API 服务器已启动');
    console.log('===========================================');
    console.log('');
    console.log('  API 地址: http://localhost:' + PORT);
    console.log('  默认密钥: ' + KEY);
    console.log('');
    console.log('  API 接口:');
    console.log('    GET  /            - API 信息 (JSON)');
    console.log('    POST /process     - 表单上传文件');
    console.log('    POST /api/encrypt - 直接加密二进制');
    console.log('    POST /api/decrypt - 直接解密二进制');
    console.log('');
    console.log('  前端页面: 请使用 Web 服务器部署 index.html');
    console.log('');
    console.log('  命令行参数:');
    console.log('    -p, --port <端口>  指定端口 (默认: ' + DEFAULT_PORT + ')');
    console.log('    -h, --help         显示帮助');
    console.log('');
    console.log('  按 Ctrl+C 停止服务器');
    console.log('===========================================');
    console.log('');
});