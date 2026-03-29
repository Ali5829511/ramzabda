/**
 * importProperties.js
 * -------------------
 * استيراد بيانات العقارات من ملف Excel إلى قاعدة البيانات.
 *
 * الاستخدام:
 *   node src/scripts/importProperties.js <path-to-file.xlsx> [ownerId]
 *
 * إذا لم يُحدَّد ownerId يُستخدم أول مستخدم بدور OWNER أو ADMIN في قاعدة البيانات.
 */

'use strict';

require('dotenv').config();

const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── الأنواع المسموح بها ────────────────────────────────────────────────────
const VALID_TYPES = ['APARTMENT', 'VILLA', 'OFFICE', 'SHOP', 'LAND', 'WAREHOUSE'];

// ── دالة التحقق من صحة صف واحد ────────────────────────────────────────────
function validateRow(row, rowIndex) {
  const errors = [];

  if (!row.title || String(row.title).trim() === '') {
    errors.push('title مطلوب');
  }

  const type = row.type ? String(row.type).trim().toUpperCase() : '';
  if (!type) {
    errors.push('type مطلوب');
  } else if (!VALID_TYPES.includes(type)) {
    errors.push(`type غير صالح "${row.type}" — القيم المقبولة: ${VALID_TYPES.join(', ')}`);
  }

  const price = parseFloat(row.price);
  if (row.price === undefined || row.price === null || row.price === '') {
    errors.push('price مطلوب');
  } else if (isNaN(price) || price <= 0) {
    errors.push(`price يجب أن يكون رقماً موجباً (القيمة الحالية: ${row.price})`);
  }

  const area = parseFloat(row.area);
  if (row.area === undefined || row.area === null || row.area === '') {
    errors.push('area مطلوب');
  } else if (isNaN(area) || area <= 0) {
    errors.push(`area يجب أن يكون رقماً موجباً (القيمة الحالية: ${row.area})`);
  }

  if (!row.address || String(row.address).trim() === '') {
    errors.push('address مطلوب');
  }

  if (!row.city || String(row.city).trim() === '') {
    errors.push('city مطلوب');
  }

  return errors;
}

// ── تحويل صف Excel إلى كائن Prisma ────────────────────────────────────────
function mapRowToProperty(row, ownerId) {
  const amenitiesRaw = row.amenities ? String(row.amenities) : '';
  const amenities = amenitiesRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title:       String(row.title).trim(),
    type:        String(row.type).trim().toUpperCase(),
    price:       parseFloat(row.price),
    area:        parseFloat(row.area),
    address:     String(row.address).trim(),
    city:        String(row.city).trim(),
    description: row.description ? String(row.description).trim() : null,
    bedrooms:    row.bedrooms  != null && row.bedrooms  !== '' ? parseInt(row.bedrooms,  10) : null,
    bathrooms:   row.bathrooms != null && row.bathrooms !== '' ? parseInt(row.bathrooms, 10) : null,
    amenities,
    images:      [],
    status:      'AVAILABLE',
    ownerId,
  };
}

// ── الدالة الرئيسية ────────────────────────────────────────────────────────
async function main() {
  const [, , filePath, ownerIdArg] = process.argv;

  if (!filePath) {
    console.error('❌  يرجى تحديد مسار ملف Excel.');
    console.error('    الاستخدام: node src/scripts/importProperties.js <path-to-file.xlsx> [ownerId]');
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

  // ── تحديد المالك ─────────────────────────────────────────────────────────
  let ownerId = ownerIdArg;
  if (!ownerId) {
    const fallbackOwner = await prisma.user.findFirst({
      where: { role: { in: ['OWNER', 'ADMIN'] } },
      orderBy: { createdAt: 'asc' },
    });
    if (!fallbackOwner) {
      console.error('❌  لا يوجد مستخدم بدور OWNER أو ADMIN في قاعدة البيانات.');
      console.error('    يرجى تمرير ownerId كمعامل ثانٍ أو إنشاء مستخدم أولاً.');
      process.exit(1);
    }
    ownerId = fallbackOwner.id;
    console.log(`👤  سيُستخدم المالك الافتراضي: ${fallbackOwner.name} (${fallbackOwner.email})`);
  } else {
    // التحقق من وجود المالك
    const ownerExists = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!ownerExists) {
      console.error(`❌  المستخدم بالمعرّف "${ownerId}" غير موجود في قاعدة البيانات.`);
      process.exit(1);
    }
    console.log(`👤  المالك المحدد: ${ownerExists.name} (${ownerExists.email})`);
  }

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

  // ── إدراج البيانات ────────────────────────────────────────────────────────
  let inserted = 0;
  let failed = 0;

  for (const { rowNum, data } of validRows) {
    try {
      const propertyData = mapRowToProperty(data, ownerId);
      const created = await prisma.property.create({ data: propertyData });
      console.log(`  ✔  الصف ${rowNum} → تم إنشاء العقار: "${created.title}" (${created.id})`);
      inserted++;
    } catch (err) {
      console.error(`  ✘  الصف ${rowNum} → فشل الإدراج: ${err.message}`);
      failed++;
    }
  }

  // ── ملخص النتائج ─────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('📋  ملخص الاستيراد:');
  console.log(`    إجمالي الصفوف المقروءة : ${rows.length}`);
  console.log(`    صفوف صالحة             : ${validRows.length}`);
  console.log(`    صفوف غير صالحة         : ${invalidRows.length}`);
  console.log(`    تم إدراجها بنجاح       : ${inserted}`);
  console.log(`    فشل الإدراج            : ${failed}`);
  console.log('══════════════════════════════════════════\n');

  if (failed > 0 || invalidRows.length > 0) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('❌  خطأ غير متوقع:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
