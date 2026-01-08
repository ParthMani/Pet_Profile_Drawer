import { describe, test, expect } from '@jest/globals';
import { validatePetForm, toggleAttribute } from './petForm';

describe('petForm utils', () => {
  test('validatePetForm: prevents future DOB', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-08T00:00:00.000Z'));

    const errors = validatePetForm({
      name: 'Test',
      type: 'Dog',
      breed: 'Beagle',
      gender: 'Male',
      size: 'Small',
      dob: '2026-01-09',
      weightKg: 10,
    });

    expect(errors.dob).toBe('Date cannot be in the future');
    jest.useRealTimers();
  });

  test('validatePetForm: invalid weight range (0-200) and max 2 decimals', () => {
    const base = {
      name: 'Test',
      type: 'Dog',
      breed: 'Beagle',
      gender: 'Male',
      size: 'Small' as const,
      dob: '2020-01-01',
    };

    expect(validatePetForm({ ...base, weightKg: -1 }).weightKg).toBe('Weight must be between 0 and 200');
    expect(validatePetForm({ ...base, weightKg: 201 }).weightKg).toBe('Weight must be between 0 and 200');
    expect(validatePetForm({ ...base, weightKg: 12.345 }).weightKg).toBe('Max 2 decimals');

    expect(validatePetForm({ ...base, weightKg: 0 }).weightKg).toBeUndefined();
    expect(validatePetForm({ ...base, weightKg: 200 }).weightKg).toBeUndefined();
    expect(validatePetForm({ ...base, weightKg: 12.34 }).weightKg).toBeUndefined();
  });

  test('toggleAttribute: adds and removes', () => {
    expect(toggleAttribute([], 'Barks')).toEqual(['Barks']);
    expect(toggleAttribute(['Barks'], 'Barks')).toEqual([]);
  });
});
