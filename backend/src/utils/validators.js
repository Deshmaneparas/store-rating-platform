// Validation rules based on coding challenge specifications

function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validateName(name) {
  if (!name || typeof name !== "string") return false;
  const len = name.trim().length;
  return len >= 20 && len <= 60;
}

function validateAddress(address) {
  if (!address || typeof address !== "string") return false;
  const len = address.trim().length;
  return len > 0 && len <= 400;
}

function validatePassword(password) {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8 || password.length > 16) return false;
  // Must include at least one uppercase letter and one special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  return hasUppercase && hasSpecial;
}

function validateRating(rating) {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

module.exports = {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateRating,
};
