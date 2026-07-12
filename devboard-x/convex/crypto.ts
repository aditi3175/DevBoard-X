/**
 * Cryptographic utilities for application-level encryption.
 * Uses standard Web Crypto API supported by Convex runtime.
 */

// Helper to convert hex string to ArrayBuffer
function hexToArrayBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

// Helper to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Import the raw hex key into a CryptoKey object for AES-GCM
async function getCryptoKey(hexKey: string): Promise<CryptoKey> {
  const keyBuffer = hexToArrayBuffer(hexKey);
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false, // not extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext token using AES-256-GCM.
 * @param plaintext The token to encrypt
 * @returns A string in the format "iv_hex:ciphertext_hex"
 */
export async function encryptToken(plaintext: string): Promise<string> {
  const hexKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("Missing or invalid GITHUB_TOKEN_ENCRYPTION_KEY environment variable. Must be a 32-byte hex string (64 characters).");
  }

  const key = await getCryptoKey(hexKey);
  
  // 96-bit (12 bytes) Initialization Vector is recommended for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(plaintext);

  // encrypt() appends the auth tag to the end of the ciphertext automatically
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedText
  );

  const ivHex = arrayBufferToHex(iv.buffer);
  const encryptedHex = arrayBufferToHex(encryptedBuffer);

  return `${ivHex}:${encryptedHex}`;
}

/**
 * Decrypts a previously encrypted token.
 * @param encryptedText The string in the format "iv_hex:ciphertext_hex"
 * @returns The original plaintext token
 */
export async function decryptToken(encryptedText: string): Promise<string> {
  const hexKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error("Missing or invalid GITHUB_TOKEN_ENCRYPTION_KEY environment variable.");
  }

  const parts = encryptedText.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted token format. Expected 'iv:ciphertext'.");
  }

  const [ivHex, ciphertextHex] = parts;
  const key = await getCryptoKey(hexKey);
  const ivBuffer = hexToArrayBuffer(ivHex);
  const ciphertextBuffer = hexToArrayBuffer(ciphertextHex);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}
