export type UserRole = 'admin' | 'employee' | 'owner' | 'tenant' | 'technician' | 'broker';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  nationalId?: string;
  createdAt: string;
  isActive: boolean;
}

// ============================================================
// ERD: Property (العقار) - الكيان الرئيسي
// PK: TitleDeedNumber (رقم وثيقة الملكية)
// ============================================================
export interface Property {
  id: string;
  propertyName: string;
  titleDeedNumber: string;           // PK - رقم وثيقة الملكية
  titleDeedType: string;             // نوع وثيقة الملكية
  ownerId: string;                   // OwnerID (FK → Users)
  propertyType: 'residential' | 'commercial' | 'mixed' | 'land' | 'villa' | 'building' | 'apartment';
  propertyUsage: string;             // PropertyUsage - الاستخدام
  propertyFacility: string;          // PropertyFacility - المرافق
  totalUnits: number;
  totalContracts: number;
  reservedUnits: number;
  rentedUnits: number;
  availableUnits: number;
  totalDocumentationFees: number;    // إجمالي رسوم التوثيق
  totalContractValue: number;        // إجمالي مبلغ العقود
  totalCommission: number;           // إجمالي رسوم السعي
  region: string;
  city: string;
  district?: string;
  address?: string;
  nationalAddress?: string;
  description?: string;
  images?: string[];
  imageUrl?: string;
  reportDate?: string;
  titleDeedIssueDate?: string;
  titleDeedIssuedBy?: string;
  titleDeedDocumentNumber?: string;
  plotNumber?: string;
  planNumber?: string;
  deedArea?: number;
  realEstateRegNumber?: string;
  realEstateRegDate?: string;
  realEstateRegStatus?: string;
  buildingType?: string;
  usagePurpose?: string;
  floors?: number;
  elevators?: number;
  parkingSpots?: number;
  utilities?: string[];
  ownerName?: string;
  ownerIdentity?: string;
  ownerNationality?: string;
  ownershipPercentage?: string;
  ownershipArea?: number;
  ownerType?: string;
  associationName?: string;
  associationRegNumber?: string;
  associationUnifiedNumber?: string;
  associationStatus?: string;
  associationStartDate?: string;
  associationEndDate?: string;
  associationPresidentName?: string;
  associationPresidentMobile?: string;
  propertyManagerName?: string;
  propertyManagerMobile?: string;
  associationTotalFees?: number;
  associationVotersCount?: number;
  associationAcceptanceRate?: string;
  associationNonVoters?: number;
  brokerEstablishmentName?: string;
  brokerCommercialReg?: string;
  reportNotes?: string[];
  status?: 'active' | 'inactive' | 'maintenance';
  name?: string;
  createdAt: string;
  isActive: boolean;
}

// ============================================================
// ERD: Units (الوحدات)
// PK: UnitNumber + TitleDeedNumber (composite)
// FK: TitleDeedNumber → Property
// ============================================================
export interface Unit {
  id: string;
  propertyId: string;
  titleDeedNumber: string;           // FK → Property
  unitNumber: string;                // PK (composite with titleDeedNumber)
  unitStatus: 'available' | 'rented' | 'reserved' | 'maintenance' | 'sold';
  unitType: string;                  // نوع الوحدة (شقة، محل، مكتب...)
  unitArea: number;
  unitServices: string;              // خدمات الوحدة
  furnishedStatus: 'furnished' | 'unfurnished' | 'semi-furnished';
  unitFacilities: string;            // مرافق الوحدة
  brokerageAgreementNumber?: string; // رقم اتفاقية الوساطة
  versionNumber?: string;
  mainContractNumber?: string;       // رقم العقد الأساسي
  subContractNumber?: string;        // رقم عقد الباطن
  contractStatus?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  rentPrice?: number;
  salePrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  region: string;
  city: string;
  images?: string[];
  area?: number;
  createdAt: string;
}

