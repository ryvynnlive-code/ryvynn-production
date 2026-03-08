/**
 * Client-Side Encryption for RYVYNN
 * 
 * Zero-knowledge encryption for journal entries and eternity messages.
 * Uses Web Crypto API (SubtleCrypto) for AES-GCM encryption.
 * 
 * Security Model:
 * - User password → PBKDF2 → AES-256-GCM key
 * - Key never leaves client
 * - Server only stores encrypted ciphertext
 * - User owns and controls their data
 */

const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes for GCM
const ITERATIONS = 100000; // PBKDF2 iterations
const KEY_LENGTH = 256; // bits

/**
 * Derive encryption key from user password
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt text with user password
 */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Encrypt plaintext
    const plaintextBuffer = encoder.encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      plaintextBuffer
    );
    
    // Combine salt + IV + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    
    // Return base64 encoded
    return btoa(String.fromCharCode(...combined));
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text with user password
 */
export async function decryptText(encrypted: string, password: string): Promise<string> {
  try {
    // Decode base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    
    // Extract salt, IV, and ciphertext
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Decrypt ciphertext
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      ciphertext
    );
    
    // Decode to string
    const decoder = new TextDecoder();
    return decoder.decode(plaintextBuffer);
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - wrong password or corrupted data');
  }
}

/**
 * Generate a random encryption password for user
 * (Store in user's password manager or write down)
 */
export function generateEncryptionPassword(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to base64 for readability
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Validate encryption password strength
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 16) {
    return { valid: false, message: 'Password must be at least 16 characters' };
  }
  
  if (password.length < 32) {
    return { valid: true, message: 'Password strength: Medium' };
  }
  
  return { valid: true, message: 'Password strength: Strong' };
}

/**
 * Test encryption/decryption with sample data
 */
export async function testEncryption(): Promise<boolean> {
  try {
    const testData = 'Test encryption: 🔥 RYVYNN zero-knowledge vault';
    const password = generateEncryptionPassword();
    
    const encrypted = await encryptText(testData, password);
    const decrypted = await decryptText(encrypted, password);
    
    return testData === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}
