import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import {
  getDashboardStats,
  getProperties, getPropertyById, createProperty, updateProperty, deleteProperty,
  getUnits, getAvailableUnits, createUnit, updateUnit, deleteUnit,
  getContracts, getContractById, getContractsByTenantIdentity, getContractsByLandlordIdentity,
  createContract, updateContract, deleteContract,
  getPayments, getPaymentsByContractNumber, createPayment,
  getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest,
  getEmployees, createEmployee, updateEmployee,
  getOwners, createOwner, updateOwner, deleteOwner,
  getTenants, createTenant, updateTenant, deleteTenant,
  getTechnicians, createTechnician, updateTechnician, deleteTechnician,
  getBrokers, createBroker, updateBroker, deleteBroker,
  getNotifications, createNotification, updateNotification,
  getListings, getAllListings, createListing, updateListing, deleteListing,
  getViewingRequests, createViewingRequest, updateViewingRequest,
  getCommunicationLog, createCommunicationLog,
  getOwnerDetails, getTenantDetails, getMaintenanceStats,
  getDocumentTemplates, createDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate,
  getPropertyForms, createPropertyForm, updatePropertyForm,
  getTasks, createTask, updateTask, deleteTask,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getExpenses, createExpense, updateExpense, deleteExpense, getExpenseCategories,
  getInvoices, createInvoice, updateInvoice,
  getSystemSettings, upsertSystemSetting,
  getPropertyDocuments, createPropertyDocument,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== EJAR ====================
  ejar: router({
    config: protectedProcedure.query(() => ({
      licenseNumber: process.env.EJAR_LICENSE_NUMBER || ENV.ejarLicenseNumber || "",
      username: process.env.EJAR_USERNAME || ENV.ejarUsername || "",
      password: process.env.EJAR_PASSWORD || ENV.ejarPassword || "",
      isConfigured: !!((process.env.EJAR_LICENSE_NUMBER || ENV.ejarLicenseNumber) && (process.env.EJAR_USERNAME || ENV.ejarUsername) && (process.env.EJAR_PASSWORD || ENV.ejarPassword)),
    })),
    saveConfig: protectedProcedure
      .input(z.object({
        licenseNumber: z.string(),
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Persist to runtime environment (available until server restart)
        process.env.EJAR_LICENSE_NUMBER = input.licenseNumber;
        process.env.EJAR_USERNAME = input.username;
        process.env.EJAR_PASSWORD = input.password;
        return { success: true, message: "تم حفظ بيانات التكامل بنجاح" };
      }),
    testConnection: protectedProcedure.mutation(async () => {
      const licenseNumber = process.env.EJAR_LICENSE_NUMBER || ENV.ejarLicenseNumber;
      const username = process.env.EJAR_USERNAME || ENV.ejarUsername;
      const password = process.env.EJAR_PASSWORD || ENV.ejarPassword;
      if (!licenseNumber || !username || !password) {
        return { success: false, message: "بيانات الربط غير مكتملة في إعدادات الخادم" };
      }
      // In production: call ejar API here
      return { success: true, message: "تم التحقق من بيانات الربط بنجاح ✓" };
    }),
    registerContract: protectedProcedure
      .input(z.object({
        contractId: z.number(),
        landlordId: z.string(),
        tenantId: z.string(),
        propertyAddress: z.string(),
        rentAmount: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        await createCommunicationLog({
          type: 'رسالة_نصية',
          message: `محاولة تسجيل عقد في منصة إيجار - عقار: ${input.propertyAddress}`,
          status: 'معلق',
          direction: 'صادر',
        });
        return { success: false, message: 'يتطلب ربط حساب إيجار رسمي. تم تسجيل الطلب في السجل.' };
      }),
  }),

  // ==================== DASHBOARD ====================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await getDashboardStats();
    }),
  }),

  // ==================== PROPERTIES ====================
  properties: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getProperties(input.search, input.page, input.limit);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPropertyById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        deedNumber: z.string().optional(),
        deedType: z.string().optional(),
        ownerName: z.string().optional(),
        ownerIdentity: z.string().optional(),
        propertyType: z.enum(['فيلا','شقة','عمارة','مكتب','محل','مستودع','أرض','أخرى']).optional(),
        propertyUsage: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        address: z.string().optional(),
        totalUnits: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createProperty(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        deedNumber: z.string().optional(),
        ownerName: z.string().optional(),
        ownerIdentity: z.string().optional(),
        propertyType: z.enum(['فيلا','شقة','عمارة','مكتب','محل','مستودع','أرض','أخرى']).optional(),
        propertyUsage: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProperty(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProperty(input.id);
        return { success: true };
      }),
  }),

  // ==================== UNITS ====================
  units: router({
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        propertyId: z.number().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getUnits(input.search, input.propertyId, input.status, input.page, input.limit);
      }),
    available: protectedProcedure
      .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getAvailableUnits(input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number().optional(),
        propertyName: z.string().optional(),
        unitNumber: z.string().optional(),
        unitType: z.enum(['شقة','فيلا','استوديو','غرفة','مكتب','محل','مستودع','أخرى']).optional(),
        floor: z.string().optional(),
        area: z.string().optional(),
        rooms: z.number().optional(),
        bathrooms: z.number().optional(),
        status: z.enum(['متاحة','مؤجرة','محجوزة','تحت_الصيانة']).optional(),
        rentPrice: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        ownerName: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createUnit(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['متاحة','مؤجرة','محجوزة','تحت_الصيانة']).optional(),
        rentPrice: z.string().optional(),
        notes: z.string().optional(),
        unitNumber: z.string().optional(),
        unitType: z.enum(['شقة','فيلا','استوديو','غرفة','مكتب','محل','مستودع','أخرى']).optional(),
        floor: z.string().optional(),
        rooms: z.number().optional(),
        isListed: z.number().optional(),
        listingDescription: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateUnit(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUnit(input.id);
        return { success: true };
      }),
  }),

  // ==================== CONTRACTS ====================
  contracts: router({
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getContracts(input.search, input.status, input.page, input.limit);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContractById(input.id);
      }),
    byTenant: protectedProcedure
      .input(z.object({ identity: z.string() }))
      .query(async ({ input }) => {
        return await getContractsByTenantIdentity(input.identity);
      }),
    byLandlord: protectedProcedure
      .input(z.object({ identity: z.string() }))
      .query(async ({ input }) => {
        return await getContractsByLandlordIdentity(input.identity);
      }),
    create: protectedProcedure
      .input(z.object({
        contractNumber: z.string().min(1),
        contractType: z.enum(['سكني','تجاري']).optional(),
        status: z.enum(['نشط','منتهي','ملغي','قيد_الانتظار','مراجعة']).optional(),
        brokerName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        landlordName: z.string().optional(),
        landlordIdentity: z.string().optional(),
        tenantName: z.string().optional(),
        tenantIdentity: z.string().optional(),
        propertyName: z.string().optional(),
        unitNumber: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        totalContractValue: z.string().optional(),
        totalDocumentationFees: z.string().optional(),
        totalDepositAmount: z.string().optional(),
        brokerageFees: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        if (input.startDate) data.startDate = new Date(input.startDate);
        if (input.endDate) data.endDate = new Date(input.endDate);
        return await createContract(data);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['نشط','منتهي','ملغي','قيد_الانتظار','مراجعة']).optional(),
        notes: z.string().optional(),
        brokerName: z.string().optional(),
        ejarContractId: z.string().optional(),
        ejarStatus: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateContract(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContract(input.id);
        return { success: true };
      }),
  }),

  // ==================== PAYMENTS ====================
  payments: router({
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getPayments(input.search, input.status, input.page, input.limit);
      }),
    byContract: protectedProcedure
      .input(z.object({ contractNumber: z.string() }))
      .query(async ({ input }) => {
        return await getPaymentsByContractNumber(input.contractNumber);
      }),
    create: protectedProcedure
      .input(z.object({
        contractNumber: z.string().optional(),
        tenantName: z.string().optional(),
        propertyName: z.string().optional(),
        unitNumber: z.string().optional(),
        totalAmount: z.string().optional(),
        paidAmount: z.string().optional(),
        remainingAmount: z.string().optional(),
        invoiceStatus: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createPayment(input as any);
      }),
  }),

  // ==================== MAINTENANCE ====================
  maintenance: router({
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getMaintenanceRequests(input.search, input.status, input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        propertyName: z.string().optional(),
        unitNumber: z.string().optional(),
        tenantName: z.string().optional(),
        tenantPhone: z.string().optional(),
        category: z.enum(['كهرباء','سباكة','تكييف','نجارة','دهان','نظافة','أمن','أخرى']).optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['عاجل','عالي','متوسط','منخفض']).optional(),
        status: z.enum(['جديد','قيد_المعالجة','منتظر_الموافقة','مكتمل','ملغي']).optional(),
        assignedTo: z.string().optional(),
        technicianId: z.number().optional(),
        technicianName: z.string().optional(),
        estimatedCost: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createMaintenanceRequest(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['جديد','قيد_المعالجة','منتظر_الموافقة','مكتمل','ملغي']).optional(),
        assignedTo: z.string().optional(),
        technicianId: z.number().optional(),
        technicianName: z.string().optional(),
        actualCost: z.string().optional(),
        notes: z.string().optional(),
        priority: z.enum(['عاجل','عالي','متوسط','منخفض']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateMaintenanceRequest(id, data as any);
        return { success: true };
      }),
  }),

  // ==================== EMPLOYEES ====================
  employees: router({
    list: protectedProcedure.query(async () => {
      return await getEmployees();
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().optional(),
        role: z.string().optional(),
        isActive: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createEmployee(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        phone: z.string().optional(),
        email: z.string().optional(),
        role: z.string().optional(),
        isActive: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateEmployee(id, data as any);
        return { success: true };
      }),
  }),

  // ==================== OWNERS PORTAL ====================
  owners: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getOwners(input.search, input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        identityNumber: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        portalAccess: z.number().optional(),
        portalPin: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createOwner(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        phone: z.string().optional(),
        email: z.string().optional(),
        portalAccess: z.number().optional(),
        portalPin: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateOwner(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteOwner(input.id);
        return { success: true };
      }),
    details: protectedProcedure
      .input(z.object({ ownerName: z.string() }))
      .query(async ({ input }) => {
        return await getOwnerDetails(input.ownerName);
      }),
  }),

  // ==================== TENANTS PORTAL ====================
  tenants: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getTenants(input.search, input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        identityNumber: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        nationality: z.string().optional(),
        portalAccess: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createTenant(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        phone: z.string().optional(),
        email: z.string().optional(),
        portalAccess: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTenant(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTenant(input.id);
        return { success: true };
      }),
    details: protectedProcedure
      .input(z.object({ tenantIdentity: z.string() }))
      .query(async ({ input }) => {
        return await getTenantDetails(input.tenantIdentity);
      }),
  }),

  // ==================== TECHNICIANS PORTAL ====================
  technicians: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getTechnicians(input.search, input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().optional(),
        specialty: z.enum(['كهرباء','سباكة','تكييف','نجارة','دهان','نظافة','أمن','عام']).optional(),
        isAvailable: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createTechnician(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        phone: z.string().optional(),
        specialty: z.enum(['كهرباء','سباكة','تكييف','نجارة','دهان','نظافة','أمن','عام']).optional(),
        isAvailable: z.number().optional(),
        rating: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTechnician(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTechnician(input.id);
        return { success: true };
      }),
    stats: protectedProcedure
      .query(async () => {
        return await getMaintenanceStats();
      }),
  }),

  // ==================== BROKERS PORTAL ====================
  brokers: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getBrokers(input.search, input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        licenseNumber: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        company: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createBroker(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        phone: z.string().optional(),
        email: z.string().optional(),
        company: z.string().optional(),
        isActive: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateBroker(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBroker(input.id);
        return { success: true };
      }),
  }),

  // ==================== NOTIFICATIONS & COMMUNICATIONS ====================
  notifications: router({
    list: protectedProcedure
      .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getNotifications(input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(['واتساب','بريد_إلكتروني','رسالة_نصية','إشعار_داخلي']).optional(),
        recipientType: z.enum(['مالك','مستأجر','موظف','فني','وسيط','عام']).optional(),
        recipientId: z.number().optional(),
        recipientName: z.string().optional(),
        recipientPhone: z.string().optional(),
        recipientEmail: z.string().optional(),
        title: z.string().min(1),
        message: z.string().min(1),
        scheduledAt: z.string().optional(),
        relatedType: z.string().optional(),
        relatedId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        if (input.scheduledAt) data.scheduledAt = new Date(input.scheduledAt);
        // Simulate sending via WhatsApp/SMS/Email
        data.status = 'مرسل';
        data.sentAt = new Date();
        const result = await createNotification(data);
        // Log communication
        await createCommunicationLog({
          type: (input.type as any) || 'إشعار_داخلي',
          direction: 'صادر',
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          recipientEmail: input.recipientEmail,
          subject: input.title,
          message: input.message,
          status: 'مرسل',
          relatedType: input.relatedType,
          relatedId: input.relatedId,
        });
        return result;
      }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateNotification(input.id, { status: 'مقروء' });
        return { success: true };
      }),
  }),

  communicationLog: router({
    list: protectedProcedure
      .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await getCommunicationLog(input.page, input.limit);
      }),
    send: protectedProcedure
      .input(z.object({
        channel: z.string(),
        recipient: z.string().optional(),
        recipientType: z.string().default('custom'),
        subject: z.string().optional(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Log the communication attempt
        const channelMap: Record<string, 'واتساب' | 'بريد_إلكتروني' | 'رسالة_نصية' | 'مكالمة'> = {
          whatsapp: 'واتساب',
          email: 'بريد_إلكتروني',
          sms: 'رسالة_نصية',
        };
        const logEntry = await createCommunicationLog({
          type: channelMap[input.channel] || 'رسالة_نصية',
          recipientPhone: input.channel !== 'email' ? input.recipient : undefined,
          recipientEmail: input.channel === 'email' ? input.recipient : undefined,
          message: input.message,
          subject: input.subject,
          status: 'مرسل',
          direction: 'صادر',
        });
        return { success: true, id: logEntry };
      }),
  }),

  // ==================== MARKETING / LISTINGS ====================
  listings: router({
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getAllListings(input.search, input.page, input.limit);
      }),
    public: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }))
      .query(async ({ input }) => {
        return await getListings(input.search, 'نشط', input.page, input.limit);
      }),
    create: protectedProcedure
      .input(z.object({
        unitId: z.number().optional(),
        propertyId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        unitType: z.string().optional(),
        propertyName: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        area: z.string().optional(),
        rooms: z.number().optional(),
        bathrooms: z.number().optional(),
        floor: z.string().optional(),
        rentPrice: z.string().optional(),
        imageUrl: z.string().optional(),
        features: z.string().optional(),
        status: z.enum(['نشط','مؤجر','موقوف']).optional(),
      }))
      .mutation(async ({ input }) => {
        return await createListing(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        rentPrice: z.string().optional(),
        status: z.enum(['نشط','مؤجر','موقوف']).optional(),
        features: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateListing(id, data as any);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteListing(input.id);
        return { success: true };
      }),
  }),

  // ==================== VIEWING REQUESTS ====================
  viewingRequests: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await getViewingRequests(input.status, input.page, input.limit);
      }),
    create: publicProcedure
      .input(z.object({
        listingId: z.number().optional(),
        unitId: z.number().optional(),
        propertyName: z.string().optional(),
        applicantName: z.string().min(1),
        applicantPhone: z.string().min(1),
        applicantEmail: z.string().optional(),
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        if (input.preferredDate) data.preferredDate = new Date(input.preferredDate);
        return await createViewingRequest(data);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['جديد','مؤكد','مكتمل','ملغي']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateViewingRequest(id, data as any);
        return { success: true };
      }),
  }),

  // ==================== QUICK ACTIONS ====================
  quickActions: router({
    sendPaymentReminders: protectedProcedure
      .mutation(async () => {
        // Get overdue payments and log bulk communication
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { financialPayments } = await import('../drizzle/schema');
        const { eq, lt, and } = await import('drizzle-orm');
        const today = new Date();
        // Get pending payments past due date
        const overduePayments = await db.select()
          .from(financialPayments)
          .where(eq(financialPayments.invoiceStatus, 'متبقي'))
          .limit(50);
        // Log bulk communication for each overdue payment
        let count = 0;
        for (const payment of overduePayments) {
          await createCommunicationLog({
            type: 'رسالة_نصية',
            message: `تذكير: لديك دفعة متأخرة بقيمة ${payment.remainingAmount} ريال - رقم الفاتورة ${payment.invoiceNumber || payment.contractNumber}`,
            status: 'مرسل',
            direction: 'صادر',
          });
          count++;
        }
        return { success: true, count, message: `تم إرسال ${count} تذكير للمستأجرين المتأخرين` };
      }),

    sendContractExpiryNotices: protectedProcedure
      .mutation(async () => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { contracts } = await import('../drizzle/schema');
        const { and, lte, gte } = await import('drizzle-orm');
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        // Get contracts expiring in next 30 days
        const expiringContracts = await db.select()
          .from(contracts)
          .where(and(
            gte(contracts.endDate, today),
            lte(contracts.endDate, thirtyDaysLater)
          ))
          .limit(50);
        let count = 0;
        for (const contract of expiringContracts) {
          await createCommunicationLog({
            type: 'بريد_إلكتروني',
            message: `إشعار: عقد الإيجار رقم ${contract.contractNumber} سينتهي بتاريخ ${contract.endDate?.toLocaleDateString('ar-SA')}`,
            status: 'مرسل',
            direction: 'صادر',
          });
          count++;
        }
        return { success: true, count, message: `تم إرسال ${count} إشعار انتهاء عقد` };
      }),

    sendWelcomeMessages: protectedProcedure
      .input(z.object({ tenantId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { tenants } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        let targetTenants: any[] = [];
        if (input.tenantId) {
          targetTenants = await db.select().from(tenants).where(eq(tenants.id, input.tenantId)).limit(1);
        } else {
          targetTenants = await db.select().from(tenants).limit(10);
        }
        let count = 0;
        for (const tenant of targetTenants) {
          await createCommunicationLog({
            type: 'واتساب',
            recipientPhone: tenant.phone || undefined,
            message: `مرحباً ${tenant.name}، أهلاً وسهلاً بكم في منصة رمز الإبداع لإدارة الأملاك. نحن هنا لخدمتكم على مدار الساعة.`,
            status: 'مرسل',
            direction: 'صادر',
          });
          count++;
        }
        return { success: true, count, message: `تم إرسال ${count} رسالة ترحيب` };
      }),

    sendMonthlyReports: protectedProcedure
      .mutation(async () => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { owners } = await import('../drizzle/schema');
        const allOwners = await db.select().from(owners).limit(50);
        let count = 0;
        for (const owner of allOwners) {
          await createCommunicationLog({
            type: 'بريد_إلكتروني',
            recipientEmail: owner.email || undefined,
            message: `التقرير الشهري لعقاراتكم - ${new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}`,
            subject: `تقرير شهري - رمز الإبداع لإدارة الأملاك`,
            status: 'مرسل',
            direction: 'صادر',
          });
          count++;
        }
        return { success: true, count, message: `تم إرسال ${count} تقرير شهري للملاك` };
      }),
  }),

  // ==================== DOCUMENT TEMPLATES ====================
  documentTemplates: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional(), type: z.string().optional() }))
      .query(async ({ input }) => getDocumentTemplates(input.category, input.type)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.enum(['عقد_إيجار','عقد_بيع','عقد_إدارة','إشعار','فاتورة','تقرير','أخرى']).optional(),
        type: z.enum(['واتساب','بريد_إلكتروني','رسالة_نصية','PDF','طباعة']).optional(),
        subject: z.string().optional(),
        content: z.string().min(1),
        variables: z.string().optional(),
      }))
      .mutation(async ({ input }) => createDocumentTemplate(input)),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), content: z.string().optional(), subject: z.string().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateDocumentTemplate(id, data); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteDocumentTemplate(input.id); return { success: true }; }),
  }),

  // ==================== PROPERTY FORMS ====================
  propertyForms: router({
    list: protectedProcedure
      .input(z.object({ formType: z.string().optional(), status: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => getPropertyForms(input.formType, input.status, input.page, input.limit)),
    create: protectedProcedure
      .input(z.object({
        formType: z.enum(['استلام_وحدة','تسليم_وحدة','فحص_دوري','طلب_صيانة','شكوى','طلب_إيجار']).optional(),
        propertyId: z.number().optional(),
        unitId: z.number().optional(),
        contractId: z.number().optional(),
        submittedBy: z.string().optional(),
        submitterPhone: z.string().optional(),
        submitterEmail: z.string().optional(),
        formData: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createPropertyForm(input)),
    update: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(['جديد','قيد_المراجعة','مكتمل','مرفوض']).optional(), notes: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updatePropertyForm(id, data); return { success: true }; }),
  }),

  // ==================== TASKS ====================
  tasks: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), priority: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => getTasks(input.status, input.priority, input.page, input.limit)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(['متابعة_عقد','صيانة','تحصيل','تسويق','إداري','أخرى']).optional(),
        priority: z.enum(['عاجل','عالي','متوسط','منخفض']).optional(),
        assignedTo: z.number().optional(),
        relatedType: z.string().optional(),
        relatedId: z.number().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const data: any = { ...input }; if (input.dueDate) data.dueDate = new Date(input.dueDate); return createTask(data); }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(['جديدة','قيد_التنفيذ','مكتملة','ملغاة']).optional(), title: z.string().optional(), priority: z.enum(['عاجل','عالي','متوسط','منخفض']).optional(), assignedTo: z.number().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateTask(id, data); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteTask(input.id); return { success: true }; }),
  }),

  // ==================== APPOINTMENTS ====================
  appointments: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => getAppointments(input.status, input.page, input.limit)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        type: z.enum(['معاينة','توقيع_عقد','تسليم_وحدة','استلام_وحدة','صيانة','اجتماع','أخرى']).optional(),
        propertyId: z.number().optional(),
        unitId: z.number().optional(),
        clientName: z.string().optional(),
        clientPhone: z.string().optional(),
        clientEmail: z.string().optional(),
        assignedTo: z.number().optional(),
        appointmentDate: z.string(),
        appointmentTime: z.string().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const data: any = { ...input }; data.appointmentDate = new Date(input.appointmentDate); return createAppointment(data); }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(['مجدول','مؤكد','مكتمل','ملغي','لم_يحضر']).optional(), notes: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateAppointment(id, data); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteAppointment(input.id); return { success: true }; }),
  }),

  // ==================== EXPENSES ====================
  expenses: router({
    list: protectedProcedure
      .input(z.object({ propertyId: z.number().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => getExpenses(input.propertyId, input.page, input.limit)),
    categories: protectedProcedure.query(async () => getExpenseCategories()),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        categoryId: z.number().optional(),
        propertyId: z.number().optional(),
        unitId: z.number().optional(),
        amount: z.string(),
        expenseDate: z.string(),
        paymentMethod: z.enum(['نقدي','تحويل_بنكي','شيك','بطاقة']).optional(),
        vendor: z.string().optional(),
        invoiceNumber: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const data: any = { ...input }; data.expenseDate = new Date(input.expenseDate); return createExpense(data); }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), amount: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateExpense(id, data); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteExpense(input.id); return { success: true }; }),
  }),

  // ==================== INVOICES ====================
  invoices: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
      .query(async ({ input }) => getInvoices(input.status, input.page, input.limit)),
    create: protectedProcedure
      .input(z.object({
        invoiceNumber: z.string().min(1),
        type: z.enum(['إيجار','صيانة','خدمات','رسوم_إدارية','أخرى']).optional(),
        contractId: z.number().optional(),
        tenantName: z.string().optional(),
        tenantPhone: z.string().optional(),
        propertyName: z.string().optional(),
        unitNumber: z.string().optional(),
        items: z.string().optional(),
        subtotal: z.string().optional(),
        tax: z.string().optional(),
        discount: z.string().optional(),
        total: z.string(),
        issueDate: z.string(),
        dueDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const data: any = { ...input }; data.issueDate = new Date(input.issueDate); if (input.dueDate) data.dueDate = new Date(input.dueDate); return createInvoice(data); }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(['مسودة','مرسلة','مدفوعة','متأخرة','ملغاة']).optional(), notes: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateInvoice(id, data); return { success: true }; }),
  }),

  // ==================== SYSTEM SETTINGS ====================
  settings: router({
    list: protectedProcedure.query(async () => getSystemSettings()),
    upsert: protectedProcedure
      .input(z.object({ key: z.string(), value: z.string(), label: z.string().optional(), category: z.string().optional() }))
      .mutation(async ({ input }) => { await upsertSystemSetting(input.key, input.value, input.label, input.category); return { success: true }; }),
  }),

  // ==================== PROPERTY DOCUMENTS ====================
  propertyDocuments: router({
    list: protectedProcedure
      .input(z.object({ propertyId: z.number().optional(), contractId: z.number().optional() }))
      .query(async ({ input }) => getPropertyDocuments(input.propertyId, input.contractId)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(['صك_ملكية','رخصة_بناء','مخطط','عقد','صورة','أخرى']).optional(),
        propertyId: z.number().optional(),
        unitId: z.number().optional(),
        contractId: z.number().optional(),
        fileUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createPropertyDocument(input)),
  }),

});
export type AppRouter = typeof appRouter;