// ============================================================
// ERD: Contracts (العقود)
// PK: ContractNumber
// FK: UnitNumber + TitleDeedNumber → Units
// ============================================================
export interface Contract {
  id: string;
  contractNumber: string;            // PK
  versionNumber: string;
  tenantId: string;                  // TenantID
  tenantName?: string;
  landlordId: string;                // LandlordID
  landlordName?: string;
  unitId: string;
  propertyId: string;
  propertyName?: string;
  titleDeedNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  status: 'active' | 'expired' | 'terminated' | 'pending' | 'renewed';
  // ── الرسوم والضمانات ──────────────────────────────────
  ejarDocumentationFees?: number;      // إجمالي رسوم التوثيق المدفوعة في منصة إيجار
  securityDeposit?: number;            // إجمالي مبلغ الضمان المحجوز (تأمين بداية العقد)
  brokerageCommission?: number;        // رسوم مكتب الوساطة (عمولة التأجير)
  brokerageAgreementNumber?: string;   // رقم اتفاقية الوساطة مع مالك العقار
  // ─────────────────────────────────────────────────────
  notes?: string;
  documents?: string[];
  // Backward-compatible aliases
  startDate?: string;
  endDate?: string;
  annualRent?: number;
  totalContractAmount?: number;
  ownerName?: string;
  createdAt: string;
}

// ============================================================
// ERD: Invoices (الفواتير)
// PK: InvoiceNumber
// FK: ContractNumber → Contracts
// ============================================================
export interface Invoice {
  id: string;
  invoiceNumber: string;             // PK
  contractId: string;
  contractNumber: string;            // FK → Contracts
  invoiceDueDate: string;
  invoiceIssueDate: string;
  invoiceGraceDate: string;          // آخر مهلة مستحقة
  invoiceStatus: 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  invoiceStatusDescription?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  invoiceDate?: string;
  createdAt: string;
}

// ============================================================
// ERD: Installments (الأقساط)
// PK: InstallmentNumber
// FK: InvoiceNumber → Invoices
// ============================================================
export interface Installment {
  id: string;
  installmentNumber: string;         // PK
  invoiceId: string;
  invoiceNumber: string;             // FK → Invoices
  contractId: string;
  installmentValue: number;
  installmentStatus: 'pending' | 'paid' | 'overdue' | 'partial';
  installmentPaid: number;
  installmentRemaining: number;
  installmentDueDate: string;
  installmentGraceDate: string;
  createdAt: string;
}

// ============================================================
// ERD: Payments (الدفعات)
// PK: PaymentNumber
// FK: InstallmentNumber → Installments
// ============================================================
export interface Payment {
  id: string;
  paymentNumber: string;             // PK
  installmentId: string;
  installmentNumber: string;         // FK → Installments
  contractId: string;
  invoiceId: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  paymentStatus: 'completed' | 'pending' | 'failed' | 'reversed' | 'paid' | 'overdue';
  receivingMethod: string;           // طريقة الاستلام
  iban?: string;
  accountName?: string;
  transferStatus?: string;
  referenceNumber?: string;
  uti?: string;
  transferDate?: string;
  bankName?: string;
  notes?: string;
  amount?: number;
  createdAt: string;
}

// ============================================================
// Supporting Entities (غير مذكورة في ERD - مكملة للنظام)
// ============================================================
export interface MaintenanceStatusHistory {
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'pending_approval' | 'quote_submitted' | 'quote_approved' | 'approved' | 'rejected';
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PriceQuote {
  id: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  companyName?: string;
  validUntil?: string;
  items: QuoteItem[];
  subtotal: number;
  vat?: number;
  vatAmount?: number;
  total: number;
  notes?: string;
  fileUrl?: string;
  ownerApproval?: 'pending' | 'approved' | 'rejected' | 'not_required';
  ownerApprovalNote?: string;
  ownerApprovedAt?: string;
  tenantApproval?: 'pending' | 'approved' | 'not_required';
  tenantApprovalNote?: string;
}

export interface MaintenanceRequest {
  id: string;
  requestNumber?: string;
  unitId: string;
  propertyId: string;
  tenantId?: string;
  employeeId?: string;
  technicianId?: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'painting' | 'cleaning' | 'carpentry' | 'civil' | 'pest' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'pending_approval' | 'quote_submitted' | 'quote_approved' | 'approved' | 'rejected' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  requestSource: 'tenant' | 'employee' | 'owner' | 'system';
  ownerApprovalStatus?: 'pending' | 'approved' | 'rejected' | 'not_required';
  ownerApprovalNote?: string;
  ownerApprovedBy?: string;
  ownerApprovedAt?: string;
  priceQuotes?: PriceQuote[];
  activeQuoteId?: string;
  estimatedCost?: number;
  actualCost?: number;
  costApprovedByOwner?: boolean;
  invoiceNumber?: string;
  images?: string[];
  closingImages?: string[];
  notes?: string;
  technicianNotes?: string;
  ownerNotes?: string;
  tenantFeedback?: string;
  rating?: number;
  tenantRating?: number;
  ownerRating?: number;
  statusHistory?: MaintenanceStatusHistory[];
  scheduledDate?: string;
  startedAt?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
  actualHours?: number;
  lastSentSMS?: string;
  lastSentWhatsApp?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  nationality?: string;
  type: 'owner' | 'tenant' | 'buyer' | 'investor' | 'broker';
  source: 'website' | 'whatsapp' | 'referral' | 'social' | 'walk_in' | 'phone' | 'other';
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'closed' | 'lost';
  assignedTo?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  lastContact?: string;
  budget?: number;
  preferredArea?: string;
  preferredType?: string;
  rating?: number;
  nextFollowUp?: string;
  city?: string;
}

export interface TicketComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: string[];
}

