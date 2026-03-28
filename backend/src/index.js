const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const contractRoutes = require('./routes/contracts');
const maintenanceRoutes = require('./routes/maintenance');
const listingRoutes = require('./routes/listings');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

// ── Validate required environment variables ──────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnv.join(', ')}. Check your .env file or deployment configuration.`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

const app = express();
const serverStartTime = new Date().toISOString();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'رمز الإبداع - منصة إدارة الأملاك',
    version: '1.0.0',
    environment: NODE_ENV,
    startedAt: serverStartTime,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}`, err);
  res.status(err.status || 500).json({
    error: 'حدث خطأ في الخادم',
    ...(NODE_ENV === 'development' && { details: err.message }),
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', reason instanceof Error ? reason : { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception — shutting down', err);
  process.exit(1);
});

// ── Start server ──────────────────────────────────────────────────────────────
async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, { environment: NODE_ENV, frontendUrl: FRONTEND_URL });
  });
}

start();

module.exports = app;
