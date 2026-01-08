import { describe, test, expect } from '@jest/globals';
import { calculateAge, computeDueDate } from './date';

describe('Date Utilities', () => {
  test('calculateAge: correctly computes years and months', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T00:00:00.000Z'));
    const dobString = '2024-11-15';
    const age = calculateAge(dobString);
    expect(age.years).toBe(1);
    expect(age.months).toBe(2);
    jest.useRealTimers();
  });

  test('calculateAge: handle leap year edge case', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-02-28T00:00:00.000Z'));
    const dob = '2020-02-29';
    const age = calculateAge(dob);
    expect(age.years).toBe(4);
    jest.useRealTimers();
  });

  test('calculateAge: invalid date returns 0y 0m', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-15T00:00:00.000Z'));
    const age = calculateAge('not-a-date');
    expect(age).toEqual({ years: 0, months: 0 });
    jest.useRealTimers();
  });

  test('computeDueDate: adds exactly one year', () => {
    const input = '2024-05-15';
    const expected = '2025-05-15';
    expect(computeDueDate(input)).toBe(expected);
  });
});