export interface TicketStatusHistory {
  status: string;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  propertyId?: string;
  unitId?: string;
  contractId?: string;
  title: string;
  description: string;
  category: 'complaint' | 'inquiry' | 'request' | 'maintenance' | 'billing' | 'legal' | 'other';
  subCategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'escalated' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedTeam?: string;
  resolution?: string;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  satisfactionNote?: string;
  slaDeadline?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  dueDate?: string;
  tags?: string[];
  comments?: TicketComment[];
  statusHistory?: TicketStatusHistory[];
  attachments?: string[];
  relatedTicketId?: string;
  escalatedTo?: string;
  escalationReason?: string;
  isPublic?: boolean;
  channel: 'phone' | 'whatsapp' | 'email' | 'walk_in' | 'portal' | 'sms';
  ticketPrefix?: string;
  lastSentSMS?: string;
  lastSentWhatsApp?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'call' | 'visit' | 'whatsapp' | 'email' | 'meeting' | 'note';
  summary: string;
  outcome?: string;
  employeeId: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  propertyId?: string;
  unitId?: string;
  employeeId: string;
  date: string;
  time: string;
  duration: number;
  type: 'viewing' | 'handover' | 'maintenance' | 'contract' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  result?: string;
  createdAt: string;
}

export interface MarketingListing {
  id: string;
  listingNumber?: string;
  unitId: string;
  propertyId: string;
  title: string;
  description: string;
  price: number;
  priceUnit?: 'yearly' | 'monthly' | 'total';
  type: 'rent' | 'sale';
  images?: string[];
  amenities?: string[];
  featured?: boolean;
  views: number;
  inquiries: number;
  isActive: boolean;
  shareLink?: string;
  createdAt: string;
  expiresAt?: string;
  brokerId?: string;
  commissionRate?: number;
  tags?: string[];
}

export interface MarketingCampaign {
  id: string;
  campaignNumber?: string;
  title: string;
  description?: string;
  platform: 'whatsapp' | 'sms' | 'social' | 'email' | 'website' | 'other';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget?: number;
  spent?: number;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  impressions?: number;
  clicks?: number;
  leads?: number;
  conversions?: number;
  listingIds?: string[];
  createdAt: string;
  createdBy?: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'whatsapp' | 'sms' | 'contract' | 'handover' | 'inspection' | 'maintenance' | 'form' | 'notification' | 'email';
  content: string;
  variables?: string[];
  category: string;
  audience?: 'tenant' | 'owner' | 'broker' | 'technician' | 'all';
  language?: 'ar' | 'en';
  tags?: string[];
  usageCount?: number;
  isPinned?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'contract' | 'appointment' | 'general';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Expense {
  id: string;
  propertyId?: string;
  unitId?: string;
  category: 'maintenance' | 'utilities' | 'management' | 'marketing' | 'other';
  amount: number;
  description: string;
  date: string;
  paidBy: string;
  receipt?: string;
  createdAt: string;
}

// ============================================================
// عقد الوساطة العقارية — وفق اشتراطات هيئة العقار (REGA)
// ============================================================
export interface BrokerageContract {
  id: string;
  contractNumber: string;

  // نوع العقد
  contractType: 'rent' | 'sale' | 'management';
  exclusivity: 'exclusive' | 'non_exclusive';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';

  // بيانات الموكّل (المالك)
  ownerName: string;
  ownerIdentity: string;
  ownerIdentityType: 'national_id' | 'iqama' | 'passport' | 'commercial_reg';
  ownerPhone: string;
  ownerEmail?: string;
  ownerIban?: string;
  ownerAddress?: string;

  // بيانات الوسيط
  brokerName: string;
  brokerLicenseNumber: string;         // رقم رخصة فال
  brokerCommercialReg?: string;        // السجل التجاري
  brokerPhone: string;
  brokerEmail?: string;
  brokerNationalAddress?: string;
  brokerUserId?: string;

