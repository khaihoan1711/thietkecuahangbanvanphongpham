// Simple checks shared by the login and register forms.

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

// Vietnamese phone: 10 digits starting with 0 (or +84 followed by 9 digits). Spaces, dots and dashes are ignored.
export function isValidPhone(phone: string) {
  return /^(0|\+84)\d{9}$/.test(phone.replace(/[\s.-]/g, ""));
}
