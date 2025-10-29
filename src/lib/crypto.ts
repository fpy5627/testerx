/**
 * 模块：AES 加密工具（浏览器优先，Node 兼容）
 * 作用：对本地存储的测试进度与结果进行对称加密，保护隐私。
 */

/**
 * 将字符串转换为 Uint8Array。
 * @param str 输入字符串
 * @returns Uint8Array
 */
export function utf8ToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * 将 Uint8Array 转回字符串。
 * @param bytes 输入字节
 * @returns 字符串
 */
export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * base64 编码
 * @param bytes 输入字节
 * @returns base64 字符串
 */
export function toBase64(bytes: Uint8Array): string {
  if (typeof window !== 'undefined' && typeof btoa === 'function') {
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }
  // Node 兼容
  return Buffer.from(bytes).toString('base64');
}

/**
 * base64 解码
 * @param b64 base64 字符串
 * @returns Uint8Array
 */
export function fromBase64(b64: string): Uint8Array {
  if (typeof window !== 'undefined' && typeof atob === 'function') {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  // Node 兼容
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

/**
 * 通过 PBKDF2 从口令派生 AES-GCM 密钥。
 * @param password 明文口令
 * @param salt 盐值（随机）
 * @returns CryptoKey
 */
export async function deriveAesGcmKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const pwKey = await crypto.subtle.importKey(
    'raw',
    utf8ToBytes(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 生成加密随机字节。
 * @param length 字节长度
 * @returns Uint8Array
 */
export function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

/**
 * AES-GCM 加密字符串。
 * @param plaintext 明文字符串
 * @param password 口令
 * @returns base64( salt || iv || ciphertext )
 */
export async function encryptString(plaintext: string, password: string): Promise<string> {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveAesGcmKey(password, salt);
  const data = utf8ToBytes(plaintext);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  const packed = new Uint8Array(salt.length + iv.length + cipher.length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(cipher, salt.length + iv.length);
  return toBase64(packed);
}

/**
 * AES-GCM 解密字符串。
 * @param payload base64( salt || iv || ciphertext )
 * @param password 口令
 * @returns 明文字符串
 */
export async function decryptString(payload: string, password: string): Promise<string> {
  const packed = fromBase64(payload);
  const salt = packed.slice(0, 16);
  const iv = packed.slice(16, 28);
  const cipher = packed.slice(28);
  const key = await deriveAesGcmKey(password, salt);
  const plainBuf = new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
  );
  return bytesToUtf8(plainBuf);
}

/**
 * 使用 AES 对对象进行加密后存储到 localStorage。
 * @param key 存储键名
 * @param value 任意可序列化对象
 * @param password 口令
 * @returns Promise<void>
 */
export async function secureSetLocal<T>(key: string, value: T, password: string): Promise<void> {
  const json = JSON.stringify(value);
  const enc = await encryptString(json, password);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, enc);
  }
}

/**
 * 从 localStorage 读取并解密对象。
 * @param key 存储键名
 * @param password 口令
 * @returns 反序列化对象或 null
 */
export async function secureGetLocal<T>(key: string, password: string): Promise<T | null> {
  if (typeof localStorage === 'undefined') return null;
  const enc = localStorage.getItem(key);
  if (!enc) return null;
  try {
    const dec = await decryptString(enc, password);
    return JSON.parse(dec) as T;
  } catch {
    return null;
  }
}

/**
 * 删除 localStorage 指定键。
 * @param key 存储键名
 * @returns void
 */
export function secureRemoveLocal(key: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}


