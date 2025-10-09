// Password validation utility
export const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 6) return false;
  return true;
};

export const validateUserInput = (username, email, password) => {
  const errors = [];
  
  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};