const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const contractRoutes = require('./routes/contracts');
const maintenanceRoutes = require('./routes/maintenance');
const listingRoutes = require('./routes/listings');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

const app = express();

const serverStartTime = new Date().toISOString();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'رمز الإبداع - منصة إدارة الأملاك', version: '1.0.0', startedAt: serverStartTime });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ في الخادم', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
