/**
 * نظام تسجيل بسيط للأخطاء والمعلومات
 * Simple logger utility for errors and informational messages
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN:  'WARN',
  INFO:  'INFO',
  DEBUG: 'DEBUG',
};

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Format a log entry with timestamp, level, and optional metadata.
 */
function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

const logger = {
  /**
   * Log informational messages.
   * @param {string} message
   * @param {object} [meta]
   */
  info(message, meta = {}) {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
  },

  /**
   * Log warning messages.
   * @param {string} message
   * @param {object} [meta]
   */
  warn(message, meta = {}) {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
  },

  /**
   * Log error messages. In development, the full stack trace is printed.
   * @param {string} message
   * @param {Error|object} [errorOrMeta]
   */
  error(message, errorOrMeta = {}) {
    if (errorOrMeta instanceof Error) {
      const meta = { message: errorOrMeta.message };
      if (isDevelopment) {
        meta.stack = errorOrMeta.stack;
      }
      console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
    } else {
      console.error(formatMessage(LOG_LEVELS.ERROR, message, errorOrMeta));
    }
  },

  /**
   * Log debug messages (only in non-production environments).
   * @param {string} message
   * @param {object} [meta]
   */
  debug(message, meta = {}) {
    if (isDevelopment) {
      console.debug(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  },
};

module.exports = logger;
