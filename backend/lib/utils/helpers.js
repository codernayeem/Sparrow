// Simple utility functions for testing
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
export const formatUsername = (username) => {
  return username.toLowerCase().trim();
};