export const PROPERTY_TYPES: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  OFFICE: 'مكتب',
  SHOP: 'محل تجاري',
  WAREHOUSE: 'مستودع',
  LAND: 'أرض',
  BUILDING: 'مبنى',
}

export const PROPERTY_STATUS: Record<string, string> = {
  AVAILABLE: 'متاح',
  RENTED: 'مؤجر',
  SOLD: 'مباع',
  UNDER_MAINTENANCE: 'تحت الصيانة',
  RESERVED: 'محجوز',
}

export const CONTRACT_TYPES: Record<string, string> = {
  RENTAL: 'إيجار',
  SALE: 'بيع',
}

export const CONTRACT_STATUS: Record<string, string> = {
  ACTIVE: 'نشط',
  EXPIRED: 'منتهي',
  TERMINATED: 'مُنهى',
  PENDING: 'معلق',
}

export const MAINTENANCE_CATEGORIES: Record<string, string> = {
  PLUMBING: 'سباكة',
  ELECTRICAL: 'كهرباء',
  HVAC: 'تكييف',
  PAINTING: 'دهانات',
  CLEANING: 'تنظيف',
  SECURITY: 'أمن',
  APPLIANCES: 'أجهزة',
  STRUCTURAL: 'هيكلية',
  OTHER: 'أخرى',
}

export const MAINTENANCE_PRIORITY: Record<string, string> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'عالية',
  URGENT: 'عاجلة',
}

export const MAINTENANCE_STATUS: Record<string, string> = {
  PENDING: 'معلق',
  IN_PROGRESS: 'جاري',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  ON_HOLD: 'موقوف',
}

export const USER_ROLES: Record<string, string> = {
  ADMIN: 'مدير',
  OWNER: 'مالك',
  AGENT: 'وكيل',
  TENANT: 'مستأجر',
}

export const PAYMENT_STATUS: Record<string, string> = {
  PENDING: 'معلق',
  PAID: 'مدفوع',
  OVERDUE: 'متأخر',
  CANCELLED: 'ملغي',
}
