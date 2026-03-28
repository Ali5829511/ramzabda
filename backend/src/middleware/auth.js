const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Fail fast at startup if JWT_SECRET is not configured
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set. Authentication cannot function securely.');
  process.exit(1);
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح - يجب تسجيل الدخول' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ error: 'رمز المصادقة غير صالح' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'انتهت صلاحية رمز المصادقة، يرجى تسجيل الدخول مجدداً' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'رمز المصادقة غير صالح' });
    }
    logger.error('Unexpected error during authentication', err);
    return res.status(500).json({ error: 'حدث خطأ أثناء التحقق من الهوية' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'غير مصرح - يجب تسجيل الدخول' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'غير مسموح لك بهذا الإجراء' });
  }
  next();
};

module.exports = { authenticate, authorize };
