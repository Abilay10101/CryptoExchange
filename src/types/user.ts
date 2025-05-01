export interface UserProfile {
  nickname: string;
  firstName: string;
  lastName: string;
  country: string;
  iin?: string; // Optional, only required for Kazakhstan
  uid: string;
}

export const countries = [
  'United States',
  'Kazakhstan',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Canada',
  'Australia',
  'Japan',
  // Add more countries as needed
];

export const validateIIN = (iin: string): boolean => {
  const iinRegex = /^\d{12}$/;
  return iinRegex.test(iin);
};