/**
 * Request Validation Middleware - التحقق من صحة البيانات
 *
 * Provides schema-based validation for request bodies, query strings,
 * and route parameters. Uses the validators utility internally.
 */

const {
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
} = require('../utils/validators');

const ERROR_MESSAGES = require('../constants/errorMessages');

// ─── Schema Validator ─────────────────────────────────────────────────────────

/**
 * Validates `data` against a `schema` object.
 *
 * Schema field definition:
 * {
 *   required?: boolean,
 *   type?: 'string' | 'number' | 'boolean' | 'array' | 'object',
 *   email?: boolean,
 *   password?: boolean,
 *   phone?: boolean,
 *   positiveNumber?: boolean,
 *   nonNegativeInteger?: boolean,
 *   date?: boolean,
 *   uuid?: boolean,
 *   enum?: string[],
 *   minLength?: number,
 *   maxLength?: number,
 *   min?: number,
 *   max?: number,
 * }
 *
 * @param {object} data   - The data object to validate (req.body / req.query)
 * @param {object} schema - Field definitions
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateSchema = (data, schema) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const isEmpty = value === undefined || value === null || value === '';

    // Required check
    if (rules.required && isEmpty) {
      const msg = ERROR_MESSAGES.VALIDATION.FIELD_REQUIRED(field);
      errors.push(msg.ar);
      continue; // Skip further checks for this field
    }

    // Skip optional missing fields
    if (isEmpty) continue;

    // Type check
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        const msg = ERROR_MESSAGES.VALIDATION.INVALID_TYPE(field, rules.type);
        errors.push(msg.ar);
        continue;
      }
    }

    // Email
    if (rules.email && !isValidEmail(value)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL.ar);
    }

    // Password
    if (rules.password) {
      const result = isValidPassword(value);
      if (!result.valid) {
        errors.push(ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD.ar);
      }
    }

    // Phone
    if (rules.phone && !isValidPhone(value)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_PHONE.ar);
    }

    // Positive number
    if (rules.positiveNumber && !isPositiveNumber(value)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_NUMBER.ar);
    }

    // Non-negative integer
    if (rules.nonNegativeInteger && !isNonNegativeInteger(value)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_NUMBER.ar);
    }

    // Date
    if (rules.date && !isValidDate(value)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_DATE.ar);
    }

    // UUID
    if (rules.uuid && !isValidUUID(value)) {
      const msg = ERROR_MESSAGES.VALIDATION.INVALID_TYPE(field, 'UUID');
      errors.push(msg.ar);
    }

    // Enum
    if (rules.enum && !isValidEnum(value, rules.enum)) {
      const msg = ERROR_MESSAGES.VALIDATION.INVALID_TYPE(
        field,
        rules.enum.join(' | ')
      );
      errors.push(msg.ar);
    }

    // String length
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.trim().length < rules.minLength) {
        const msg = ERROR_MESSAGES.VALIDATION.MIN_LENGTH(field, rules.minLength);
        errors.push(msg.ar);
      }
      if (rules.maxLength !== undefined && value.trim().length > rules.maxLength) {
        const msg = ERROR_MESSAGES.VALIDATION.MAX_LENGTH(field, rules.maxLength);
        errors.push(msg.ar);
      }
    }

    // Numeric range
    if (isValidNumber(value)) {
      const num = Number(value);
      if (rules.min !== undefined && num < rules.min) {
        errors.push(`الحقل "${field}" يجب أن يكون ${rules.min} على الأقل`);
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push(`الحقل "${field}" يجب ألا يتجاوز ${rules.max}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

// ─── Middleware Factory ───────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against `schema`.
 * Automatically sanitizes (trims) string fields before validation.
 *
 * @param {object} schema
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/register', validateBody(registerSchema), authController.register);
 */
const validateBody = (schema) => (req, res, next) => {
  req.body = sanitizeObject(req.body);
  const { valid, errors } = validateSchema(req.body, schema);
  if (!valid) {
    return res.status(400).json({
      error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS.ar,
      errorEn: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELDS.en,
      details: errors,
    });
  }
  next();
};

/**
 * Returns an Express middleware that validates req.query against `schema`.
 *
 * @param {object} schema
 * @returns {import('express').RequestHandler}
 */
const validateQuery = (schema) => (req, res, next) => {
  const { valid, errors } = validateSchema(req.query, schema);
  if (!valid) {
    return res.status(400).json({
      error: 'معاملات الاستعلام غير صحيحة',
      errorEn: 'Invalid query parameters',
      details: errors,
    });
  }
  next();
};

/**
 * Returns an Express middleware that validates req.params against `schema`.
 *
 * @param {object} schema
 * @returns {import('express').RequestHandler}
 */
const validateParams = (schema) => (req, res, next) => {
  const { valid, errors } = validateSchema(req.params, schema);
  if (!valid) {
    return res.status(400).json({
      error: 'معاملات المسار غير صحيحة',
      errorEn: 'Invalid route parameters',
      details: errors,
    });
  }
  next();
};

// ─── Prebuilt Schemas ─────────────────────────────────────────────────────────

const schemas = {
  register: {
    email: { required: true, type: 'string', email: true },
    password: { required: true, type: 'string', password: true },
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    phone: { required: false, type: 'string', phone: true },
    role: {
      required: false,
      type: 'string',
      enum: ['ADMIN', 'OWNER', 'TENANT', 'AGENT'],
    },
  },

  login: {
    email: { required: true, type: 'string', email: true },
    password: { required: true, type: 'string' },
  },

  createProperty: {
    title: { required: true, type: 'string', minLength: 3, maxLength: 200 },
    type: {
      required: true,
      type: 'string',
      enum: ['APARTMENT', 'VILLA', 'OFFICE', 'SHOP', 'LAND', 'WAREHOUSE'],
    },
    price: { required: true, positiveNumber: true },
    area: { required: true, positiveNumber: true },
    address: { required: true, type: 'string', minLength: 5 },
    city: { required: true, type: 'string', minLength: 2 },
  },

  createContract: {
    propertyId: { required: true, type: 'string' },
    tenantId: { required: true, type: 'string' },
    type: { required: true, type: 'string', enum: ['RENT', 'SALE'] },
    startDate: { required: true, date: true },
    endDate: { required: true, date: true },
  },

  createMaintenance: {
    title: { required: true, type: 'string', minLength: 3, maxLength: 200 },
    description: { required: true, type: 'string', minLength: 10 },
    category: { required: true, type: 'string' },
    propertyId: { required: true, type: 'string' },
    priority: {
      required: false,
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    },
  },

  createPayment: {
    contractId: { required: true, type: 'string' },
    userId: { required: true, type: 'string' },
    amount: { required: true, positiveNumber: true },
    type: { required: true, type: 'string' },
    dueDate: { required: true, date: true },
  },

  idParam: {
    id: { required: true, type: 'string' },
  },
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateSchema,
  schemas,
};
