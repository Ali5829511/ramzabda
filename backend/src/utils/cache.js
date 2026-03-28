/**
 * نظام التخزين المؤقت في الذاكرة - In-Memory Cache
 *
 * Simple TTL-based in-memory cache with automatic expiry.
 * Suitable for single-instance deployments. For multi-instance
 * deployments, replace with Redis.
 */

class MemoryCache {
  constructor() {
    /** @type {Map<string, { value: any, expiresAt: number }>} */
    this._store = new Map();

    // Periodically sweep expired entries every 5 minutes
    this._sweepInterval = setInterval(() => this._sweep(), 5 * 60 * 1000);

    // Allow the process to exit even if the interval is still running
    if (this._sweepInterval.unref) {
      this._sweepInterval.unref();
    }
  }

  // ─── Core Operations ──────────────────────────────────────────────────────

  /**
   * Store a value under `key` with a TTL in seconds (default: 5 minutes).
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlSeconds=300]
   */
  set(key, value, ttlSeconds = 300) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Retrieve a value by key. Returns `null` if missing or expired.
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Check whether a non-expired entry exists for `key`.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key.
   * @param {string} key
   */
  delete(key) {
    this._store.delete(key);
  }

  /**
   * Delete all keys that start with the given prefix.
   * Useful for invalidating a group of related cache entries.
   * @param {string} prefix
   */
  deleteByPrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache.
   */
  clear() {
    this._store.clear();
  }

  /**
   * Return the number of entries currently in the cache (including expired ones
   * not yet swept).
   * @returns {number}
   */
  get size() {
    return this._store.size;
  }

  // ─── Key Builders ─────────────────────────────────────────────────────────

  /**
   * Build a cache key from an array of parts.
   * Example: buildKey('properties', userId, 'page', 1) → "properties:userId:page:1"
   * @param {...(string|number)} parts
   * @returns {string}
   */
  static buildKey(...parts) {
    return parts.join(':');
  }

  // ─── Middleware Factory ───────────────────────────────────────────────────

  /**
   * Returns an Express middleware that caches GET responses.
   *
   * @param {number} [ttlSeconds=300] - Cache TTL in seconds
   * @param {(req: import('express').Request) => string} [keyFn] - Custom key builder
   * @returns {import('express').RequestHandler}
   *
   * @example
   * router.get('/listings', cache.middleware(60), listingsController);
   */
  middleware(ttlSeconds = 300, keyFn = null) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') return next();

      const key = keyFn
        ? keyFn(req)
        : MemoryCache.buildKey('route', req.originalUrl);

      const cached = this.get(key);
      if (cached !== null) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Intercept res.json to store the response in cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(key, body, ttlSeconds);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    };
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  /** Remove all expired entries from the store. */
  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
      }
    }
  }
}

// Export a singleton instance so the same cache is shared across the app
const cache = new MemoryCache();

module.exports = cache;
module.exports.MemoryCache = MemoryCache;
