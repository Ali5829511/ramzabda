/**
 * importListings.js
 * -----------------
 * استيراد بيانات الإعلانات من ملف Excel إلى قاعدة البيانات.
 *
 * الاستخدام:
 *   node src/scripts/importListings.js <path-to-file.xlsx>
 *
 * أعمدة ملف Excel المتوقعة:
 *   - propertyId   (مطلوب) — معرّف العقار الموجود في قاعدة البيانات
 *   - type         (مطلوب) — FOR_RENT | FOR_SALE
 *   - title        (مطلوب) — عنوان الإعلان
 *   - description  (مطلوب) — وصف الإعلان
 *   - price        (مطلوب) — السعر، رقم موجب
 *   - featured     (اختياري) — true | false (افتراضي: false)
 *   - expiresAt    (اختياري) — تاريخ انتهاء الإعلان (YYYY-MM-DD)
 */

'use strict';

require('dotenv').config();

const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── الأنواع المسموح بها ────────────────────────────────────────────────────
const VALID_TYPES = ['FOR_RENT', 'FOR_SALE'];

// ── دالة التحقق من صحة صف واحد ────────────────────────────────────────────
function validateRow(row, rowIndex) {
  const errors = [];

  if (!row.propertyId || String(row.propertyId).trim() === '') {
    errors.push('propertyId مطلوب');
  }

  const type = row.type ? String(row.type).trim().toUpperCase() : '';
  if (!type) {
    errors.push('type مطلوب');
  } else if (!VALID_TYPES.includes(type)) {
    errors.push(`type غير صالح "${row.type}" — القيم المقبولة: ${VALID_TYPES.join(', ')}`);
  }

  if (!row.title || String(row.title).trim() === '') {
    errors.push('title مطلوب');
  }

  if (!row.description || String(row.description).trim() === '') {
    errors.push('description مطلوب');
  }

  const price = parseFloat(row.price);
  if (row.price === undefined || row.price === null || row.price === '') {
    errors.push('price مطلوب');
  } else if (isNaN(price) || price <= 0) {
    errors.push(`price يجب أن يكون رقماً موجباً (القيمة الحالية: ${row.price})`);
  }

  if (row.expiresAt && row.expiresAt !== '') {
    const d = new Date(row.expiresAt);
    if (isNaN(d.getTime())) {
      errors.push(`expiresAt تاريخ غير صالح "${row.expiresAt}" — الصيغة المتوقعة: YYYY-MM-DD`);
    }
  }

  return errors;
}

// ── تحويل صف Excel إلى كائن Prisma ────────────────────────────────────────
function mapRowToListing(row) {
  const featuredRaw = String(row.featured || '').trim().toLowerCase();
  const featured = featuredRaw === 'true' || featuredRaw === '1' || featuredRaw === 'yes';

  const expiresAt =
    row.expiresAt && row.expiresAt !== ''
      ? new Date(row.expiresAt)
      : null;

  return {
    propertyId:  String(row.propertyId).trim(),
    type:        String(row.type).trim().toUpperCase(),
    title:       String(row.title).trim(),
    description: String(row.description).trim(),
    price:       parseFloat(row.price),
    featured,
    isActive:    true,
    ...(expiresAt ? { expiresAt } : {}),
  };
}

