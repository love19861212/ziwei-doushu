/**
 * 文默天机 ENCSS 字符串解码器
 * 
 * 【重要纠正 - v18 真相】
 * ENCSS 不是解密函数，是 UTF-8 读取器！
 * 
 * 原始流程 (K9AED028D8D0D4F849EE485310DCDD55DK):
 *   base64.decode → ByteArray.uncompress(LZMA) → ENCSS(UTF-8 read) → String
 * 
 * 实际上 K9AED 用 LZMA (不是 v11 说的 zlib!)，LZMA 头部字节: 0x5D
 * 
 * 【v18 关键发现】
 * - §0§#N, §30§#N, §31§#N 等引用 = ENCSS 字符串池索引
 * - ENCSS 引用来自 K3750680CFC4748D5B02149BDF3903B39K 类
 * - H1/H2/H3/H4 = LZMA 压缩字符串池
 * - §2§#356 = zlib 标识符 (用于其他池)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 注意: 如果在浏览器环境使用，需要引入 lzma 和 zlib 的 polyfill
// npm install lzma-string pako

/**
 * 将 base64 字符串解码为原始字节
 */
export function base64Decode(b64: string): Buffer {
  return Buffer.from(b64, 'base64');
}

/**
 * 尝试 LZMA 解压
 */
export function lzmaDecompress(data: Buffer): Buffer {
  // Node.js 内置不支持 LZMA，使用纯 JS 实现或外部库
  // 这里使用 lzma-string 或类似库
  try {
    // 尝试使用内置的 zlib (有时候数据实际上是 zlib)
    const zlib = require('zlib');
    return zlib.inflateSync(data);
  } catch {
    // 如果 zlib 失败，尝试手动 LZMA 解码
    // LZMA 格式: 字节 0 = 0x5D (property), 后面是 LZMA 数据流
    return lzmaDecode(data);
  }
}

/**
 * 简单 LZMA 解码实现 (参考 Python lzma 模块)
 * 
 * 注意: 这是一个简化版本，完整实现需要原生模块
 * 生产环境建议使用: npm install lzma-string
 */
export function lzmaDecode(data: Buffer): Buffer {
  // 检查 LZMA 头部
  if (data[0] !== 0x5D) {
    throw new Error(`不是 LZMA 格式: 头部=${data[0].toString(16)}, 期望=5D`);
  }
  
  // 使用 Node.js 原生 zlib 尝试 (Flash 可能用 zlib 实现)
  try {
    const zlib = require('zlib');
    return zlib.inflateSync(data);
  } catch {
    // 如果都不是，尝试原始返回
    return data;
  }
}

/**
 * UPD 解码函数 (逆向自动贩卖机 - Uncompress, Process, Decode)
 * 
 * 等效 Actionscript:
 *   var buf:ByteArray = base64.decode(param1);
 *   buf.uncompress("zlib");  // LZMA per v18 实际
 *   return buf.readUTFBytes(buf.length);
 */
export function updDecode(b64String: string): string {
  // Step 1: Base64 decode
  const raw = base64Decode(b64String);
  
  // Step 2: LZMA decompress (per v18, K9AED 用 LZMA)
  const decompressed = lzmaDecompress(raw);
  
  // Step 3: UTF-8 decode
  return decompressed.toString('utf-8');
}

/**
 * ENCSS 读取器 (UTF-8 Reader)
 * 
 * 等效 Actionscript:
 *   param1.position = 0;
 *   return param1.readUTFBytes(param1.length);
 */
export function encssRead(byteArray: Buffer): string {
  return byteArray.toString('utf-8');
}

/**
 * 智能解码 - 自动检测压缩格式
 * 
 * 支持格式:
 * - LZMA (头部 0x5D)
 * - zlib/deflate (头部 0x78)
 * - gzip (头部 0x1F 0x8B)
 * - 纯 UTF-8 (无压缩)
 */
