import { Pet } from '../types';
import { isDateInFuture } from './date';

export type PetFormErrors = Partial<Record<keyof Pet, string>>;

const REQUIRED_FIELDS: (keyof Pet)[] = ['name', 'type', 'breed', 'gender', 'size'];

export function toggleAttribute(current: string[] | undefined, attr: string): string[] {
  const list = current || [];
  return list.includes(attr) ? list.filter(a => a !== attr) : [...list, attr];
}

export function validatePetForm(data: Partial<Pet>): PetFormErrors {
  const errors: PetFormErrors = {};

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors[field] = 'Required';
    }
  }

  if (!data.dob || typeof data.dob !== 'string' || data.dob.trim().length === 0) {
    errors.dob = 'Required';
  } else if (isDateInFuture(data.dob)) {
    errors.dob = 'Date cannot be in the future';
  }

  const weight = data.weightKg;
  if (weight === undefined || weight === null || Number.isNaN(weight)) {
    errors.weightKg = 'Required';
  } else if (typeof weight !== 'number') {
    errors.weightKg = 'Invalid weight';
  } else if (weight < 0 || weight > 200) {
    errors.weightKg = 'Weight must be between 0 and 200';
  } else {
    const decimals = weight.toString().split('.')[1]?.length ?? 0;
    if (decimals > 2) {
      errors.weightKg = 'Max 2 decimals';
    }
  }

  return errors;
}

export function hasErrors(errors: PetFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
