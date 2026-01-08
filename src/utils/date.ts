
import { differenceInYears, differenceInMonths, parseISO, addYears, isAfter, isValid } from 'date-fns';

export interface Age {
  years: number;
  months: number;
}

export const calculateAge = (dobString: string): Age => {
  const dob = parseISO(dobString);
  if (!isValid(dob)) return { years: 0, months: 0 };
  
  const today = new Date();
  const years = differenceInYears(today, dob);
  const months = differenceInMonths(today, dob) % 12;
  
  return { years, months };
};

export const computeDueDate = (administeredDate: string): string => {
  const date = parseISO(administeredDate);
  return addYears(date, 1).toISOString().split('T')[0];
};

export const isDateInFuture = (dateString: string): boolean => {
  const date = parseISO(dateString);
  return isAfter(date, new Date());
};
