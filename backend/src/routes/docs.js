/**
 * API Documentation Route - توثيق API
 * GET /api/docs  →  Full endpoint catalogue with examples
 */

const express = require('express');
const router = express.Router();

const API_VERSION = '1.0.0';
const BASE_URL = '/api';

// ─── Endpoint Catalogue ───────────────────────────────────────────────────────

const endpoints = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    group: 'المصادقة / Authentication',
    routes: [
      {
        method: 'POST',
        path: `${BASE_URL}/auth/register`,
        description: 'تسجيل مستخدم جديد / Register a new user',
        auth: false,
        rateLimit: '50 req / min per IP',
        body: {
          email: 'string (required) — البريد الإلكتروني',
          password: 'string (required, min 8 chars, upper+lower+digit) — كلمة المرور',
          name: 'string (required, 2-100 chars) — الاسم الكامل',
          phone: 'string (optional) — رقم الهاتف',
          role: 'string (optional) — ADMIN | OWNER | TENANT | AGENT',
        },
        response: {
          201: { user: '{ id, email, name, role, phone, createdAt }', token: 'JWT' },
          400: { error: 'رسالة الخطأ', details: ['قائمة الأخطاء'] },
        },
      },
      {
        method: 'POST',
        path: `${BASE_URL}/auth/login`,
        description: 'تسجيل الدخول / Login',
        auth: false,
        rateLimit: '50 req / min per IP',
        body: {
          email: 'string (required)',
          password: 'string (required)',
        },
        response: {
          200: { user: '{ id, email, name, role, ... }', token: 'JWT' },
          401: { error: 'بيانات الدخول غير صحيحة' },
        },
      },
      {
        method: 'GET',
        path: `${BASE_URL}/auth/me`,
        description: 'الحصول على بيانات المستخدم الحالي / Get current user',
        auth: true,
        response: {
          200: { id: 'uuid', email: 'string', name: 'string', role: 'string', phone: 'string', avatar: 'string', createdAt: 'ISO date' },
          401: { error: 'غير مصرح' },
        },
      },
    ],
  },

  // ── Properties ────────────────────────────────────────────────────────────
  {
    group: 'العقارات / Properties',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/properties`,
        description: 'قائمة العقارات مع فلترة وتصفح / List properties with filters & pagination',
        auth: true,
        query: {
          type: 'APARTMENT | VILLA | OFFICE | SHOP | LAND | WAREHOUSE',
          status: 'AVAILABLE | RENTED | SOLD | UNDER_MAINTENANCE',
          city: 'string',
          minPrice: 'number',
          maxPrice: 'number',
          search: 'string',
          page: 'number (default: 1)',
          limit: 'number (default: 12)',
        },
        response: {
          200: { properties: '[]', total: 'number', page: 'number', pages: 'number' },
        },
      },
      {
        method: 'GET',
        path: `${BASE_URL}/properties/:id`,
        description: 'تفاصيل عقار / Property details',
        auth: true,
        response: { 200: 'Property object with owner, contracts, maintenance, listings', 404: { error: 'العقار غير موجود' } },
      },
      {
        method: 'POST',
        path: `${BASE_URL}/properties`,
        description: 'إضافة عقار جديد / Create a property',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        body: {
          title: 'string (required, 3-200 chars)',
          type: 'string (required) — APARTMENT | VILLA | OFFICE | SHOP | LAND | WAREHOUSE',
          price: 'number (required, > 0)',
          area: 'number (required, > 0)',
          address: 'string (required)',
          city: 'string (required)',
          description: 'string (optional)',
          bedrooms: 'number (optional)',
          bathrooms: 'number (optional)',
          images: 'string[] (optional)',
          amenities: 'string[] (optional)',
        },
        response: { 201: 'Created property object', 400: { error: 'Validation errors' } },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/properties/:id`,
        description: 'تحديث عقار / Update a property',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        response: { 200: 'Updated property object' },
      },
      {
        method: 'DELETE',
        path: `${BASE_URL}/properties/:id`,
        description: 'حذف عقار / Delete a property',
        auth: true,
        roles: ['ADMIN', 'OWNER'],
        response: { 200: { message: 'تم حذف العقار بنجاح' } },
      },
    ],
  },

  // ── Contracts ─────────────────────────────────────────────────────────────
  {
    group: 'العقود / Contracts',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/contracts`,
        description: 'قائمة العقود / List contracts',
        auth: true,
        query: { status: 'ACTIVE | EXPIRED | TERMINATED', type: 'RENT | SALE', page: 'number', limit: 'number' },
        response: { 200: { contracts: '[]', total: 'number', page: 'number', pages: 'number' } },
      },
      {
        method: 'GET',
        path: `${BASE_URL}/contracts/:id`,
        description: 'تفاصيل عقد / Contract details',
        auth: true,
        response: { 200: 'Contract with property, tenant, payments', 404: { error: 'العقد غير موجود' } },
      },
      {
        method: 'POST',
        path: `${BASE_URL}/contracts`,
        description: 'إنشاء عقد جديد / Create a contract',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        body: {
          propertyId: 'string (required)',
          tenantId: 'string (required)',
          type: 'RENT | SALE (required)',
          startDate: 'ISO date (required)',
          endDate: 'ISO date (required)',
          monthlyRent: 'number (optional)',
          salePrice: 'number (optional)',
          deposit: 'number (optional)',
        },
        response: { 201: 'Created contract object' },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/contracts/:id`,
        description: 'تحديث عقد / Update a contract',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        response: { 200: 'Updated contract object' },
      },
    ],
  },

  // ── Maintenance ───────────────────────────────────────────────────────────
  {
    group: 'الصيانة / Maintenance',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/maintenance`,
        description: 'قائمة طلبات الصيانة / List maintenance requests',
        auth: true,
        query: { status: 'PENDING | IN_PROGRESS | COMPLETED | CANCELLED', priority: 'LOW | MEDIUM | HIGH | URGENT', category: 'string', page: 'number', limit: 'number' },
        response: { 200: { requests: '[]', total: 'number', page: 'number', pages: 'number' } },
      },
      {
        method: 'POST',
        path: `${BASE_URL}/maintenance`,
        description: 'إنشاء طلب صيانة / Create a maintenance request',
        auth: true,
        body: {
          title: 'string (required, 3-200 chars)',
          description: 'string (required, min 10 chars)',
          category: 'string (required)',
          propertyId: 'string (required)',
          priority: 'LOW | MEDIUM | HIGH | URGENT (optional, default: MEDIUM)',
        },
        response: { 201: 'Created maintenance request object' },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/maintenance/:id`,
        description: 'تحديث طلب صيانة / Update a maintenance request',
        auth: true,
        response: { 200: 'Updated maintenance request object' },
      },
      {
        method: 'DELETE',
        path: `${BASE_URL}/maintenance/:id`,
        description: 'حذف طلب صيانة / Delete a maintenance request',
        auth: true,
        roles: ['ADMIN'],
        response: { 200: { message: 'تم حذف طلب الصيانة' } },
      },
    ],
  },

  // ── Listings ──────────────────────────────────────────────────────────────
  {
    group: 'الإعلانات / Listings',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/listings`,
        description: 'قائمة الإعلانات العامة / Public listings (no auth required)',
        auth: false,
        query: { type: 'string', city: 'string', minPrice: 'number', maxPrice: 'number', search: 'string', featured: 'boolean', page: 'number', limit: 'number' },
        response: { 200: { listings: '[]', total: 'number', page: 'number', pages: 'number' } },
      },
      {
        method: 'GET',
        path: `${BASE_URL}/listings/:id`,
        description: 'تفاصيل إعلان / Listing details (increments view count)',
        auth: false,
        response: { 200: 'Listing with property and owner', 404: { error: 'الإعلان غير موجود' } },
      },
      {
        method: 'POST',
        path: `${BASE_URL}/listings`,
        description: 'إنشاء إعلان / Create a listing',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        response: { 201: 'Created listing object' },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/listings/:id`,
        description: 'تحديث إعلان / Update a listing',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        response: { 200: 'Updated listing object' },
      },
      {
        method: 'DELETE',
        path: `${BASE_URL}/listings/:id`,
        description: 'حذف إعلان / Delete a listing',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        response: { 200: { message: 'تم حذف الإعلان' } },
      },
    ],
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  {
    group: 'المدفوعات / Payments',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/payments`,
        description: 'قائمة المدفوعات / List payments',
        auth: true,
        query: { status: 'PENDING | PAID | OVERDUE | CANCELLED', contractId: 'string', page: 'number', limit: 'number' },
        response: { 200: { payments: '[]', total: 'number', page: 'number', pages: 'number' } },
      },
      {
        method: 'POST',
        path: `${BASE_URL}/payments`,
        description: 'إنشاء دفعة / Create a payment',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        body: {
          contractId: 'string (required)',
          userId: 'string (required)',
          amount: 'number (required, > 0)',
          type: 'string (required)',
          dueDate: 'ISO date (required)',
          method: 'string (optional)',
          reference: 'string (optional)',
        },
        response: { 201: 'Created payment object' },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/payments/:id`,
        description: 'تحديث دفعة / Update a payment',
        auth: true,
        response: { 200: 'Updated payment object' },
      },
    ],
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  {
    group: 'المستخدمون / Users',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/users`,
        description: 'قائمة المستخدمين / List all users',
        auth: true,
        roles: ['ADMIN'],
        response: { 200: '[]' },
      },
      {
        method: 'GET',
        path: `${BASE_URL}/users/:id`,
        description: 'تفاصيل مستخدم / User details',
        auth: true,
        response: { 200: 'User object', 403: { error: 'غير مسموح' } },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/users/:id`,
        description: 'تحديث مستخدم / Update user profile',
        auth: true,
        response: { 200: 'Updated user object' },
      },
    ],
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  {
    group: 'الإشعارات / Notifications',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/notifications`,
        description: 'قائمة الإشعارات / List notifications (last 50)',
        auth: true,
        response: { 200: { notifications: '[]' } },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/notifications/read-all`,
        description: 'تعليم جميع الإشعارات كمقروءة / Mark all notifications as read',
        auth: true,
        response: { 200: { success: true } },
      },
      {
        method: 'PUT',
        path: `${BASE_URL}/notifications/:id/read`,
        description: 'تعليم إشعار كمقروء / Mark a notification as read',
        auth: true,
        response: { 200: { success: true } },
      },
    ],
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    group: 'لوحة التحكم / Dashboard',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/dashboard`,
        description: 'إحصائيات لوحة التحكم / Dashboard statistics',
        auth: true,
        roles: ['ADMIN', 'OWNER', 'AGENT'],
        response: {
          200: {
            stats: {
              totalProperties: 'number',
              availableProperties: 'number',
              rentedProperties: 'number',
              totalContracts: 'number',
              activeContracts: 'number',
              pendingMaintenance: 'number',
              pendingPayments: 'number',
              totalRevenue: 'number',
              listingsCount: 'number',
            },
            recentProperties: '[]',
            recentMaintenance: '[]',
          },
        },
      },
    ],
  },

  // ── System ────────────────────────────────────────────────────────────────
  {
    group: 'النظام / System',
    routes: [
      {
        method: 'GET',
        path: `${BASE_URL}/health`,
        description: 'فحص صحة الخادم / Server health check',
        auth: false,
        response: { 200: { status: 'OK', message: 'string', version: 'string', startedAt: 'ISO date' } },
      },
      {
        method: 'GET',
        path: `${BASE_URL}/docs`,
        description: 'توثيق API / API documentation (this endpoint)',
        auth: false,
        response: { 200: 'This document' },
      },
    ],
  },
];

// ─── Route ────────────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const totalEndpoints = endpoints.reduce((sum, g) => sum + g.routes.length, 0);

  res.json({
    title: 'رمز الإبداع - توثيق API / Ramz Al-Ibda API Documentation',
    version: API_VERSION,
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    totalEndpoints,
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      note: 'احصل على الرمز من /api/auth/login أو /api/auth/register',
      noteEn: 'Obtain the token from /api/auth/login or /api/auth/register',
    },
    rateLimiting: {
      general: '100 requests per 15 minutes per IP',
      auth: '50 requests per minute per IP (applied to /api/auth/*)',
      headers: {
        'X-RateLimit-Limit': 'Maximum requests allowed in the window',
        'X-RateLimit-Remaining': 'Requests remaining in the current window',
        'X-RateLimit-Reset': 'Unix timestamp when the window resets',
        'Retry-After': 'Seconds to wait before retrying (only on 429)',
      },
    },
    errorFormat: {
      description: 'جميع الأخطاء تتبع هذا الشكل / All errors follow this format',
      example: {
        error: 'رسالة الخطأ بالعربية',
        errorEn: 'Error message in English',
        details: ['optional array of field-level validation errors'],
      },
    },
    endpoints,
  });
});

module.exports = router;
