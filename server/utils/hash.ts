import crypto from 'crypto';

/**
 * Generates SHA1 hash for Garanti payment gateway
 * @param data The data to hash
 * @returns Hex encoded SHA1 hash
 */
export function generateHashSha1(data: string): string {
  try {
    const hash = crypto.createHash('sha1');
    hash.update(data, 'utf8');
    return hash.digest('hex');
  } catch (error) {
    console.error('SHA1 hash calculation error:', error);
    throw error;
  }
}

/**
 * Generates SHA512 hash for Garanti payment gateway
 * @param data The data to hash
 * @returns Hex encoded SHA512 hash
 */
export function generateHashSha512(data: string): string {
  try {
    const hash = crypto.createHash('sha512');
    hash.update(data, 'utf8');
    return hash.digest('hex');
  } catch (error) {
    console.error('SHA512 hash calculation error:', error);
    throw error;
  }
}

/**
 * Calculates HMAC-SHA512 hash for Akbank payment gateway
 * Uses UTF-8 encoding for both data and secret key as required by the gateway
 * @param data The data to hash
 * @param secretKey The secret key for HMAC
 * @returns Base64 encoded HMAC-SHA512 hash
 */
export function calculateHash(data: string, secretKey: string): string {
  try {
    // Create HMAC instance with SHA512 using UTF-8 encoded secret key
    const hmac = crypto.createHmac('sha512', Buffer.from(secretKey, 'utf8'));
    
    // Update with UTF-8 encoded data
    hmac.update(Buffer.from(data, 'utf8'));
    
    // Get base64 digest
    const hash = hmac.digest('base64');
    
    console.log('\nHash Calculation:');
    console.log('Input:', data);
    console.log('Output:', hash);
    
    return hash;
  } catch (error) {
    console.error('Hash calculation error:', error);
    throw error;
  }
}
