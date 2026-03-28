/**
 * رسائل الخطأ الموحدة - Unified Error Messages
 * Arabic (ar) and English (en) bilingual error messages
 */

const ERROR_MESSAGES = {
  // ─── Authentication / المصادقة ───────────────────────────────────────────────
  AUTH: {
    UNAUTHORIZED: {
      ar: 'غير مصرح - يجب تسجيل الدخول',
      en: 'Unauthorized - login required',
    },
    INVALID_TOKEN: {
      ar: 'رمز المصادقة غير صالح أو منتهي الصلاحية',
      en: 'Invalid or expired authentication token',
    },
    FORBIDDEN: {
      ar: 'غير مسموح لك بهذا الإجراء',
      en: 'You are not allowed to perform this action',
    },
    USER_NOT_FOUND: {
      ar: 'المستخدم غير موجود',
      en: 'User not found',
    },
    INVALID_CREDENTIALS: {
      ar: 'بيانات الدخول غير صحيحة',
      en: 'Invalid credentials',
    },
    EMAIL_IN_USE: {
      ar: 'البريد الإلكتروني مستخدم بالفعل',
      en: 'Email address is already in use',
    },
  },

  // ─── Validation / التحقق من البيانات ─────────────────────────────────────────
  VALIDATION: {
    REQUIRED_FIELDS: {
      ar: 'جميع الحقول المطلوبة يجب ملؤها',
      en: 'All required fields must be filled',
    },
    INVALID_EMAIL: {
      ar: 'صيغة البريد الإلكتروني غير صحيحة',
      en: 'Invalid email format',
    },
    INVALID_PASSWORD: {
      ar: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم',
      en: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number',
    },
    INVALID_PHONE: {
      ar: 'رقم الهاتف غير صحيح',
      en: 'Invalid phone number',
    },
    INVALID_DATE: {
      ar: 'صيغة التاريخ غير صحيحة',
      en: 'Invalid date format',
    },
    INVALID_NUMBER: {
      ar: 'القيمة يجب أن تكون رقماً صحيحاً',
      en: 'Value must be a valid number',
    },
    INVALID_TYPE: (field, expected) => ({
      ar: `نوع الحقل "${field}" غير صحيح، المتوقع: ${expected}`,
      en: `Invalid type for field "${field}", expected: ${expected}`,
    }),
    FIELD_REQUIRED: (field) => ({
      ar: `الحقل "${field}" مطلوب`,
      en: `Field "${field}" is required`,
    }),
    MIN_LENGTH: (field, min) => ({
      ar: `الحقل "${field}" يجب أن يحتوي على ${min} أحرف على الأقل`,
      en: `Field "${field}" must be at least ${min} characters`,
    }),
    MAX_LENGTH: (field, max) => ({
      ar: `الحقل "${field}" يجب ألا يتجاوز ${max} حرفاً`,
      en: `Field "${field}" must not exceed ${max} characters`,
    }),
  },

  // ─── Resources / الموارد ─────────────────────────────────────────────────────
  RESOURCE: {
    NOT_FOUND: (resource) => ({
      ar: `${resource} غير موجود`,
      en: `${resource} not found`,
    }),
    ALREADY_EXISTS: (resource) => ({
      ar: `${resource} موجود بالفعل`,
      en: `${resource} already exists`,
    }),
    DELETE_SUCCESS: (resource) => ({
      ar: `تم حذف ${resource} بنجاح`,
      en: `${resource} deleted successfully`,
    }),
  },

  // ─── Rate Limiting / تحديد معدل الطلبات ──────────────────────────────────────
  RATE_LIMIT: {
    GENERAL: {
      ar: 'لقد تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة بعد 15 دقيقة',
      en: 'Too many requests from this IP. Please try again after 15 minutes',
    },
    AUTH: {
      ar: 'لقد تجاوزت الحد المسموح به لمحاولات تسجيل الدخول. يرجى المحاولة بعد دقيقة',
      en: 'Too many authentication attempts. Please try again after 1 minute',
    },
  },

  // ─── Server / الخادم ─────────────────────────────────────────────────────────
  SERVER: {
    INTERNAL: {
      ar: 'حدث خطأ داخلي في الخادم',
      en: 'Internal server error',
    },
    BAD_REQUEST: {
      ar: 'طلب غير صالح',
      en: 'Bad request',
    },
    NOT_FOUND_ROUTE: {
      ar: 'المسار المطلوب غير موجود',
      en: 'The requested route was not found',
    },
  },
};

module.exports = ERROR_MESSAGES;
