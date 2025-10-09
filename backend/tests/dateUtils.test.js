import { formatDate, isDateInPast, daysBetween } from '../lib/utils/dateUtils.js';

describe('Date Utilities', () => {
  test('formatDate should format date correctly', () => {
    const testDate = new Date('2023-12-25');
    const formatted = formatDate(testDate);
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // matches date format
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  test('isDateInPast should check if date is in past', () => {
    const pastDate = new Date('2020-01-01');
    const futureDate = new Date('2030-01-01');
    
    expect(isDateInPast(pastDate)).toBe(true);
    expect(isDateInPast(futureDate)).toBe(false);
    expect(isDateInPast(null)).toBe(false);
    expect(isDateInPast('')).toBe(false);
  });

  test('daysBetween should calculate days between dates', () => {
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-01-11');
    
    expect(daysBetween(date1, date2)).toBe(10);
    expect(daysBetween(date2, date1)).toBe(10); // absolute value
    expect(daysBetween(date1, date1)).toBe(0);
  });
});