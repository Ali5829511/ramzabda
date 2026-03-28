/**
 * دوال التحقق من صحة البيانات - Data Validation Utilities
 */

// ─── Email ───────────────────────────────────────────────────────────────────

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// ─── Password ────────────────────────────────────────────────────────────────

/**
 * Validates a password.
 * Rules: min 8 chars, at least one uppercase, one lowercase, one digit.
 * @param {string} password
 * @returns {{ valid: boolean, reason?: string }}
 */
const isValidPassword = (password) => {
  if (typeof password !== 'string') return { valid: false, reason: 'not a string' };
  if (password.length < 8) return { valid: false, reason: 'too short' };
  if (!/[A-Z]/.test(password)) return { valid: false, reason: 'missing uppercase' };
  if (!/[a-z]/.test(password)) return { valid: false, reason: 'missing lowercase' };
  if (!/[0-9]/.test(password)) return { valid: false, reason: 'missing digit' };
  return { valid: true };
};

// ─── Phone ───────────────────────────────────────────────────────────────────

/**
 * Validates a phone number (Saudi / Gulf formats supported).
 * Accepts formats: +966XXXXXXXXX, 05XXXXXXXX, 5XXXXXXXX
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-().]/g, '');
  // International format or local Saudi/Gulf
  const phoneRegex = /^(\+9665|009665|05|5)[0-9]{8}$|^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(cleaned);
};

// ─── Numbers ─────────────────────────────────────────────────────────────────

/**
 * Checks whether a value is a finite number (or a numeric string).
 * @param {*} value
 * @returns {boolean}
 */
const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(Number(value)) && isFinite(Number(value));
};

/**
 * Checks whether a value is a positive number (> 0).
 * @param {*} value
 * @returns {boolean}
 */
const isPositiveNumber = (value) => {
  return isValidNumber(value) && Number(value) > 0;
};

/**
 * Checks whether a value is a non-negative integer.
 * @param {*} value
 * @returns {boolean}
 */
const isNonNegativeInteger = (value) => {
  const n = Number(value);
  return isValidNumber(value) && Number.isInteger(n) && n >= 0;
};

// ─── Dates ───────────────────────────────────────────────────────────────────

/**
 * Checks whether a value is a valid date string or Date object.
 * @param {*} value
 * @returns {boolean}
 */
const isValidDate = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime());
};

/**
 * Checks that startDate is strictly before endDate.
 * @param {*} startDate
 * @param {*} endDate
 * @returns {boolean}
 */
const isDateRangeValid = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(startDate) < new Date(endDate);
};

// ─── Strings ─────────────────────────────────────────────────────────────────

/**
 * Checks that a string is non-empty after trimming.
 * @param {*} value
 * @returns {boolean}
 */
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Checks string length constraints.
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
const isStringLength = (value, min = 0, max = Infinity) => {
  if (typeof value !== 'string') return false;
  const len = value.trim().length;
  return len >= min && len <= max;
};

// ─── UUID ────────────────────────────────────────────────────────────────────

/**
 * Validates a UUID v4 string.
 * @param {string} value
 * @returns {boolean}
 */
const isValidUUID = (value) => {
  if (typeof value !== 'string') return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// ─── Enum ────────────────────────────────────────────────────────────────────

/**
 * Checks that a value is one of the allowed enum values.
 * @param {*} value
 * @param {Array} allowedValues
 * @returns {boolean}
 */
const isValidEnum = (value, allowedValues = []) => {
  return allowedValues.includes(value);
};

// ─── Sanitisation ────────────────────────────────────────────────────────────

/**
 * Strips leading/trailing whitespace from all string values in an object.
 * Does NOT mutate the original object.
 * @param {object} obj
 * @returns {object}
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidNumber,
  isPositiveNumber,
  isNonNegativeInteger,
  isValidDate,
  isDateRangeValid,
  isNonEmptyString,
  isStringLength,
  isValidUUID,
  isValidEnum,
  sanitizeObject,
};
