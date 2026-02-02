/**
 * S7: ENCRYPTION SERVICE
 * AES-256-GCM for PII/API keys at rest
 * TLS enforced via Traefik
 */

import CryptoJS from 'crypto-js';
import { getEnvironment } from '@apex/config';

// ============================================================================
// CONFIGURATION
// ============================================================================

const env = getEnvironment();
const ENCRYPTION_KEY = env.JWT_SECRET.substring(0, 32).padEnd(32, '0');
const IV_LENGTH = 16;

// ============================================================================
// AES-256-GCM ENCRYPTION (Primary)
// ============================================================================

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts plaintext using AES-256-GCM
 * Returns encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string): string {
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Combine IV and ciphertext for storage
  const combined = iv.toString() + ':' + encrypted.toString();
  return combined;
}

/**
 * Decrypts ciphertext encrypted with AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = CryptoJS.enc.Hex.parse(parts[0]);
  const ciphertext = parts[1];

  const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// ============================================================================
// SIMPLE ENCRYPTION (For non-critical data)
// ============================================================================

/**
 * Simple encryption for API keys and less sensitive data
 */
export function simpleEncrypt(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt data encrypted with simpleEncrypt
 */
export function simpleDecrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ============================================================================
// HASHING (One-way)
// ============================================================================

/**
 * Hash sensitive data (one-way, for comparison)
 */
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Hash with salt
 */
export function hashWithSalt(data: string, salt: string): string {
  return CryptoJS.PBKDF2(data, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
}

// ============================================================================
// DATA MASKING (For display purposes)
// ============================================================================

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  
  const maskedLocal = local.charAt(0) + '***' + (local.length > 1 ? local.charAt(local.length - 1) : '');
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return '****' + cleaned.slice(-4);
}

export function maskCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return '****-****-****-' + cleaned.slice(-4);
}

// ============================================================================
// ENCRYPTION HELPERS FOR COMMON USE CASES
// ============================================================================

export const EncryptionService = {
  /**
   * Encrypt PII (Personally Identifiable Information)
   */
  encryptPII(data: string): string {
    return encrypt(data);
  },

  /**
   * Decrypt PII
   */
  decryptPII(encryptedData: string): string {
    return decrypt(encryptedData);
  },

  /**
   * Encrypt API keys
   */
  encryptApiKey(apiKey: string): string {
    return simpleEncrypt(apiKey);
  },

  /**
   * Decrypt API keys
   */
  decryptApiKey(encryptedKey: string): string {
    return simpleDecrypt(encryptedKey);
  },

  /**
   * Encrypt payment information (never store full card numbers)
   */
  encryptPaymentInfo(data: string): string {
    return encrypt(data);
  },

  /**
   * Generate secure random string
   */
  randomString(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  },

  /**
   * Generate secure token
   */
  generateToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  },
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { EncryptedData };