// ── الدالة الرئيسية ────────────────────────────────────────────────────────
async function main() {
  const [, , filePath] = process.argv;

  if (!filePath) {
    console.error('❌  يرجى تحديد مسار ملف Excel.');
    console.error('    الاستخدام: node src/scripts/importListings.js <path-to-file.xlsx>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  console.log(`\n📂  قراءة الملف: ${resolvedPath}`);

  // ── قراءة ملف Excel ──────────────────────────────────────────────────────
  let workbook;
  try {
    workbook = XLSX.readFile(resolvedPath);
  } catch (err) {
    console.error(`❌  تعذّر فتح الملف: ${err.message}`);
    process.exit(1);
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) {
    console.warn('⚠️   الملف لا يحتوي على بيانات.');
    process.exit(0);
  }

  console.log(`📊  عدد الصفوف المقروءة: ${rows.length}`);

  // ── التحقق من صحة البيانات ───────────────────────────────────────────────
  const validRows = [];
  const invalidRows = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 لأن الصف الأول هو الترويسة
    const errors = validateRow(row, rowNum);
    if (errors.length > 0) {
      invalidRows.push({ rowNum, errors, data: row });
    } else {
      validRows.push({ rowNum, data: row });
    }
  });

  if (invalidRows.length > 0) {
    console.warn(`\n⚠️   صفوف تحتوي على أخطاء (${invalidRows.length}):`);
    invalidRows.forEach(({ rowNum, errors }) => {
      console.warn(`  الصف ${rowNum}: ${errors.join(' | ')}`);
    });
  }

  if (validRows.length === 0) {
    console.error('\n❌  لا توجد صفوف صالحة للاستيراد.');
    process.exit(1);
  }

  console.log(`\n✅  صفوف صالحة للاستيراد: ${validRows.length}`);

  // ── التحقق من وجود العقارات المرتبطة ─────────────────────────────────────
  const propertyIds = [...new Set(validRows.map(({ data }) => String(data.propertyId).trim()))];
  const existingProperties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    select: { id: true, title: true },
  });
  const existingPropertyMap = new Map(existingProperties.map((p) => [p.id, p]));

  const missingIds = propertyIds.filter((id) => !existingPropertyMap.has(id));
  if (missingIds.length > 0) {
    console.warn(`\n⚠️   معرّفات عقارات غير موجودة في قاعدة البيانات (${missingIds.length}):`);
    missingIds.forEach((id) => console.warn(`  - ${id}`));
  }

  // استبعاد الصفوف التي تشير إلى عقارات غير موجودة
  const importableRows = validRows.filter(({ data }) =>
    existingPropertyMap.has(String(data.propertyId).trim())
  );

  const skippedDueToMissingProperty = validRows.length - importableRows.length;
  if (skippedDueToMissingProperty > 0) {
    console.warn(`⚠️   تم تخطي ${skippedDueToMissingProperty} صف بسبب عقارات غير موجودة.`);
  }

  if (importableRows.length === 0) {
    console.error('\n❌  لا توجد صفوف قابلة للاستيراد بعد التحقق من العقارات.');
    process.exit(1);
  }

  console.log(`\n🔗  صفوف جاهزة للإدراج: ${importableRows.length}`);

  // ── إدراج البيانات ────────────────────────────────────────────────────────
  let inserted = 0;
  let failed = 0;

  for (const { rowNum, data } of importableRows) {
    try {
      const listingData = mapRowToListing(data);
      const property = existingPropertyMap.get(listingData.propertyId);
      const created = await prisma.listing.create({ data: listingData });
      console.log(
        `  ✔  الصف ${rowNum} → تم إنشاء الإعلان: "${created.title}" (${created.id}) — العقار: "${property.title}"`
      );
      inserted++;
    } catch (err) {
      console.error(`  ✘  الصف ${rowNum} → فشل الإدراج: ${err.message}`);
      failed++;
    }
  }

  // ── ملخص النتائج ─────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('📋  ملخص الاستيراد:');
  console.log(`    إجمالي الصفوف المقروءة          : ${rows.length}`);
  console.log(`    صفوف صالحة                      : ${validRows.length}`);
  console.log(`    صفوف غير صالحة                  : ${invalidRows.length}`);
  console.log(`    مُتخطّاة (عقار غير موجود)        : ${skippedDueToMissingProperty}`);
  console.log(`    تم إدراجها بنجاح                : ${inserted}`);
  console.log(`    فشل الإدراج                     : ${failed}`);
  console.log('══════════════════════════════════════════\n');

  if (failed > 0 || invalidRows.length > 0 || skippedDueToMissingProperty > 0) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('❌  خطأ غير متوقع:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
