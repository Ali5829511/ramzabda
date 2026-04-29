import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  boolean,
  tinyint,
} from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== OWNERS (ملاك العقارات) ====================
export const owners = mysqlTable("owners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  identityNumber: varchar("identityNumber", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  userId: int("userId"),
  portalAccess: tinyint("portalAccess").default(0),
  portalPin: varchar("portalPin", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Owner = typeof owners.$inferSelect;
export type InsertOwner = typeof owners.$inferInsert;

// ==================== PROPERTIES (العقارات) ====================
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  // ===== البيانات الأساسية =====
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["نشط", "غير_نشط", "تحت_الإنشاء"]).default("نشط"),
  mainImageUrl: varchar("mainImageUrl", { length: 500 }),
  reportDate: date("reportDate"),
  // ===== الموقع =====
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  address: text("address"),
  nationalAddress: varchar("nationalAddress", { length: 255 }), // رقم المبنى – الشارع – الرمز البريدي
  buildingNumber: varchar("buildingNumber", { length: 20 }),
  streetName: varchar("streetName", { length: 100 }),
  postalCode: varchar("postalCode", { length: 10 }),
  additionalNumber: varchar("additionalNumber", { length: 10 }),
  // ===== بيانات الصك =====
  deedNumber: varchar("deedNumber", { length: 50 }),
  deedType: mysqlEnum("deedType", ["صك", "وثيقة_ملكية"]).default("صك"),
  deedIssueDate: date("deedIssueDate"),
  deedIssuer: varchar("deedIssuer", { length: 255 }),
  documentNumber: varchar("documentNumber", { length: 50 }),
  plotNumber: varchar("plotNumber", { length: 50 }),
  planNumber: varchar("planNumber", { length: 50 }),
  deedArea: decimal("deedArea", { precision: 12, scale: 2 }),
  // ===== التسجيل العيني =====
  realEstateRegistrationNumber: varchar("realEstateRegistrationNumber", { length: 50 }),
  realEstateRegistrationDate: date("realEstateRegistrationDate"),
  realEstateRegistrationStatus: mysqlEnum("realEstateRegistrationStatus", ["مسجل", "غير_مسجل", "تحت_الإجراء"]).default("غير_مسجل"),
  // ===== المبنى والمرافق =====
  propertyType: mysqlEnum("propertyType", ["فيلا", "شقة", "عمارة", "مكتب", "محل", "مستودع", "أرض", "برج", "مجمع", "أخرى"]).default("أخرى"),
  buildingType: mysqlEnum("buildingType", ["برج", "فيلا", "عمارة", "مجمع", "مستودع", "أخرى"]).default("عمارة"),
  propertyUsage: mysqlEnum("propertyUsage", ["سكني", "تجاري", "صناعي", "مختلط"]).default("سكني"),
  usagePurpose: varchar("usagePurpose", { length: 255 }),
  amenities: text("amenities"), // JSON array: ["مسبح","نادي","سطح","حديقة"]
  floorsCount: int("floorsCount"),
  elevatorsCount: int("elevatorsCount"),
  parkingCount: int("parkingCount"),
  additionalFacilities: text("additionalFacilities"), // JSON array
  // ===== المالك =====
  ownerId: int("ownerId"),
  ownerName: varchar("ownerName", { length: 255 }),
  ownerIdentity: varchar("ownerIdentity", { length: 20 }),
  ownerNationality: varchar("ownerNationality", { length: 50 }),
  ownershipPercentage: decimal("ownershipPercentage", { precision: 5, scale: 2 }).default("100"),
  ownershipArea: decimal("ownershipArea", { precision: 12, scale: 2 }),
  ownerType: mysqlEnum("ownerType", ["فرد", "شركة", "جهة_حكومية", "وقف"]).default("فرد"),
  // ===== اتحاد الملاك =====
  hasOwnersAssociation: tinyint("hasOwnersAssociation").default(0),
  associationName: varchar("associationName", { length: 255 }),
  associationRegNumber: varchar("associationRegNumber", { length: 50 }),
  associationUnifiedNumber: varchar("associationUnifiedNumber", { length: 50 }),
  associationStatus: mysqlEnum("associationStatus", ["فعّالة", "غير_فعّالة"]).default("غير_فعّالة"),
  associationStartDate: date("associationStartDate"),
  associationEndDate: date("associationEndDate"),
  associationPresidentName: varchar("associationPresidentName", { length: 255 }),
  associationPresidentPhone: varchar("associationPresidentPhone", { length: 20 }),
  propertyManagerName: varchar("propertyManagerName", { length: 255 }),
  propertyManagerPhone: varchar("propertyManagerPhone", { length: 20 }),
  associationTotalFees: decimal("associationTotalFees", { precision: 12, scale: 2 }),
  associationVotersCount: int("associationVotersCount"),
  associationApprovalRate: decimal("associationApprovalRate", { precision: 5, scale: 2 }),
  // ===== الوسيط العقاري =====
  brokerName: varchar("brokerName", { length: 255 }),
  brokerCommercialReg: varchar("brokerCommercialReg", { length: 50 }),
  // ===== رسوم إدارة الأملاك =====
  managementFeeType: mysqlEnum("managementFeeType", ["نسبة_مئوية", "مبلغ_ثابت"]).default("نسبة_مئوية"),
  managementFeeRate: decimal("managementFeeRate", { precision: 5, scale: 2 }).default("5"), // نسبة % أو مبلغ ثابت
  managementFeeAmount: decimal("managementFeeAmount", { precision: 12, scale: 2 }),
  maintenanceReserveRate: decimal("maintenanceReserveRate", { precision: 5, scale: 2 }).default("0"),
  vatRate: decimal("vatRate", { precision: 5, scale: 2 }).default("15"),
  // ===== الإجماليات =====
  totalUnits: int("totalUnits").default(0),
  totalContracts: int("totalContracts").default(0),
  reservedUnits: int("reservedUnits").default(0),
  rentedUnits: int("rentedUnits").default(0),
  availableUnits: int("availableUnits").default(0),
  totalContractAmount: decimal("totalContractAmount", { precision: 15, scale: 2 }).default("0"),
  totalDocumentationFees: decimal("totalDocumentationFees", { precision: 15, scale: 2 }).default("0"),
  totalBrokerageFees: decimal("totalBrokerageFees", { precision: 15, scale: 2 }).default("0"),
  // ===== الصور والمستندات =====
  images: text("images"), // JSON array of image URLs
  keyType: mysqlEnum("keyType", ["ميكانيكي", "إلكتروني", "بطاقة_دخول", "بصمة"]).default("ميكانيكي"),
  keysCount: int("keysCount").default(1),
  // ===== الملاحظات =====
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// ==================== UNITS (الوحدات) ====================
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId"),
  propertyName: varchar("propertyName", { length: 255 }),
  unitNumber: varchar("unitNumber", { length: 50 }),
  unitType: mysqlEnum("unitType", ["شقة", "فيلا", "استوديو", "غرفة", "مكتب", "محل", "مستودع", "أخرى"]).default("شقة"),
  floor: varchar("floor", { length: 20 }),
  area: decimal("area", { precision: 10, scale: 2 }),
  rooms: int("rooms"),
  bathrooms: int("bathrooms"),
  status: mysqlEnum("status", ["متاحة", "مؤجرة", "محجوزة", "تحت_الصيانة"]).default("متاحة"),
  rentPrice: decimal("rentPrice", { precision: 15, scale: 2 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  deedNumber: varchar("deedNumber", { length: 50 }),
  ownerName: varchar("ownerName", { length: 255 }),
  ownerIdentity: varchar("ownerIdentity", { length: 20 }),
  notes: text("notes"),
  // تسويق
  isListed: tinyint("isListed").default(0),
  listingDescription: text("listingDescription"),
  listingImageUrl: varchar("listingImageUrl", { length: 500 }),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

// ==================== CONTRACTS (العقود) ====================
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractNumber: varchar("contractNumber", { length: 50 }).notNull(),
  versionNumber: decimal("versionNumber", { precision: 5, scale: 1 }).default("1"),
  contractType: mysqlEnum("contractType", ["سكني", "تجاري"]).default("سكني"),
  status: mysqlEnum("status", ["نشط", "منتهي", "ملغي", "قيد_الانتظار", "مراجعة"]).default("نشط"),
  brokerName: varchar("brokerName", { length: 255 }),
  brokerAgreementNumber: varchar("brokerAgreementNumber", { length: 50 }),
  createdDate: timestamp("createdDate"),
  startDate: date("startDate"),
  endDate: date("endDate"),
  landlordName: varchar("landlordName", { length: 255 }),
  landlordIdentity: varchar("landlordIdentity", { length: 20 }),
  tenantName: varchar("tenantName", { length: 255 }),
  tenantIdentity: varchar("tenantIdentity", { length: 20 }),
  deedNumber: varchar("deedNumber", { length: 50 }),
  propertyId: int("propertyId"),
  propertyName: varchar("propertyName", { length: 255 }),
  propertyType: varchar("propertyType", { length: 100 }),
  unitId: int("unitId"),
  unitType: varchar("unitType", { length: 100 }),
  unitNumber: varchar("unitNumber", { length: 50 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  totalContractValue: decimal("totalContractValue", { precision: 15, scale: 2 }).default("0"),
  totalDocumentationFees: decimal("totalDocumentationFees", { precision: 15, scale: 2 }).default("0"),
  totalDepositAmount: decimal("totalDepositAmount", { precision: 15, scale: 2 }).default("0"),
  brokerageFees: decimal("brokerageFees", { precision: 15, scale: 2 }).default("0"),
  // تكامل إيجار
  ejarContractId: varchar("ejarContractId", { length: 100 }),
  ejarStatus: varchar("ejarStatus", { length: 50 }),
  ejarSyncedAt: timestamp("ejarSyncedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// ==================== FINANCIAL PAYMENTS (الدفعات المالية) ====================
export const financialPayments = mysqlTable("financial_payments", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId"),
  contractNumber: varchar("contractNumber", { length: 50 }),
  versionNumber: decimal("versionNumber", { precision: 5, scale: 1 }),
  tenantIdentity: varchar("tenantIdentity", { length: 20 }),
  tenantName: varchar("tenantName", { length: 255 }),
  landlordIdentity: varchar("landlordIdentity", { length: 20 }),
  landlordName: varchar("landlordName", { length: 255 }),
  contractStartDate: varchar("contractStartDate", { length: 30 }),
  contractEndDate: varchar("contractEndDate", { length: 30 }),
  propertyName: varchar("propertyName", { length: 255 }),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }),
  invoiceDueDate: varchar("invoiceDueDate", { length: 30 }),
  invoiceIssueDate: varchar("invoiceIssueDate", { length: 30 }),
  invoiceLastDueDate: varchar("invoiceLastDueDate", { length: 30 }),
  invoiceStatus: varchar("invoiceStatus", { length: 50 }),
  invoiceStatusDescription: varchar("invoiceStatusDescription", { length: 100 }),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).default("0"),
  paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }).default("0"),
  remainingAmount: decimal("remainingAmount", { precision: 15, scale: 2 }).default("0"),
  installmentNumber: varchar("installmentNumber", { length: 50 }),
  installmentValue: decimal("installmentValue", { precision: 15, scale: 2 }),
  installmentStatus: varchar("installmentStatus", { length: 50 }),
  installmentPaidAmount: decimal("installmentPaidAmount", { precision: 15, scale: 2 }),
  installmentRemainingAmount: decimal("installmentRemainingAmount", { precision: 15, scale: 2 }),
  installmentDueDate: varchar("installmentDueDate", { length: 30 }),
  installmentLastDueDate: varchar("installmentLastDueDate", { length: 30 }),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  paymentStatus: varchar("paymentStatus", { length: 50 }),
  paymentNumber: varchar("paymentNumber", { length: 50 }),
  paymentAmount: decimal("paymentAmount", { precision: 15, scale: 2 }),
  paymentDate: varchar("paymentDate", { length: 30 }),
  receiptMethod: varchar("receiptMethod", { length: 100 }),
  toIban: varchar("toIban", { length: 50 }),
  accountName: varchar("accountName", { length: 255 }),
  transferStatus: varchar("transferStatus", { length: 50 }),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  utiNumber: varchar("utiNumber", { length: 100 }),
  transferDate: varchar("transferDate", { length: 30 }),
  bankName: varchar("bankName", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FinancialPayment = typeof financialPayments.$inferSelect;
export type InsertFinancialPayment = typeof financialPayments.$inferInsert;

// ==================== MAINTENANCE (الصيانة) ====================
export const maintenanceRequests = mysqlTable("maintenance_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestNumber: varchar("requestNumber", { length: 50 }),
  propertyId: int("propertyId"),
  propertyName: varchar("propertyName", { length: 255 }),
  unitId: int("unitId"),
  unitNumber: varchar("unitNumber", { length: 50 }),
  contractId: int("contractId"),
  tenantName: varchar("tenantName", { length: 255 }),
  tenantPhone: varchar("tenantPhone", { length: 20 }),
  technicianId: int("technicianId"),
  technicianName: varchar("technicianName", { length: 255 }),
  category: mysqlEnum("category", ["كهرباء", "سباكة", "تكييف", "نجارة", "دهان", "نظافة", "أمن", "أخرى"]).default("أخرى"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["عاجل", "عالي", "متوسط", "منخفض"]).default("متوسط"),
  status: mysqlEnum("status", ["جديد", "قيد_المعالجة", "منتظر_الموافقة", "مكتمل", "ملغي"]).default("جديد"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  estimatedCost: decimal("estimatedCost", { precision: 15, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 15, scale: 2 }),
  requestDate: timestamp("requestDate").defaultNow(),
  completionDate: timestamp("completionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;

// ==================== EMPLOYEES (الموظفون) ====================
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  role: varchar("role", { length: 100 }),
  userId: int("userId"),
  totalCommercialContracts: int("totalCommercialContracts").default(0),
  totalResidentialContracts: int("totalResidentialContracts").default(0),
  totalRegisteredContracts: int("totalRegisteredContracts").default(0),
  totalPendingContracts: int("totalPendingContracts").default(0),
  totalReviewedContracts: int("totalReviewedContracts").default(0),
  totalDocumentationFees: decimal("totalDocumentationFees", { precision: 15, scale: 2 }).default("0"),
  totalBrokerageFees: decimal("totalBrokerageFees", { precision: 15, scale: 2 }).default("0"),
  totalContractAmounts: decimal("totalContractAmounts", { precision: 15, scale: 2 }).default("0"),
  totalRegions: int("totalRegions").default(0),
  totalCities: int("totalCities").default(0),
  isActive: tinyint("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ==================== TENANTS (المستأجرون) ====================
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  identityNumber: varchar("identityNumber", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  nationality: varchar("nationality", { length: 100 }),
  userId: int("userId"),
  portalAccess: tinyint("portalAccess").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ==================== TECHNICIANS (الفنيون) ====================
export const technicians = mysqlTable("technicians", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  specialty: mysqlEnum("specialty", ["كهرباء", "سباكة", "تكييف", "نجارة", "دهان", "نظافة", "أمن", "عام"]).default("عام"),
  isAvailable: tinyint("isAvailable").default(1),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("5.0"),
  totalJobs: int("totalJobs").default(0),
  completedJobs: int("completedJobs").default(0),
  userId: int("userId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = typeof technicians.$inferInsert;

// ==================== BROKERS (الوسطاء) ====================
export const brokers = mysqlTable("brokers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  licenseNumber: varchar("licenseNumber", { length: 50 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  company: varchar("company", { length: 255 }),
  userId: int("userId"),
  totalContracts: int("totalContracts").default(0),
  totalCommissions: decimal("totalCommissions", { precision: 15, scale: 2 }).default("0"),
  isActive: tinyint("isActive").default(1),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Broker = typeof brokers.$inferSelect;
export type InsertBroker = typeof brokers.$inferInsert;

// ==================== NOTIFICATIONS (الإشعارات) ====================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["واتساب", "بريد_إلكتروني", "رسالة_نصية", "إشعار_داخلي"]).default("إشعار_داخلي"),
  recipientType: mysqlEnum("recipientType", ["مالك", "مستأجر", "موظف", "فني", "وسيط", "عام"]).default("عام"),
  recipientId: int("recipientId"),
  recipientName: varchar("recipientName", { length: 255 }),
  recipientPhone: varchar("recipientPhone", { length: 20 }),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["مجدول", "مرسل", "فشل", "مقروء"]).default("مجدول"),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  relatedType: varchar("relatedType", { length: 50 }),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ==================== LISTINGS (الإعلانات التسويقية) ====================
export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId"),
  propertyId: int("propertyId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  unitType: varchar("unitType", { length: 100 }),
  propertyName: varchar("propertyName", { length: 255 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  area: decimal("area", { precision: 10, scale: 2 }),
  rooms: int("rooms"),
  bathrooms: int("bathrooms"),
  floor: varchar("floor", { length: 20 }),
  rentPrice: decimal("rentPrice", { precision: 15, scale: 2 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  features: text("features"),
  status: mysqlEnum("status", ["نشط", "مؤجر", "موقوف"]).default("نشط"),
  viewCount: int("viewCount").default(0),
  inquiryCount: int("inquiryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

// ==================== VIEWING REQUESTS (طلبات المعاينة) ====================
export const viewingRequests = mysqlTable("viewing_requests", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId"),
  unitId: int("unitId"),
  propertyName: varchar("propertyName", { length: 255 }),
  applicantName: varchar("applicantName", { length: 255 }).notNull(),
  applicantPhone: varchar("applicantPhone", { length: 20 }).notNull(),
  applicantEmail: varchar("applicantEmail", { length: 320 }),
  preferredDate: date("preferredDate"),
  preferredTime: varchar("preferredTime", { length: 50 }),
  message: text("message"),
  status: mysqlEnum("status", ["جديد", "مؤكد", "مكتمل", "ملغي"]).default("جديد"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ViewingRequest = typeof viewingRequests.$inferSelect;
export type InsertViewingRequest = typeof viewingRequests.$inferInsert;

// ==================== COMMUNICATION LOG (سجل التواصل) ====================
export const communicationLog = mysqlTable("communication_log", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["واتساب", "بريد_إلكتروني", "رسالة_نصية", "مكالمة"]).default("رسالة_نصية"),
  direction: mysqlEnum("direction", ["صادر", "وارد"]).default("صادر"),
  recipientName: varchar("recipientName", { length: 255 }),
  recipientPhone: varchar("recipientPhone", { length: 20 }),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message"),
  status: mysqlEnum("status", ["مرسل", "فشل", "معلق"]).default("مرسل"),
  relatedType: varchar("relatedType", { length: 50 }),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = typeof communicationLog.$inferInsert;

// ==================== DOCUMENT TEMPLATES (قوالب المستندات) ====================
export const documentTemplates = mysqlTable("document_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["عقد_إيجار", "عقد_بيع", "عقد_إدارة", "إشعار", "فاتورة", "تقرير", "أخرى"]).default("أخرى"),
  type: mysqlEnum("type", ["واتساب", "بريد_إلكتروني", "رسالة_نصية", "PDF", "طباعة"]).default("PDF"),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  variables: text("variables"), // JSON array of variable names like {{tenant_name}}, {{rent_amount}}
  isActive: tinyint("isActive").default(1),
  usageCount: int("usageCount").default(0),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

// ==================== PROPERTY FORMS (نماذج العقارات) ====================
export const propertyForms = mysqlTable("property_forms", {
  id: int("id").autoincrement().primaryKey(),
  formType: mysqlEnum("formType", ["استلام_وحدة", "تسليم_وحدة", "فحص_دوري", "طلب_صيانة", "شكوى", "طلب_إيجار"]).default("طلب_إيجار"),
  propertyId: int("propertyId"),
  unitId: int("unitId"),
  contractId: int("contractId"),
  submittedBy: varchar("submittedBy", { length: 255 }),
  submitterPhone: varchar("submitterPhone", { length: 20 }),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  formData: text("formData"), // JSON object with form fields
  status: mysqlEnum("status", ["جديد", "قيد_المراجعة", "مكتمل", "مرفوض"]).default("جديد"),
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of file URLs
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PropertyForm = typeof propertyForms.$inferSelect;
export type InsertPropertyForm = typeof propertyForms.$inferInsert;

// ==================== TASKS (المهام والمتابعة) ====================
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["متابعة_عقد", "صيانة", "تحصيل", "تسويق", "إداري", "أخرى"]).default("أخرى"),
  priority: mysqlEnum("priority", ["عاجل", "عالي", "متوسط", "منخفض"]).default("متوسط"),
  status: mysqlEnum("status", ["جديدة", "قيد_التنفيذ", "مكتملة", "ملغاة"]).default("جديدة"),
  assignedTo: int("assignedTo"), // employee id
  relatedType: varchar("relatedType", { length: 50 }), // property, unit, contract, tenant
  relatedId: int("relatedId"),
  dueDate: date("dueDate"),
  completedAt: timestamp("completedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ==================== APPOINTMENTS (المواعيد) ====================
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["معاينة", "توقيع_عقد", "تسليم_وحدة", "استلام_وحدة", "صيانة", "اجتماع", "أخرى"]).default("أخرى"),
  propertyId: int("propertyId"),
  unitId: int("unitId"),
  clientName: varchar("clientName", { length: 255 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  assignedTo: int("assignedTo"), // employee id
  appointmentDate: date("appointmentDate").notNull(),
  appointmentTime: varchar("appointmentTime", { length: 10 }),
  duration: int("duration").default(60), // minutes
  status: mysqlEnum("status", ["مجدول", "مؤكد", "مكتمل", "ملغي", "لم_يحضر"]).default("مجدول"),
  notes: text("notes"),
  reminderSent: tinyint("reminderSent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ==================== EXPENSE CATEGORIES (فئات المصروفات) ====================
export const expenseCategories = mysqlTable("expense_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }).default("#6B7280"),
  isActive: tinyint("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

// ==================== EXPENSES (المصروفات) ====================
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: int("categoryId"),
  propertyId: int("propertyId"),
  unitId: int("unitId"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: date("expenseDate").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["نقدي", "تحويل_بنكي", "شيك", "بطاقة"]).default("نقدي"),
  vendor: varchar("vendor", { length: 255 }),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  description: text("description"),
  attachments: text("attachments"), // JSON array of file URLs
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ==================== INVOICES (الفواتير) ====================
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", ["إيجار", "صيانة", "خدمات", "رسوم_إدارية", "أخرى"]).default("إيجار"),
  contractId: int("contractId"),
  tenantName: varchar("tenantName", { length: 255 }),
  tenantPhone: varchar("tenantPhone", { length: 20 }),
  propertyName: varchar("propertyName", { length: 255 }),
  unitNumber: varchar("unitNumber", { length: 50 }),
  items: text("items"), // JSON array of {description, qty, unitPrice, total}
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["مسودة", "مرسلة", "مدفوعة", "متأخرة", "ملغاة"]).default("مسودة"),
  issueDate: date("issueDate").notNull(),
  dueDate: date("dueDate"),
  paidDate: date("paidDate"),
  notes: text("notes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ==================== SYSTEM SETTINGS (إعدادات النظام) ====================
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  label: varchar("label", { length: 255 }),
  category: varchar("category", { length: 100 }).default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SystemSetting = typeof systemSettings.$inferSelect;

// ==================== PROPERTY DOCUMENTS (وثائق العقارات) ====================
export const propertyDocuments = mysqlTable("property_documents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["صك_ملكية", "رخصة_بناء", "مخطط", "عقد", "صورة", "أخرى"]).default("أخرى"),
  propertyId: int("propertyId"),
  unitId: int("unitId"),
  contractId: int("contractId"),
  fileUrl: text("fileUrl"),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedBy: int("uploadedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PropertyDocument = typeof propertyDocuments.$inferSelect;
export type InsertPropertyDocument = typeof propertyDocuments.$inferInsert;
