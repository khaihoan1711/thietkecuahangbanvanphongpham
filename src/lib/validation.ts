// Simple checks shared by the login and register forms.

// Email của khách bắt buộc là Gmail: ten@gmail.com (không phân biệt chữ hoa/thường).
export function isValidEmail(email: string) {
  return /^[a-z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

// Chỉ kiểm tra định dạng chung, dùng cho ô đăng nhập để tài khoản cũ vẫn đăng nhập được.
export function isEmailFormat(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

// Vietnamese phone: 10 digits starting with 0 (or +84 followed by 9 digits). Spaces, dots and dashes are ignored.
export function isValidPhone(phone: string) {
  return /^(0|\+84)\d{9}$/.test(phone.replace(/[\s.-]/g, ""));
}
