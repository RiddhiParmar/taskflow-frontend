// src/utils/validation.ts

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const complexityRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  if (password.length < 8) {
    errors.push('password must be a 8 characters log');
  }

  if (password.length > 128) {
    errors.push('password not be 128 characters long');
  }

  if (!complexityRegex.test(password)) {
    errors.push(
      'password should be a combination of uppercase, lowercase, number and special character'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 100;
};

export const validateTaskDescription = (description: string): boolean => {
  return description.trim().length <= 1000;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password) || /\W/.test(password)) strength++;
  if (/[0-9]/.test(password) && /\W/.test(password)) strength++;

  if (strength <= 1) return 'weak';
  if (strength === 2) return 'medium';
  return 'strong';
};
