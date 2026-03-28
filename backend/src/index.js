const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const contractRoutes = require('./routes/contracts');
const maintenanceRoutes = require('./routes/maintenance');
const listingRoutes = require('./routes/listings');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const docsRoutes = require('./routes/docs');

// ─── Middleware ───────────────────────────────────────────────────────────────
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { globalErrorHandler, notFoundHandler } = require('./utils/errorHandler');

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

const serverStartTime = new Date().toISOString();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Stricter limit on auth endpoints to slow brute-force attacks
app.use('/api/auth', authLimiter);
// General limit for all other API routes
app.use('/api', generalLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/docs', docsRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'رمز الإبداع - منصة إدارة الأملاك',
    version: '1.0.0',
    startedAt: serverStartTime,
  });
});

// ─── 404 Handler (must come after all routes) ─────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
