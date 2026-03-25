const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const tenantPassword = await bcrypt.hash('tenant123', 10);
  const aliPassword = await bcrypt.hash('Aali1231@', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ramzabda.com' },
    update: {},
    create: { email: 'admin@ramzabda.com', password: adminPassword, name: 'مدير النظام', phone: '0501234567', role: 'ADMIN' }
  });

  await prisma.user.upsert({
    where: { email: 'aliayashi522@gmail.com' },
    update: { password: aliPassword, role: 'ADMIN' },
    create: { email: 'aliayashi522@gmail.com', password: aliPassword, name: 'مدير النظام', role: 'ADMIN' }
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@ramzabda.com' },
    update: {},
    create: { email: 'owner@ramzabda.com', password: ownerPassword, name: 'أحمد العقاري', phone: '0551234567', role: 'OWNER' }
  });

  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@ramzabda.com' },
    update: {},
    create: { email: 'tenant@ramzabda.com', password: tenantPassword, name: 'محمد المستأجر', phone: '0561234567', role: 'TENANT' }
  });

  const property1 = await prisma.property.upsert({
    where: { id: 'seed-prop-1' },
    update: {},
    create: {
      id: 'seed-prop-1',
      title: 'شقة فاخرة في حي النرجس',
      description: 'شقة مميزة بإطلالة رائعة، تتكون من 3 غرف نوم وصالة فسيحة وخدمات متكاملة',
      type: 'APARTMENT', status: 'AVAILABLE', price: 4500, area: 180,
      bedrooms: 3, bathrooms: 2, floor: 5,
      address: 'حي النرجس، شارع الأمير محمد',
      city: 'الرياض', district: 'النرجس',
      lat: 24.7748, lng: 46.7386,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: ['مواقف سيارات', 'مسبح', 'صالة رياضية', 'أمن 24 ساعة'],
      ownerId: owner.id
    }
  });

  const property2 = await prisma.property.upsert({
    where: { id: 'seed-prop-2' },
    update: {},
    create: {
      id: 'seed-prop-2',
      title: 'فيلا راقية في حي الياسمين',
      description: 'فيلا دوبلكس فاخرة مع حديقة خاصة ومسبح',
      type: 'VILLA', status: 'AVAILABLE', price: 12000, area: 450,
      bedrooms: 5, bathrooms: 4, floor: 2,
      address: 'حي الياسمين، شارع العليا',
      city: 'الرياض', district: 'الياسمين',
      lat: 24.8116, lng: 46.7365,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      amenities: ['حديقة', 'مسبح خاص', 'مجلس', 'غرفة سائق'],
      ownerId: owner.id
    }
  });

  const property3 = await prisma.property.upsert({
    where: { id: 'seed-prop-3' },
    update: {},
    create: {
      id: 'seed-prop-3',
      title: 'مكتب تجاري في العليا',
      description: 'مكتب تجاري بموقع استراتيجي في قلب العليا',
      type: 'OFFICE', status: 'AVAILABLE', price: 8000, area: 250,
      address: 'شارع العليا، برج الأعمال',
      city: 'الرياض', district: 'العليا',
      lat: 24.6896, lng: 46.6825,
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
      amenities: ['انترنت عالي السرعة', 'قاعة اجتماعات', 'موقف سيارات'],
      ownerId: owner.id
    }
  });

  const property4 = await prisma.property.upsert({
    where: { id: 'seed-prop-4' },
    update: {},
    create: {
      id: 'seed-prop-4',
      title: 'شقة في جدة - الروضة',
      description: 'شقة حديثة بإطلالة على البحر',
      type: 'APARTMENT', status: 'RENTED', price: 3800, area: 140,
      bedrooms: 2, bathrooms: 2, floor: 8,
      address: 'حي الروضة، شارع الأمير فيصل',
      city: 'جدة', district: 'الروضة',
      lat: 21.5433, lng: 39.1728,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      amenities: ['مسبح', 'صالة رياضية', 'بوفيه'],
      ownerId: owner.id
    }
  });

  await prisma.listing.upsert({
    where: { id: 'seed-listing-1' },
    update: {},
    create: {
      id: 'seed-listing-1',
      propertyId: property1.id, type: 'FOR_RENT',
      title: 'شقة فاخرة للإيجار - حي النرجس الرياض',
      description: 'شقة راقية بموقع مميز، قريبة من الخدمات والمدارس',
      price: 4500, featured: true, isActive: true
    }
  });

  await prisma.listing.upsert({
    where: { id: 'seed-listing-2' },
    update: {},
    create: {
      id: 'seed-listing-2',
      propertyId: property2.id, type: 'FOR_RENT',
      title: 'فيلا فاخرة للإيجار - حي الياسمين',
      description: 'فيلا مميزة مع جميع الخدمات والمرافق',
      price: 12000, featured: true, isActive: true
    }
  });

  await prisma.maintenanceRequest.upsert({
    where: { id: 'seed-maint-1' },
    update: {},
    create: {
      id: 'seed-maint-1',
      title: 'تسريب في صنبور المطبخ',
      description: 'يوجد تسريب بسيط في صنبور المطبخ يحتاج إصلاح',
      category: 'PLUMBING', priority: 'MEDIUM', status: 'PENDING',
      propertyId: property1.id, requestedBy: tenant.id
    }
  });

  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      { id: 'notif-1', userId: admin.id, title: 'طلب صيانة جديد', message: 'تم تقديم طلب صيانة جديد للعقار: شقة فاخرة في حي النرجس', type: 'MAINTENANCE', read: false },
      { id: 'notif-2', userId: admin.id, title: 'عقد على وشك الانتهاء', message: 'عقد الإيجار للمستأجر محمد ينتهي خلال 30 يوم', type: 'CONTRACT', read: false },
      { id: 'notif-3', userId: owner.id, title: 'دفعة إيجار مستلمة', message: 'تم استلام دفعة إيجار بقيمة 4500 ر.س من محمد المستأجر', type: 'PAYMENT', read: false },
      { id: 'notif-4', userId: tenant.id, title: 'تذكير بدفعة الإيجار', message: 'موعد دفعة الإيجار الشهرية خلال 5 أيام', type: 'PAYMENT', read: false },
      { id: 'notif-5', userId: tenant.id, title: 'طلب الصيانة قيد المعالجة', message: 'تم استلام طلب الصيانة الخاص بك وسيتم المتابعة قريباً', type: 'MAINTENANCE', read: true },
    ]
  });

  console.log('تم إنشاء البيانات الأولية بنجاح!');
  console.log('Admin: admin@ramzabda.com / admin123');
  console.log('Owner: owner@ramzabda.com / owner123');
  console.log('Tenant: tenant@ramzabda.com / tenant123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
