/**
 * تكوين قاعدة البيانات مع معالجة الأخطاء
 * Database configuration with error handling and connection verification
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL environment variable is not set. The application cannot connect to the database.');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

/**
 * Verify the database connection by running a lightweight query.
 * Exits the process if the connection cannot be established.
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully.');
  } catch (err) {
    logger.error('Failed to connect to the database. Check DATABASE_URL and ensure the database is running.', err);
    process.exit(1);
  }
}

/**
 * Gracefully disconnect from the database.
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed.');
  } catch (err) {
    logger.error('Error while disconnecting from the database.', err);
  }
}

module.exports = { prisma, connectDatabase, disconnectDatabase };
