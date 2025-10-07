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

  // Generate a strong random password
  generateStrongPassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    // Ensure at least one character from each category
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
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