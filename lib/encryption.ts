// Client-side encryption utilities for cart data
// Using Web Crypto API for secure encryption/decryption

interface EncryptedData {
  iv: string;
  encryptedData: string;
  salt: string;
}

class CartEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;

  // Generate a key from password using PBKDF2
  private static async deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
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

    // Derive actual encryption key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Generate a deterministic but secure password for cart encryption
  private static generateCartPassword(): string {
    // Use a combination of browser fingerprinting for consistency
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenDetails = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;

    // Create a consistent but unique identifier
    const fingerprint = `${userAgent}|${language}|${timezone}|${screenDetails}`;

    // Add a static salt for additional security
    const staticSalt = 'afilo-enterprise-cart-v1';

    return `${fingerprint}|${staticSalt}`;
  }

  // Generate random bytes
  private static generateRandomBytes(length: number): ArrayBuffer {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array.buffer;
  }

  // Convert array buffer to base64
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert base64 to array buffer
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Encrypt cart data
  static async encrypt<T>(data: T): Promise<EncryptedData> {
    try {
      // Check if Web Crypto API is available
      if (!crypto.subtle) {
        throw new Error('Web Crypto API not available');
      }

      const password = this.generateCartPassword();
      const salt = this.generateRandomBytes(this.SALT_LENGTH);
      const iv = this.generateRandomBytes(this.IV_LENGTH);

      // Derive encryption key
      const key = await this.deriveKey(password, salt);

      // Convert data to JSON string and then to array buffer
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonString);

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        dataBuffer
      );

      return {
        iv: this.arrayBufferToBase64(iv),
        encryptedData: this.arrayBufferToBase64(encryptedBuffer),
        salt: this.arrayBufferToBase64(salt)
      };

    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt cart data');
    }
  }

  // Decrypt cart data
  static async decrypt<T>(encryptedData: EncryptedData): Promise<T> {
    try {
      // Check if Web Crypto API is available
      if (!crypto.subtle) {
        throw new Error('Web Crypto API not available');
      }

      const password = this.generateCartPassword();

      // Convert base64 back to array buffers
      const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedData.salt));
      const iv = new Uint8Array(this.base64ToArrayBuffer(encryptedData.iv));
      const encrypted = this.base64ToArrayBuffer(encryptedData.encryptedData);

      // Derive decryption key
      const key = await this.deriveKey(password, salt);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encrypted
      );

      // Convert back to JSON object
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedBuffer);

      return JSON.parse(jsonString);

    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt cart data');
    }
  }

  // Check if data appears to be encrypted
  static isEncrypted(data: unknown): data is EncryptedData {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    const d = data as Record<string, unknown>;
    return (
      typeof d.iv === 'string' &&
      typeof d.encryptedData === 'string' &&
      typeof d.salt === 'string'
    );
  }

  // Fallback for when encryption is not available
  static fallbackStorage = {
    set: <T>(key: string, data: T): void => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    },

    get: <T>(key: string): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return null;
      }
    }
  };
}

// Secure storage wrapper for cart data
export class SecureCartStorage {
  private static readonly STORAGE_KEY = 'afilo-digital-cart';
  private static encryptionEnabled = true;

  // Save cart data securely
  static async save<T>(cartData: T): Promise<void> {
    try {
      if (this.encryptionEnabled && crypto.subtle) {
        // Encrypt and store
        const encrypted = await CartEncryption.encrypt<T>(cartData);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encrypted));
      } else {
        // Fallback to plain storage with warning
        console.warn('Cart encryption disabled - using fallback storage');
        CartEncryption.fallbackStorage.set(this.STORAGE_KEY, cartData);
      }
    } catch (error) {
      console.error('Failed to save cart data:', error);
      // Fallback to unencrypted storage
      CartEncryption.fallbackStorage.set(this.STORAGE_KEY, cartData);
    }
  }

  // Load cart data securely
  static async load<T>(): Promise<T | null> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);

      if (!storedData) {
        return null;
      }

      const parsedData = JSON.parse(storedData);

      // Check if data is encrypted
      if (CartEncryption.isEncrypted(parsedData)) {
        if (this.encryptionEnabled && crypto.subtle) {
          return await CartEncryption.decrypt<T>(parsedData);
        } else {
          console.warn('Cannot decrypt cart data - Web Crypto API not available');
          return null;
        }
      } else {
        // Data is not encrypted (legacy format)
        return parsedData as T;
      }

    } catch (error) {
      console.error('Failed to load cart data:', error);
      return null;
    }
  }

  // Clear cart data
  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear cart data:', error);
    }
  }

  // Disable encryption (for development/debugging)
  static disableEncryption(): void {
    this.encryptionEnabled = false;
    console.warn('Cart encryption has been disabled');
  }

  // Enable encryption
  static enableEncryption(): void {
    this.encryptionEnabled = true;
  }

  // Check if encryption is supported
  static isEncryptionSupported(): boolean {
    return !!(crypto && crypto.subtle);
  }

  // Get encryption status
  static getEncryptionStatus(): {
    supported: boolean;
    enabled: boolean;
    algorithm: string;
  } {
    return {
      supported: this.isEncryptionSupported(),
      enabled: this.encryptionEnabled,
      algorithm: CartEncryption['ALGORITHM']
    };
  }
}

export default SecureCartStorage;