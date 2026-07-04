import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyToken, hashPassword, comparePassword, isValidEmailFormat } from '../server/auth';

describe('Authentication & Password Hashing Unit Tests', () => {
  it('should correctly hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const hashedPassword = await hashPassword(rawPassword);

    expect(hashedPassword).not.toBe(rawPassword);
    expect(hashedPassword.startsWith('$2')).toBe(true);

    const isMatch = await comparePassword(rawPassword, hashedPassword);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword', hashedPassword);
    expect(isWrongMatch).toBe(false);
  });

  it('should generate and verify JWT access and refresh tokens', () => {
    const payload = {
      userId: 'usr-test-123',
      email: 'test@emoneylog.ng',
      fullName: 'Test User',
    };

    const { accessToken, refreshToken } = generateTokens(payload);
    expect(accessToken).toBeDefined();
    expect(typeof accessToken).toBe('string');
    expect(refreshToken).toBeDefined();

    const decodedAccess = verifyToken(accessToken);
    expect(decodedAccess).not.toBeNull();
    expect(decodedAccess?.userId).toBe(payload.userId);
    expect(decodedAccess?.email).toBe(payload.email);

    const decodedRefresh = verifyToken(refreshToken);
    expect(decodedRefresh).not.toBeNull();
    expect(decodedRefresh?.userId).toBe(payload.userId);
  });

  it('should return null for invalid or tampered JWT tokens', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload';
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('should validate email format accurately', () => {
    expect(isValidEmailFormat('user@emoneylog.ng')).toBe(true);
    expect(isValidEmailFormat('invalid-email')).toBe(false);
    expect(isValidEmailFormat('test@domain')).toBe(false);
  });
});
