import { add, multiply, isValidEmail, formatUsername } from '../lib/utils/helpers.js';

describe('Helper Functions', () => {
  test('add function should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test('multiply function should multiply two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 5)).toBe(0);
  });

  test('isValidEmail should validate email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('formatUsername should format username correctly', () => {
    expect(formatUsername('  JohnDoe  ')).toBe('johndoe');
    expect(formatUsername('TESTUSER')).toBe('testuser');
    expect(formatUsername('user123')).toBe('user123');
  });
});