  // بيانات العقار
  propertyId?: string;
  propertyDescription: string;         // وصف العقار
  propertyAddress: string;             // عنوان العقار
  propertyCity: string;
  propertyDistrict?: string;
  titleDeedNumber?: string;            // رقم الصك
  propertyType?: string;
  propertyArea?: number;               // المساحة م²

  // شروط التفويض
  authorizedPrice?: number;            // السعر المفوَّض
  minAcceptablePrice?: number;         // أدنى سعر مقبول
  commissionRate: number;              // نسبة العمولة %
  commissionAmount?: number;           // مبلغ العمولة
  commissionPayer: 'owner' | 'buyer_tenant' | 'shared';
  advertisingBudget?: number;          // ميزانية الإعلان

  // مدة العقد
  startDate: string;
  endDate: string;
  renewalDays?: number;                // أيام تجديد تلقائي

  // الإجراءات المفوَّضة
  canSignContracts: boolean;           // صلاحية توقيع العقود
  canReceivePayments: boolean;         // صلاحية استلام المدفوعات
  canAdvertise: boolean;               // صلاحية الإعلان
  canNegotiate: boolean;               // صلاحية التفاوض
  canKeyHandover: boolean;             // صلاحية تسليم المفاتيح

  // التوثيق
  ejarPlatformRef?: string;            // رقم مرجع إيجار
  regaApprovalNumber?: string;         // رقم اعتماد هيئة العقار
  contractDocumentUrl?: string;        // رابط الوثيقة
  witnessName?: string;
  witnessIdentity?: string;

  // النتيجة
  dealStatus?: 'pending' | 'in_progress' | 'deal_done' | 'no_deal';
  dealAmount?: number;
  dealDate?: string;
  tenantBuyerName?: string;
  tenantBuyerIdentity?: string;
  tenantBuyerPhone?: string;

  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// ترخيص الإعلان العقاري — هيئة العقار (REGA)
// ============================================================
export interface AdLicense {
  id: string;
  licenseNumber: string;             // رقم ترخيص الإعلان (من هيئة العقار)
  regaRequestNumber?: string;        // رقم الطلب على منصة هيئة العقار

  // نوع الإعلان
  adType: 'rent' | 'sale' | 'waqf' | 'auction';
  propertyUse: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'mixed';

  // حالة الترخيص
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  rejectionReason?: string;

  // بيانات العقار
  propertyId?: string;
  unitId?: string;
  titleDeedNumber: string;           // رقم الصك / وثيقة الملكية (إلزامي)
  titleDeedType?: string;            // نوع الوثيقة
  propertyDescription: string;
  propertyCity: string;
  propertyDistrict?: string;
  propertyAddress: string;
  propertyArea?: number;             // م²
  propertyType?: string;
  buildingAge?: number;              // عمر المبنى بالسنوات
  floorsCount?: number;
  unitsCount?: number;

  // بيانات المالك
  ownerName: string;
  ownerIdentity: string;
  ownerIdentityType: 'national_id' | 'iqama' | 'passport' | 'commercial_reg';
  ownerPhone: string;
  ownerEmail?: string;

  // بيانات الوسيط/المُعلِن
  advertiserType: 'owner' | 'broker' | 'developer';
  brokerName?: string;
  brokerLicenseNumber?: string;      // رقم رخصة فال
  brokerPhone?: string;
  brokerUserId?: string;

  // السعر الإعلاني
  advertisedPrice?: number;
  priceUnit?: 'yearly' | 'monthly' | 'total';
  negotiable?: boolean;

  // منصات الإعلان المرخّصة
  platforms: ('website' | 'social_media' | 'print' | 'outdoor' | 'sms' | 'other')[];

  // مدة الترخيص
  issueDate?: string;
  expiryDate?: string;
  durationDays?: number;             // المدة الافتراضية 90 يوم

  // الرسوم
  licenseFee?: number;               // رسوم الترخيص
  feesPaid?: boolean;
  paymentRef?: string;

  // وثائق مرفقة
  titleDeedDocUrl?: string;          // رابط الصك
  ownerIdDocUrl?: string;            // هوية المالك
  brokerLicenseDocUrl?: string;      // رخصة الوسيط

  // الإعلان المنشور
  adTitle?: string;
  adDescription?: string;
  adImages?: string[];
  publishedUrl?: string;             // رابط الإعلان المنشور
  views?: number;
  inquiries?: number;

  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}
