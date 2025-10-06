import CryptoJS from 'crypto-js';

export class EncryptionService {
  private deriveKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 100000
    }).toString();
  }

  encrypt(plaintext: string, masterPassword: string): string {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const key = this.deriveKey(masterPassword, salt);
    const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
    return salt + ':' + encrypted;
  }

  decrypt(ciphertext: string, masterPassword: string): string {
    const [salt, encrypted] = ciphertext.split(':');
    if (!salt || !encrypted) {
      throw new Error('Invalid ciphertext format');
    }
    const key = this.deriveKey(masterPassword, salt);
    const decrypted = CryptoJS.AES.decrypt(encrypted, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // Helper to validate encryption/decryption
  testEncryption(masterPassword: string): boolean {
    try {
      const testText = 'test-encryption';
      const encrypted = this.encrypt(testText, masterPassword);
      const decrypted = this.decrypt(encrypted, masterPassword);
      return testText === decrypted;
    } catch {
      return false;
    }
  }
}

export const encryptionService = new EncryptionService();