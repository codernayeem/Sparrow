import { validatePassword, validateUserInput } from '../lib/utils/validation.js';

describe('Validation Functions', () => {
  test('validatePassword should validate password strength', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword('verylongpassword')).toBe(true);
  });

  test('validateUserInput should validate complete user input', () => {
    const validInput = validateUserInput('john', 'john@test.com', '123456');
    expect(validInput.isValid).toBe(true);
    expect(validInput.errors).toHaveLength(0);

    const invalidInput = validateUserInput('jo', 'invalid-email', '123');
    expect(invalidInput.isValid).toBe(false);
    expect(invalidInput.errors).toHaveLength(3);
    expect(invalidInput.errors).toContain('Username must be at least 3 characters');
    expect(invalidInput.errors).toContain('Valid email is required');
    expect(invalidInput.errors).toContain('Password must be at least 6 characters');
  });
});