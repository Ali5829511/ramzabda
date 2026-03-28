/**
 * generate-templates.js
 * ---------------------
 * ينشئ ملفات Excel النموذجية لاستيراد العقارات والإعلانات.
 *
 * الاستخدام:
 *   node sample-data/generate-templates.js
 *
 * المخرجات:
 *   sample-data/properties-template.xlsx
 *   sample-data/listings-template.xlsx
 */

'use strict';

const path = require('path');
const XLSX = require('xlsx');

const OUTPUT_DIR = __dirname;

// ── نموذج العقارات ────────────────────────────────────────────────────────
function generatePropertiesTemplate() {
  const headers = [
    'title',
    'type',
    'price',
    'area',
    'address',
    'city',
    'description',
    'bedrooms',
    'bathrooms',
    'amenities',
  ];

  const sampleRows = [
    {
      title:       'شقة فاخرة في حي النرجس',
      type:        'APARTMENT',
      price:       4500,
      area:        180,
      address:     'حي النرجس، شارع الأمير محمد',
      city:        'الرياض',
      description: 'شقة مميزة بإطلالة رائعة، تتكون من 3 غرف نوم وصالة فسيحة',
      bedrooms:    3,
      bathrooms:   2,
      amenities:   'مواقف سيارات, مسبح, صالة رياضية, أمن 24 ساعة',
    },
    {
      title:       'فيلا راقية في حي الياسمين',
      type:        'VILLA',
      price:       12000,
      area:        450,
      address:     'حي الياسمين، شارع العليا',
      city:        'الرياض',
      description: 'فيلا دوبلكس فاخرة مع حديقة خاصة ومسبح',
      bedrooms:    5,
      bathrooms:   4,
      amenities:   'حديقة, مسبح خاص, مجلس, غرفة سائق',
    },
    {
      title:       'مكتب تجاري في العليا',
      type:        'OFFICE',
      price:       8000,
      area:        250,
      address:     'شارع العليا، برج الأعمال',
      city:        'الرياض',
      description: 'مكتب تجاري بموقع استراتيجي في قلب العليا',
      bedrooms:    '',
      bathrooms:   '',
      amenities:   'انترنت عالي السرعة, قاعة اجتماعات, موقف سيارات',
    },
    {
      title:       'محل تجاري في جدة',
      type:        'SHOP',
      price:       6000,
      area:        120,
      address:     'شارع التحلية',
      city:        'جدة',
      description: 'محل تجاري في موقع حيوي',
      bedrooms:    '',
      bathrooms:   '',
      amenities:   '',
    },
    {
      title:       'أرض سكنية في الدمام',
      type:        'LAND',
      price:       500000,
      area:        800,
      address:     'حي الشاطئ',
      city:        'الدمام',
      description: 'أرض سكنية بموقع مميز قريبة من الخدمات',
      bedrooms:    '',
      bathrooms:   '',
      amenities:   '',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

  // ضبط عرض الأعمدة
  ws['!cols'] = [
    { wch: 35 }, // title
    { wch: 12 }, // type
    { wch: 10 }, // price
    { wch: 8  }, // area
    { wch: 35 }, // address
    { wch: 12 }, // city
    { wch: 45 }, // description
    { wch: 10 }, // bedrooms
    { wch: 10 }, // bathrooms
    { wch: 45 }, // amenities
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'العقارات');

  const outputPath = path.join(OUTPUT_DIR, 'properties-template.xlsx');
  XLSX.writeFile(wb, outputPath);
  console.log(`✅  تم إنشاء: ${outputPath}`);
}

// ── نموذج الإعلانات ───────────────────────────────────────────────────────
function generateListingsTemplate() {
  const headers = [
    'propertyId',
    'type',
    'title',
    'description',
    'price',
    'featured',
    'expiresAt',
  ];

  const sampleRows = [
    {
      propertyId:  'PROPERTY_ID_HERE',
      type:        'FOR_RENT',
      title:       'شقة فاخرة للإيجار - حي النرجس الرياض',
      description: 'شقة راقية بموقع مميز، قريبة من الخدمات والمدارس',
      price:       4500,
      featured:    'true',
      expiresAt:   '2025-12-31',
    },
    {
      propertyId:  'PROPERTY_ID_HERE',
      type:        'FOR_SALE',
      title:       'فيلا فاخرة للبيع - حي الياسمين',
      description: 'فيلا مميزة مع جميع الخدمات والمرافق، فرصة استثمارية',
      price:       2500000,
      featured:    'false',
      expiresAt:   '',
    },
    {
      propertyId:  'PROPERTY_ID_HERE',
      type:        'FOR_RENT',
      title:       'مكتب تجاري للإيجار - العليا',
      description: 'مكتب بموقع استراتيجي مناسب للشركات',
      price:       8000,
      featured:    'true',
      expiresAt:   '2025-06-30',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

  // ضبط عرض الأعمدة
  ws['!cols'] = [
    { wch: 38 }, // propertyId
    { wch: 10 }, // type
    { wch: 40 }, // title
    { wch: 50 }, // description
    { wch: 12 }, // price
    { wch: 10 }, // featured
    { wch: 12 }, // expiresAt
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الإعلانات');

  const outputPath = path.join(OUTPUT_DIR, 'listings-template.xlsx');
  XLSX.writeFile(wb, outputPath);
  console.log(`✅  تم إنشاء: ${outputPath}`);
}

// ── التنفيذ ───────────────────────────────────────────────────────────────
try {
  console.log('🔧  جارٍ إنشاء ملفات النماذج...\n');
  generatePropertiesTemplate();
  generateListingsTemplate();
  console.log('\n✔  اكتمل إنشاء جميع الملفات النموذجية.');
  console.log('   يمكنك الآن فتحها في Excel وتعديل البيانات ثم استيرادها.\n');
} catch (err) {
  console.error('❌  خطأ أثناء إنشاء الملفات:', err.message);
  process.exit(1);
}
