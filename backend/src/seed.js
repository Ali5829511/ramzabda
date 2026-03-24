const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const tenantPassword = await bcrypt.hash('tenant123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ramzabda.com' },
    update: {},
    create: {
      email: 'admin@ramzabda.com',
      password: adminPassword,
      name: 'مدير النظام',
      phone: '0501234567',
      role: 'ADMIN'
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@ramzabda.com' },
    update: {},
    create: {
      email: 'owner@ramzabda.com',
      password: ownerPassword,
      name: 'أحمد العقاري',
      phone: '0551234567',
      role: 'OWNER'
    }
  });

  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@ramzabda.com' },
    update: {},
    create: {
      email: 'tenant@ramzabda.com',
      password: tenantPassword,
      name: 'محمد المستأجر',
      phone: '0561234567',
      role: 'TENANT'
    }
  });

  const property1 = await prisma.property.create({
    data: {
      title: 'شقة فاخرة في حي النرجس',
      description: 'شقة مميزة بإطلالة رائعة، تتكون من 3 غرف نوم وصالة فسيحة وخدمات متكاملة',
      type: 'APARTMENT',
      status: 'AVAILABLE',
      price: 4500,
      area: 180,
      bedrooms: 3,
      bathrooms: 2,
      floor: 5,
      address: 'حي النرجس، شارع الأمير محمد',
      city: 'الرياض',
      district: 'النرجس',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: ['مواقف سيارات', 'مسبح', 'صالة رياضية', 'أمن 24 ساعة'],
      ownerId: owner.id
    }
  });

  const property2 = await prisma.property.create({
    data: {
      title: 'فيلا راقية في حي الياسمين',
      description: 'فيلا دوبلكس فاخرة مع حديقة خاصة ومسبح',
      type: 'VILLA',
      status: 'AVAILABLE',
      price: 12000,
      area: 450,
      bedrooms: 5,
      bathrooms: 4,
      floor: 2,
      address: 'حي الياسمين، شارع العليا',
      city: 'الرياض',
      district: 'الياسمين',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      amenities: ['حديقة', 'مسبح خاص', 'مجلس', 'غرفة سائق'],
      ownerId: owner.id
    }
  });

  await prisma.listing.create({
    data: {
      propertyId: property1.id,
      type: 'FOR_RENT',
      title: 'شقة فاخرة للإيجار - حي النرجس الرياض',
      description: 'شقة راقية بموقع مميز، قريبة من الخدمات والمدارس',
      price: 4500,
      featured: true,
      isActive: true
    }
  });

  await prisma.listing.create({
    data: {
      propertyId: property2.id,
      type: 'FOR_RENT',
      title: 'فيلا فاخرة للإيجار - حي الياسمين',
      description: 'فيلا مميزة مع جميع الخدمات والمرافق',
      price: 12000,
      featured: true,
      isActive: true
    }
  });

  await prisma.maintenanceRequest.create({
    data: {
      title: 'تسريب في صنبور المطبخ',
      description: 'يوجد تسريب بسيط في صنبور المطبخ يحتاج إصلاح',
      category: 'PLUMBING',
      priority: 'MEDIUM',
      status: 'PENDING',
      propertyId: property1.id,
      requestedBy: tenant.id
    }
  });

  console.log('تم إنشاء البيانات الأولية بنجاح!');
  console.log('Admin: admin@ramzabda.com / admin123');
  console.log('Owner: owner@ramzabda.com / owner123');
  console.log('Tenant: tenant@ramzabda.com / tenant123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
