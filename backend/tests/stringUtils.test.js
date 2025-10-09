import { truncateText, capitalizeFirst, removeSpecialChars } from '../lib/utils/stringUtils.js';

describe('String Utilities', () => {
  test('truncateText should truncate long text', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
    expect(truncateText('Short', 10)).toBe('Short');
    expect(truncateText('', 5)).toBe('');
    expect(truncateText(null, 5)).toBe('');
    expect(truncateText('Exact', 5)).toBe('Exact');
  });

  test('capitalizeFirst should capitalize first letter', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
    expect(capitalizeFirst('WORLD')).toBe('World');
    expect(capitalizeFirst('tEST')).toBe('Test');
    expect(capitalizeFirst('')).toBe('');
    expect(capitalizeFirst(null)).toBe('');
  });

  test('removeSpecialChars should remove special characters', () => {
    expect(removeSpecialChars('Hello@World!')).toBe('HelloWorld');
    expect(removeSpecialChars('Test#123$')).toBe('Test123');
    expect(removeSpecialChars('NoSpecialChars')).toBe('NoSpecialChars');
    expect(removeSpecialChars('')).toBe('');
    expect(removeSpecialChars('Hello World 123')).toBe('Hello World 123');
  });
});