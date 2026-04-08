// src/utils/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  getPasswordStrength,
} from '../validation';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Weak1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('password must be a 8 characters log');
    });

    it('should reject passwords longer than 128 characters', () => {
      const result = validatePassword(`Aa1!${'a'.repeat(125)}`);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('password not be 128 characters long');
    });

    it('should reject passwords that do not meet complexity requirements', () => {
      const result = validatePassword('lowercaseonly');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'password should be a combination of uppercase, lowercase, number and special character'
      );
    });
  });

  describe('validateName', () => {
    it('should validate valid names', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('A')).toBe(false);
      expect(validateName('A'.repeat(51))).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('should return correct strength levels', () => {
      expect(getPasswordStrength('weak')).toBe('weak');
      expect(getPasswordStrength('Weak123')).toBe('medium');
      expect(getPasswordStrength('StrongPass123!')).toBe('strong');
    });
  });
});
