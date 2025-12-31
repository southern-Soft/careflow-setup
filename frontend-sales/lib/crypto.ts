/**
 * AES-256-GCM Token Encryption for Browser
 *
 * Uses Web Crypto API for secure client-side encryption of tokens and sensitive data.
 * Configuration via environment variables:
 * - NEXT_PUBLIC_ENCRYPT_SECRETS: Enable/disable encryption
 * - NEXT_PUBLIC_CRYPTOGRAPH_IV: Initialization vector base string
 * - NEXT_PUBLIC_CRYPTOGRAPH_KEY: 32-byte hex encryption key
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM (recommended)

// ============================================================================
// Configuration
// ============================================================================

interface EncryptionConfig {
  shouldEncrypt: boolean;
  ivBase: string;
  keyHex: string;
}

/**
 * Get encryption configuration from environment variables
 */
const getEncryptionConfig = (): EncryptionConfig => {
  const shouldEncrypt =
    process.env.NEXT_PUBLIC_ENCRYPT_SECRETS === "true";
  const ivBase = process.env.NEXT_PUBLIC_CRYPTOGRAPH_IV || "";
  const keyHex = process.env.NEXT_PUBLIC_CRYPTOGRAPH_KEY || "";

  return { shouldEncrypt, ivBase, keyHex };
};

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert hex string to Uint8Array
 */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

/**
 * Convert Uint8Array to hex string
 */
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Convert string to Uint8Array using UTF-8 encoding
 */
const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * Convert Uint8Array to string using UTF-8 decoding
 */
const bytesToString = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes);
};

// ============================================================================
// Key and IV Generation
// ============================================================================

/**
 * Generate IV from base string (creates consistent IV for the session)
 * For production, consider using random IVs and storing them with the ciphertext
 */
const generateIV = (base: string): Uint8Array => {
  // Create a deterministic IV from the base string
  // Pad or truncate to exactly IV_LENGTH bytes
  const hash = base.padEnd(IV_LENGTH, "0").slice(0, IV_LENGTH);
  return stringToBytes(hash);
};

/**
 * Generate a random IV (more secure for production use)
 */
export const generateRandomIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
};

/**
 * Import encryption key from hex string
 */
const importKey = async (keyHex: string): Promise<CryptoKey> => {
  // Ensure 32 bytes (64 hex characters) for AES-256
  const normalizedKeyHex = keyHex.padEnd(64, "0").slice(0, 64);
  const keyBytes = hexToBytes(normalizedKeyHex);

  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
};

// ============================================================================
// Encryption Functions
// ============================================================================

/**
 * Encrypt a string using AES-256-GCM
 *
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in hex format (IV + ciphertext)
 */
export const encryptToken = async (plaintext: string): Promise<string> => {
  const { shouldEncrypt, ivBase, keyHex } = getEncryptionConfig();

  // Return plaintext if encryption is disabled or not configured
  if (!shouldEncrypt || !keyHex) {
    return plaintext;
  }

  try {
    const iv = generateIV(ivBase);
    const key = await importKey(keyHex);
    const plaintextBytes = stringToBytes(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      plaintextBytes
    );

    // Combine IV and ciphertext, then encode as hex
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return bytesToHex(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt token");
  }
};

/**
 * Encrypt with a random IV (more secure, includes IV in output)
 */
export const encryptWithRandomIV = async (
  plaintext: string
): Promise<string> => {
  const { shouldEncrypt, keyHex } = getEncryptionConfig();

  if (!shouldEncrypt || !keyHex) {
    return plaintext;
  }

  try {
    const iv = generateRandomIV();
    const key = await importKey(keyHex);
    const plaintextBytes = stringToBytes(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      plaintextBytes
    );

    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return bytesToHex(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt token");
  }
};

// ============================================================================
// Decryption Functions
// ============================================================================

/**
 * Decrypt an AES-256-GCM encrypted string
 *
 * @param encrypted - Encrypted hex string (IV + ciphertext)
 * @returns Decrypted plaintext string
 */
export const decryptToken = async (encrypted: string): Promise<string> => {
  const { shouldEncrypt, keyHex } = getEncryptionConfig();

  // Return as-is if encryption is disabled
  if (!shouldEncrypt || !keyHex) {
    return encrypted;
  }

  try {
    const combined = hexToBytes(encrypted);

    // Extract IV (first 12 bytes) and ciphertext (rest)
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    const key = await importKey(keyHex);

    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return bytesToString(new Uint8Array(plaintext));
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt token");
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a string appears to be encrypted (valid hex of sufficient length)
 */
export const isEncrypted = (value: string): boolean => {
  // Encrypted values are hex strings
  // Minimum length: IV (24 hex chars) + some ciphertext
  return /^[0-9a-f]+$/i.test(value) && value.length > 50;
};

/**
 * Check if encryption is enabled
 */
export const isEncryptionEnabled = (): boolean => {
  const { shouldEncrypt, keyHex } = getEncryptionConfig();
  return shouldEncrypt && !!keyHex;
};

/**
 * Safely decrypt a value (handles both encrypted and plaintext)
 *
 * @param value - Value to decrypt (may be encrypted or plaintext)
 * @returns Decrypted value, or original if decryption fails or not encrypted
 */
export const safeDecrypt = async (
  value: string | null
): Promise<string | null> => {
  if (!value) return null;

  try {
    if (isEncrypted(value)) {
      return await decryptToken(value);
    }
    return value;
  } catch {
    // If decryption fails, return original value
    // This handles cases where the value is actually plaintext
    return value;
  }
};

/**
 * Safely encrypt a value (handles encryption configuration)
 *
 * @param value - Value to encrypt
 * @returns Encrypted value, or original if encryption is disabled
 */
export const safeEncrypt = async (
  value: string | null
): Promise<string | null> => {
  if (!value) return null;

  try {
    return await encryptToken(value);
  } catch {
    // If encryption fails, return original value
    console.warn("Encryption failed, storing plaintext");
    return value;
  }
};

// ============================================================================
// Key Generation Utilities
// ============================================================================

/**
 * Generate a random encryption key (for setup/configuration)
 * Returns a 32-byte key as hex string (64 characters)
 */
export const generateEncryptionKey = (): string => {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(keyBytes);
};

/**
 * Generate a random IV base string
 * Returns a 12-character string suitable for NEXT_PUBLIC_CRYPTOGRAPH_IV
 */
export const generateIVBase = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = crypto.getRandomValues(new Uint8Array(12));
  for (let i = 0; i < 12; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};
