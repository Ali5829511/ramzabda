# رمز الإبداع — Backend

خادم Node.js/Express لمنصة إدارة الأملاك العقارية، يستخدم PostgreSQL عبر Prisma ORM.

---

## المتطلبات

- Node.js >= 18
- PostgreSQL
- متغيرات البيئة: `DATABASE_URL`، `JWT_SECRET`

---

## التثبيت

```bash
npm install
```

---

## متغيرات البيئة

أنشئ ملف `.env` في مجلد `backend/`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## تشغيل الخادم

```bash
# وضع الإنتاج
npm start

# وضع التطوير (مع إعادة التشغيل التلقائي)
npm run dev
```

---

## قاعدة البيانات

```bash
# توليد Prisma Client
npm run db:generate

# تطبيق الـ migrations
npm run db:migrate

# مزامنة الـ schema مباشرةً (بيئة التطوير)
npm run db:push

# تعبئة البيانات الأولية
npm run db:seed
```

---

## استيراد البيانات من Excel

### استيراد العقارات

يقرأ السكريبت ملف `.xlsx` ويُدرج العقارات في قاعدة البيانات.

```bash
node src/scripts/importProperties.js path/to/properties.xlsx [ownerId]
```

- `ownerId` اختياري — إذا لم يُحدَّد يُستخدم أول مستخدم بدور `OWNER` أو `ADMIN`.

**أعمدة الملف المطلوبة:**

| العمود        | النوع   | مطلوب | الوصف                                                        |
|---------------|---------|--------|--------------------------------------------------------------|
| `title`       | نص      | ✅     | عنوان العقار                                                 |
| `type`        | نص      | ✅     | نوع العقار: `APARTMENT` `VILLA` `OFFICE` `SHOP` `LAND` `WAREHOUSE` |
| `price`       | رقم     | ✅     | السعر (رقم موجب)                                             |
| `area`        | رقم     | ✅     | المساحة بالمتر المربع (رقم موجب)                             |
| `address`     | نص      | ✅     | العنوان التفصيلي                                             |
| `city`        | نص      | ✅     | المدينة                                                      |
| `description` | نص      | ❌     | وصف العقار                                                   |
| `bedrooms`    | رقم صحيح| ❌     | عدد غرف النوم                                                |
| `bathrooms`   | رقم صحيح| ❌     | عدد الحمامات                                                 |
| `amenities`   | نص      | ❌     | المرافق مفصولة بفواصل (مثال: `مسبح, موقف سيارات, أمن`)     |

---

### استيراد الإعلانات

يقرأ السكريبت ملف `.xlsx` ويُدرج الإعلانات مرتبطةً بعقارات موجودة.

```bash
node src/scripts/importListings.js path/to/listings.xlsx
```

**أعمدة الملف المطلوبة:**

| العمود        | النوع   | مطلوب | الوصف                                          |
|---------------|---------|--------|------------------------------------------------|
| `propertyId`  | نص      | ✅     | معرّف العقار الموجود في قاعدة البيانات         |
| `type`        | نص      | ✅     | نوع الإعلان: `FOR_RENT` أو `FOR_SALE`          |
| `title`       | نص      | ✅     | عنوان الإعلان                                  |
| `description` | نص      | ✅     | وصف الإعلان                                    |
| `price`       | رقم     | ✅     | السعر (رقم موجب)                               |
| `featured`    | نص      | ❌     | إعلان مميز: `true` أو `false` (افتراضي: false) |
| `expiresAt`   | تاريخ   | ❌     | تاريخ انتهاء الإعلان بصيغة `YYYY-MM-DD`        |

---

## ملفات النماذج

توجد ملفات Excel نموذجية في مجلد `sample-data/`:

| الملف                          | الوصف                              |
|--------------------------------|------------------------------------|
| `properties-template.xlsx`     | نموذج لاستيراد العقارات            |
| `listings-template.xlsx`       | نموذج لاستيراد الإعلانات           |

---

## هيكل المشروع

```
backend/
├── prisma/
│   └── schema.prisma          # تعريف نماذج قاعدة البيانات
├── sample-data/
│   ├── properties-template.xlsx
│   └── listings-template.xlsx
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── contracts.js
│   │   ├── dashboard.js
│   │   ├── listings.js
│   │   ├── maintenance.js
│   │   ├── notifications.js
│   │   ├── payments.js
│   │   ├── properties.js
│   │   └── users.js
│   ├── scripts/
│   │   ├── importProperties.js  # استيراد العقارات من Excel
│   │   └── importListings.js    # استيراد الإعلانات من Excel
│   ├── utils/
│   │   └── logger.js
│   ├── index.js               # نقطة الدخول الرئيسية
│   └── seed.js                # بيانات أولية
└── package.json
```
