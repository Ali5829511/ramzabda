/**
 * Rate Limiting Middleware - حماية من الهجمات
 *
 * Implements in-memory rate limiting without external dependencies.
 * For production multi-instance deployments, replace the store with Redis.
 */

const ERROR_MESSAGES = require('../constants/errorMessages');

// ─── Token-Bucket Store ───────────────────────────────────────────────────────

class RateLimitStore {
  constructor() {
    /** @type {Map<string, { count: number, resetAt: number }>} */
    this._store = new Map();

    // Sweep expired windows every minute
    const interval = setInterval(() => this._sweep(), 60 * 1000);
    if (interval.unref) interval.unref();
  }

  /**
   * Increment the request count for `key` within a sliding window.
   * @param {string} key
   * @param {number} windowMs  - Window duration in milliseconds
   * @returns {{ count: number, resetAt: number }}
   */
  increment(key, windowMs) {
    const now = Date.now();
    const entry = this._store.get(key);

    if (!entry || now > entry.resetAt) {
      const newEntry = { count: 1, resetAt: now + windowMs };
      this._store.set(key, newEntry);
      return newEntry;
    }

    entry.count += 1;
    return entry;
  }

  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      if (now > entry.resetAt) this._store.delete(key);
    }
  }
}

const store = new RateLimitStore();

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a rate-limiting middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs   - Time window in milliseconds
 * @param {number} options.max        - Max requests per window per IP
 * @param {string} options.messageAr  - Arabic error message
 * @param {string} options.messageEn  - English error message
 * @returns {import('express').RequestHandler}
 */
const createRateLimiter = ({ windowMs, max, messageAr, messageEn }) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `rl:${req.path}:${ip}`;

    const { count, resetAt } = store.increment(key, windowMs);

    // Set standard rate-limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000));

    if (count > max) {
      const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: messageAr,
        errorEn: messageEn,
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
};

// ─── Prebuilt Limiters ────────────────────────────────────────────────────────

/**
 * General API limiter: 100 requests per 15 minutes per IP.
 */
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  messageAr: ERROR_MESSAGES.RATE_LIMIT.GENERAL.ar,
  messageEn: ERROR_MESSAGES.RATE_LIMIT.GENERAL.en,
});

/**
 * Auth endpoint limiter: 50 requests per minute per IP.
 * Applied to /api/auth/* routes to slow brute-force attacks.
 */
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  messageAr: ERROR_MESSAGES.RATE_LIMIT.AUTH.ar,
  messageEn: ERROR_MESSAGES.RATE_LIMIT.AUTH.en,
});

module.exports = { generalLimiter, authLimiter, createRateLimiter };