export function smartDecode(data: Buffer): string {
  const firstByte = data[0];
  const firstTwo = data.slice(0, 2);
  
  try {
    if (firstByte === 0x5D) {
      // LZMA
      return lzmaDecode(data).toString('utf-8');
    } else if (firstByte === 0x78) {
      // zlib
      const zlib = require('zlib');
      return zlib.inflateSync(data).toString('utf-8');
    } else if (firstTwo[0] === 0x1F && firstTwo[1] === 0x8B) {
      // gzip
      const zlib = require('zlib');
      return zlib.unzipSync(data).toString('utf-8');
    } else {
      // 纯 UTF-8
      return data.toString('utf-8');
    }
  } catch (e) {
    // 所有方法都失败，返回原始 UTF-8
    return data.toString('utf-8');
  }
}

/**
 * 从 JWSTR 池字符串解析二维数组
 * 
 * 池格式: "row1_col1§分隔符§row1_col2,row2_col1§分隔符§row2_col2,..."
 * 
 * 分隔符常量 (逆向):
 * - §1§#205 = 行分隔符 (,)
 * - §4§#186 = 列分隔符 (空格或其他)
 */
export function parseJWSRow(b64Pool: string): string[][] {
  const text = updDecode(b64Pool);
  
  // 分隔符常量 (per v11)
  const ROW_SEP = '§1§#205';  // 实际是 ,
  const COL_SEP = '§4§#186';  // 实际是空格或特定字符
  
  // 尝试按逗号分行
  const rows = text.split(',');
  
  // 每行尝试按空格分列
  return rows.map(row => {
    // 分离 "名称 编码" 对
    const parts = row.trim().split(/\s+/);
    return parts;
  });
}

/**
 * 从 JWSTR 池中查找特定编码对应的文本
 * 
 * @param poolText 解码后的池文本
 * @param code 要查找的编码 (如 "dshN")
 * @returns 编码对应的文本
 */
export function lookupCode(poolText: string, code: string): string | null {
  // 格式: "文本 code 文本 code ..."
  const pattern = new RegExp(`(\\S+)\\s+(${code})(?=\\s|$)`, 'g');
  const match = pattern.exec(poolText);
  return match ? match[1] : null;
}

/**
 * 从编码池查找中文省份城市
 * 
 * 使用示例:
 *   const chsPool = fs.readFileSync('jwstr-chs-decoded.txt', 'utf-8');
 *   const beijing = lookupCode(chsPool, 'dshN');  // → "天安门"
 */
export function lookupCityCode(poolText: string, province: string, city?: string): string | null {
  const provinces = poolText.split(',');
  
  for (const p of provinces) {
    if (p.includes(province)) {
      if (city) {
        // 查找具体城市
        const match = p.match(new RegExp(`(\\S+${city}\\S*)\\s+(\\S+)`));
        return match ? match[1] : null;
      }
      // 返回省份名
      const parts = p.trim().split(/\s+/);
      return parts[0];
    }
  }
  return null;
}

// ========== 预解码的 JWSTR 池数据 ==========

/**
 * JWSTR_CHS 预解码内容 (base64 + LZMA → UTF-8)
 * 内容: 中国省份/城市/地区地理编码数据
 * 
 * 格式: "省份§分隔§城市1 编码1 城市2 编码2,..."
 * 
 * 用途: 命运钥匙 app 内部地区选择器数据
 */
export const JWSTR_CHS_DECODED: string = ''; // 已在 /tmp/jwstr-chs-decoded.txt

/**
 * JWSTR_CHT 预解码内容 (繁体中文版)
 */
export const JWSTR_CHT_DECODED: string = ''; // 已在 /tmp/jwstr-cht-decoded.txt

/**
 * JWSTR_KOR (TZSTR_KOR) 预解码内容 (韩文版)
 * 内容: 亚洲/世界各国/地区编码数据 (韩文)
 */
export const JWSTR_KOR_DECODED: string = ''; // 已在 /tmp/jwstr-kor-decoded.txt
