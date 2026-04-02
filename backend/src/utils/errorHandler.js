const ERROR_MESSAGES = require('../constants/errorMessages');

// ─── Custom Error Classes ────────────────────────────────────────────────────

class AppError extends Error {
  constructor(message, statusCode, messageAr = null) {
    super(message);
    this.statusCode = statusCode;
    this.messageAr = messageAr;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, messageAr = null, details = []) {
    super(message, 400, messageAr);
    this.name = 'ValidationError';
    this.details = details; // array of field-level errors
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource', resourceAr = 'المورد') {
    const msg = ERROR_MESSAGES.RESOURCE.NOT_FOUND(resource);
    super(msg.en, 404, msg.ar);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(
    message = ERROR_MESSAGES.AUTH.UNAUTHORIZED.en,
    messageAr = ERROR_MESSAGES.AUTH.UNAUTHORIZED.ar
  ) {
    super(message, 401, messageAr);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(
    message = ERROR_MESSAGES.AUTH.FORBIDDEN.en,
    messageAr = ERROR_MESSAGES.AUTH.FORBIDDEN.ar
  ) {
    super(message, 403, messageAr);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends AppError {
  constructor(resource = 'Resource') {
    const msg = ERROR_MESSAGES.RESOURCE.ALREADY_EXISTS(resource);
    super(msg.en, 409, msg.ar);
    this.name = 'ConflictError';
  }
}

class BadRequestError extends AppError {
  constructor(
    message = ERROR_MESSAGES.SERVER.BAD_REQUEST.en,
    messageAr = ERROR_MESSAGES.SERVER.BAD_REQUEST.ar
  ) {
    super(message, 400, messageAr);
    this.name = 'BadRequestError';
  }
}

// ─── Global Error Handler Middleware ────────────────────────────────────────

/**
 * Express error-handling middleware.
 * Must be registered AFTER all routes with app.use(globalErrorHandler).
 */
const globalErrorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  err.statusCode = err.statusCode || 500;

  // Log non-operational (unexpected) errors in full
  if (!err.isOperational) {
    console.error('💥 UNEXPECTED ERROR:', err);
  }

  // Prisma known request errors (e.g. unique constraint, record not found)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'تعارض في البيانات - القيمة موجودة بالفعل',
      errorEn: 'Conflict - value already exists',
      field: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'السجل المطلوب غير موجود',
      errorEn: 'Record not found',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: ERROR_MESSAGES.AUTH.INVALID_TOKEN.ar,
      errorEn: ERROR_MESSAGES.AUTH.INVALID_TOKEN.en,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'انتهت صلاحية رمز المصادقة',
      errorEn: 'Authentication token has expired',
    });
  }

  // Operational errors (our custom AppError subclasses)
  if (err.isOperational) {
    const response = {
      error: err.messageAr || err.message,
      errorEn: err.message,
    };

    if (err.details && err.details.length > 0) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Fallback for unknown errors — never leak stack traces in production
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: ERROR_MESSAGES.SERVER.INTERNAL.ar,
    errorEn: ERROR_MESSAGES.SERVER.INTERNAL.en,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

// ─── 404 Route Handler ───────────────────────────────────────────────────────

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: ERROR_MESSAGES.SERVER.NOT_FOUND_ROUTE.ar,
    errorEn: ERROR_MESSAGES.SERVER.NOT_FOUND_ROUTE.en,
    path: req.originalUrl,
  });
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  globalErrorHandler,
  notFoundHandler,
};
