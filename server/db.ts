import { eq, like, desc, count, and, sql, or, inArray } from "drizzle-orm";
import { drizzle as drizzleMySql } from "drizzle-orm/mysql2";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  users, InsertUser,
  properties, InsertProperty,
  units, InsertUnit,
  contracts, InsertContract,
  financialPayments, InsertFinancialPayment,
  maintenanceRequests, InsertMaintenanceRequest,
  employees, InsertEmployee,
  owners, InsertOwner,
  tenants, InsertTenant,
  technicians, InsertTechnician,
  brokers, InsertBroker,
  notifications, InsertNotification,
  listings, InsertListing,
  viewingRequests, InsertViewingRequest,
  communicationLog, InsertCommunicationLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: any = null;
let _isPostgres = false;

export async function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!_db && connectionString) {
    try {
      _isPostgres = connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://");
      if (_isPostgres) {
        const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
        _db = drizzlePg(pool);
      } else {
        _db = drizzleMySql(connectionString);
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  if (_isPostgres) {
    await (db as any)
      .insert(users as any)
      .values(values)
      .onConflictDoUpdate({ target: (users as any).openId, set: updateSet });
  } else {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== DASHBOARD STATS ====================
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [propCount] = await db.select({ count: count() }).from(properties);
  const [unitCount] = await db.select({ count: count() }).from(units);
  const [contractCount] = await db.select({ count: count() }).from(contracts);
  const [activeContracts] = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, 'نشط'));
  const [maintenanceCount] = await db.select({ count: count() }).from(maintenanceRequests).where(eq(maintenanceRequests.status, 'جديد'));
  const [tenantCount] = await db.select({ count: count() }).from(tenants);
  const [listingCount] = await db.select({ count: count() }).from(listings).where(eq(listings.status, 'نشط'));
  const [viewingCount] = await db.select({ count: count() }).from(viewingRequests).where(eq(viewingRequests.status, 'جديد'));

  const [financialSums] = await db.select({
    totalAmount: sql<number>`COALESCE(SUM(totalAmount), 0)`,
    paidAmount: sql<number>`COALESCE(SUM(paidAmount), 0)`,
    remainingAmount: sql<number>`COALESCE(SUM(remainingAmount), 0)`,
  }).from(financialPayments);

  const [contractSums] = await db.select({
    totalValue: sql<number>`COALESCE(SUM(totalContractValue), 0)`,
  }).from(contracts);

  const unitsByStatus = await db.select({
    status: units.status,
    count: count(),
  }).from(units).groupBy(units.status);

  const contractsByType = await db.select({
    type: contracts.contractType,
    count: count(),
  }).from(contracts).groupBy(contracts.contractType);

  const recentContracts = await db.select().from(contracts).orderBy(desc(contracts.createdAt)).limit(5);

  return {
    totalProperties: propCount?.count ?? 0,
    totalUnits: unitCount?.count ?? 0,
    totalContracts: contractCount?.count ?? 0,
    activeContracts: activeContracts?.count ?? 0,
    pendingMaintenance: maintenanceCount?.count ?? 0,
    totalTenants: tenantCount?.count ?? 0,
    activeListings: listingCount?.count ?? 0,
    pendingViewings: viewingCount?.count ?? 0,
    totalContractValue: Number(contractSums?.totalValue ?? 0),
    totalPayments: Number(financialSums?.totalAmount ?? 0),
    paidAmount: Number(financialSums?.paidAmount ?? 0),
    remainingAmount: Number(financialSums?.remainingAmount ?? 0),
    unitsByStatus,
    contractsByType,
    recentContracts,
  };
}

// ==================== PROPERTIES ====================
export async function getProperties(search?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = search ? like(properties.name, `%${search}%`) : undefined;
  const data = where
    ? await db.select().from(properties).where(where).orderBy(desc(properties.createdAt)).limit(limit).offset(offset)
    : await db.select().from(properties).orderBy(desc(properties.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(properties).where(where)
    : await db.select({ count: count() }).from(properties);
  return { data, total: totalRow?.count ?? 0 };
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(properties).values(data);
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(properties).set(data).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(properties).where(eq(properties.id, id));
}

// ==================== UNITS ====================
export async function getUnits(search?: string, propertyId?: number, status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const conditions = [];
  if (search) conditions.push(like(units.unitNumber, `%${search}%`));
  if (propertyId) conditions.push(eq(units.propertyId, propertyId));
  if (status) conditions.push(eq(units.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = where
    ? await db.select().from(units).where(where).orderBy(desc(units.createdAt)).limit(limit).offset(offset)
    : await db.select().from(units).orderBy(desc(units.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(units).where(where)
    : await db.select({ count: count() }).from(units);
  return { data, total: totalRow?.count ?? 0 };
}

export async function getAvailableUnits(page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const data = await db.select().from(units).where(eq(units.status, 'متاحة')).limit(limit).offset(offset);
  const [totalRow] = await db.select({ count: count() }).from(units).where(eq(units.status, 'متاحة'));
  return { data, total: totalRow?.count ?? 0 };
}

export async function createUnit(data: InsertUnit) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(units).values(data);
}

export async function updateUnit(id: number, data: Partial<InsertUnit>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(units).set(data).where(eq(units.id, id));
}

export async function deleteUnit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(units).where(eq(units.id, id));
}

// ==================== CONTRACTS ====================
export async function getContracts(search?: string, status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const conditions = [];
  if (search) conditions.push(or(like(contracts.tenantName, `%${search}%`), like(contracts.contractNumber, `%${search}%`)));
  if (status) conditions.push(eq(contracts.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = where
    ? await db.select().from(contracts).where(where).orderBy(desc(contracts.createdAt)).limit(limit).offset(offset)
    : await db.select().from(contracts).orderBy(desc(contracts.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(contracts).where(where)
    : await db.select({ count: count() }).from(contracts);
  return { data, total: totalRow?.count ?? 0 };
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getContractsByTenantIdentity(identity: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contracts).where(eq(contracts.tenantIdentity, identity)).orderBy(desc(contracts.createdAt));
}

export async function getContractsByLandlordIdentity(identity: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contracts).where(eq(contracts.landlordIdentity, identity)).orderBy(desc(contracts.createdAt));
}

export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(contracts).values(data);
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contracts).set(data).where(eq(contracts.id, id));
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(contracts).where(eq(contracts.id, id));
}

// ==================== FINANCIAL PAYMENTS ====================
export async function getPayments(search?: string, status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const conditions = [];
  if (search) conditions.push(like(financialPayments.contractNumber, `%${search}%`));
  if (status) conditions.push(eq(financialPayments.invoiceStatus, status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = where
    ? await db.select().from(financialPayments).where(where).orderBy(desc(financialPayments.createdAt)).limit(limit).offset(offset)
    : await db.select().from(financialPayments).orderBy(desc(financialPayments.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(financialPayments).where(where)
    : await db.select({ count: count() }).from(financialPayments);
  return { data, total: totalRow?.count ?? 0 };
}

export async function getPaymentsByContractNumber(contractNumber: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(financialPayments).where(eq(financialPayments.contractNumber, contractNumber));
}

export async function createPayment(data: InsertFinancialPayment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(financialPayments).values(data);
}

// ==================== MAINTENANCE ====================
export async function getMaintenanceRequests(search?: string, status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const conditions = [];
  if (search) conditions.push(like(maintenanceRequests.title, `%${search}%`));
  if (status) conditions.push(eq(maintenanceRequests.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = where
    ? await db.select().from(maintenanceRequests).where(where).orderBy(desc(maintenanceRequests.createdAt)).limit(limit).offset(offset)
    : await db.select().from(maintenanceRequests).orderBy(desc(maintenanceRequests.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(maintenanceRequests).where(where)
    : await db.select({ count: count() }).from(maintenanceRequests);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createMaintenanceRequest(data: InsertMaintenanceRequest) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(maintenanceRequests).values(data);
}

export async function updateMaintenanceRequest(id: number, data: Partial<InsertMaintenanceRequest>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(maintenanceRequests).set(data).where(eq(maintenanceRequests.id, id));
}

// ==================== EMPLOYEES ====================
export async function getEmployees() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employees).orderBy(desc(employees.totalContractAmounts));
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(employees).values(data);
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(employees).set(data).where(eq(employees.id, id));
}

// ==================== OWNERS ====================
export async function getOwners(search?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = search ? like(owners.name, `%${search}%`) : undefined;
  const data = where
    ? await db.select().from(owners).where(where).orderBy(owners.name).limit(limit).offset(offset)
    : await db.select().from(owners).orderBy(owners.name).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(owners).where(where)
    : await db.select({ count: count() }).from(owners);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createOwner(data: InsertOwner) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(owners).values(data);
}

export async function updateOwner(id: number, data: Partial<InsertOwner>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(owners).set(data).where(eq(owners.id, id));
}

export async function deleteOwner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(owners).where(eq(owners.id, id));
}

// ==================== TENANTS ====================
export async function getTenants(search?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = search ? or(like(tenants.name, `%${search}%`), like(tenants.phone, `%${search}%`)) : undefined;
  const data = where
    ? await db.select().from(tenants).where(where).orderBy(tenants.name).limit(limit).offset(offset)
    : await db.select().from(tenants).orderBy(tenants.name).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(tenants).where(where)
    : await db.select({ count: count() }).from(tenants);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createTenant(data: InsertTenant) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(tenants).values(data);
}

export async function updateTenant(id: number, data: Partial<InsertTenant>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tenants).set(data).where(eq(tenants.id, id));
}

export async function deleteTenant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tenants).where(eq(tenants.id, id));
}

// ==================== TECHNICIANS ====================
export async function getTechnicians(search?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = search ? like(technicians.name, `%${search}%`) : undefined;
  const data = where
    ? await db.select().from(technicians).where(where).orderBy(technicians.name).limit(limit).offset(offset)
    : await db.select().from(technicians).orderBy(technicians.name).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(technicians).where(where)
    : await db.select({ count: count() }).from(technicians);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createTechnician(data: InsertTechnician) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(technicians).values(data);
}

export async function updateTechnician(id: number, data: Partial<InsertTechnician>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(technicians).set(data).where(eq(technicians.id, id));
}

export async function deleteTechnician(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(technicians).where(eq(technicians.id, id));
}

// ==================== BROKERS ====================
export async function getBrokers(search?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = search ? like(brokers.name, `%${search}%`) : undefined;
  const data = where
    ? await db.select().from(brokers).where(where).orderBy(brokers.name).limit(limit).offset(offset)
    : await db.select().from(brokers).orderBy(brokers.name).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(brokers).where(where)
    : await db.select({ count: count() }).from(brokers);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createBroker(data: InsertBroker) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(brokers).values(data);
}

export async function updateBroker(id: number, data: Partial<InsertBroker>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(brokers).set(data).where(eq(brokers.id, id));
}

export async function deleteBroker(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(brokers).where(eq(brokers.id, id));
}

// ==================== NOTIFICATIONS ====================
export async function getNotifications(page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const data = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
  const [totalRow] = await db.select({ count: count() }).from(notifications);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(notifications).values(data);
}

export async function updateNotification(id: number, data: Partial<InsertNotification>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(notifications).set(data).where(eq(notifications.id, id));
}

// ==================== LISTINGS ====================
export async function getListings(search?: string, status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const conditions = [];
  if (search) conditions.push(or(like(listings.title, `%${search}%`), like(listings.city, `%${search}%`)));
  if (status) conditions.push(eq(listings.status, status as any));
  else conditions.push(eq(listings.status, 'نشط'));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = where
    ? await db.select().from(listings).where(where).orderBy(desc(listings.createdAt)).limit(limit).offset(offset)
    : await db.select().from(listings).orderBy(desc(listings.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(listings).where(where)
    : await db.select({ count: count() }).from(listings);
  return { data, total: totalRow?.count ?? 0 };
}

export async function getAllListings(search?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = search ? like(listings.title, `%${search}%`) : undefined;
  const data = where
    ? await db.select().from(listings).where(where).orderBy(desc(listings.createdAt)).limit(limit).offset(offset)
    : await db.select().from(listings).orderBy(desc(listings.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(listings).where(where)
    : await db.select({ count: count() }).from(listings);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createListing(data: InsertListing) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(listings).values(data);
}

export async function updateListing(id: number, data: Partial<InsertListing>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(listings).set(data).where(eq(listings.id, id));
}

export async function deleteListing(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(listings).where(eq(listings.id, id));
}

// ==================== VIEWING REQUESTS ====================
export async function getViewingRequests(status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const where = status ? eq(viewingRequests.status, status as any) : undefined;
  const data = where
    ? await db.select().from(viewingRequests).where(where).orderBy(desc(viewingRequests.createdAt)).limit(limit).offset(offset)
    : await db.select().from(viewingRequests).orderBy(desc(viewingRequests.createdAt)).limit(limit).offset(offset);
  const [totalRow] = where
    ? await db.select({ count: count() }).from(viewingRequests).where(where)
    : await db.select({ count: count() }).from(viewingRequests);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createViewingRequest(data: InsertViewingRequest) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(viewingRequests).values(data);
}

export async function updateViewingRequest(id: number, data: Partial<InsertViewingRequest>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(viewingRequests).set(data).where(eq(viewingRequests.id, id));
}

// ==================== COMMUNICATION LOG ====================
export async function getCommunicationLog(page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const data = await db.select().from(communicationLog).orderBy(desc(communicationLog.createdAt)).limit(limit).offset(offset);
  const [totalRow] = await db.select({ count: count() }).from(communicationLog);
  return { data, total: totalRow?.count ?? 0 };
}

export async function createCommunicationLog(data: InsertCommunicationLog) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return await db.insert(communicationLog).values(data);
}

// ==================== OWNER DETAILS (linked data) ====================
export async function getOwnerDetails(ownerName: string) {
  const db = await getDb();
  if (!db) return { properties: [], contracts: [], payments: [] };
  const ownerProperties = await db.select().from(properties)
    .where(like(properties.ownerName, `%${ownerName}%`))
    .orderBy(properties.name).limit(50);
  const ownerContracts = await db.select().from(contracts)
    .where(like(contracts.landlordName, `%${ownerName}%`))
    .orderBy(desc(contracts.startDate)).limit(50);
  const contractNumbers = ownerContracts.map(c => c.contractNumber).filter(Boolean);
  let ownerPayments: any[] = [];
  if (contractNumbers.length > 0) {
    ownerPayments = await db.select().from(financialPayments)
      .where(inArray(financialPayments.contractNumber, contractNumbers as string[]))
      .orderBy(desc(financialPayments.invoiceDueDate)).limit(100);
  }
  return { properties: ownerProperties, contracts: ownerContracts, payments: ownerPayments };
}

// ==================== TENANT DETAILS (linked data) ====================
export async function getTenantDetails(tenantIdentity: string) {
  const db = await getDb();
  if (!db) return { contracts: [], payments: [], maintenance: [] };
  const tenantContracts = await db.select().from(contracts)
    .where(like(contracts.tenantIdentity, `%${tenantIdentity}%`))
    .orderBy(desc(contracts.startDate)).limit(20);
  const contractNumbers = tenantContracts.map(c => c.contractNumber).filter(Boolean);
  let tenantPayments: any[] = [];
  if (contractNumbers.length > 0) {
    tenantPayments = await db.select().from(financialPayments)
      .where(inArray(financialPayments.contractNumber, contractNumbers as string[]))
      .orderBy(desc(financialPayments.invoiceDueDate)).limit(50);
  }
  const tenantMaintenance = await db.select().from(maintenanceRequests)
    .where(like(maintenanceRequests.tenantName, `%${tenantIdentity}%`))
    .orderBy(desc(maintenanceRequests.requestDate)).limit(20);
  return { contracts: tenantContracts, payments: tenantPayments, maintenance: tenantMaintenance };
}

// ==================== MAINTENANCE STATS FOR TECHNICIANS ====================
export async function getMaintenanceStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
  const [total] = await db.select({ count: count() }).from(maintenanceRequests);
  const [pending] = await db.select({ count: count() }).from(maintenanceRequests)
    .where(eq(maintenanceRequests.status, 'جديد'));
  const [inProgress] = await db.select({ count: count() }).from(maintenanceRequests)
    .where(eq(maintenanceRequests.status, 'قيد_المعالجة'));
  const [completed] = await db.select({ count: count() }).from(maintenanceRequests)
    .where(eq(maintenanceRequests.status, 'مكتمل'));
  return {
    total: total?.count ?? 0,
    pending: pending?.count ?? 0,
    inProgress: inProgress?.count ?? 0,
    completed: completed?.count ?? 0,
  };
}

// ==================== DOCUMENT TEMPLATES ====================
export async function getDocumentTemplates(category?: string, type?: string) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const { documentTemplates } = await import('../drizzle/schema');
  const { eq, and, desc } = await import('drizzle-orm');
  const conditions: any[] = [];
  if (category) conditions.push(eq(documentTemplates.category, category as any));
  if (type) conditions.push(eq(documentTemplates.type, type as any));
  const data = await db.select().from(documentTemplates)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(documentTemplates.createdAt));
  return { data, total: data.length };
}

export async function createDocumentTemplate(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { documentTemplates } = await import('../drizzle/schema');
  const [result] = await db.insert(documentTemplates).values(input);
  return result;
}

export async function updateDocumentTemplate(id: number, input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { documentTemplates } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.update(documentTemplates).set(input).where(eq(documentTemplates.id, id));
}

export async function deleteDocumentTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { documentTemplates } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
}

// ==================== PROPERTY FORMS ====================
export async function getPropertyForms(formType?: string, status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const { propertyForms } = await import('../drizzle/schema');
  const { eq, and, desc, count } = await import('drizzle-orm');
  const conditions: any[] = [];
  if (formType) conditions.push(eq(propertyForms.formType, formType as any));
  if (status) conditions.push(eq(propertyForms.status, status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(propertyForms).where(where);
  const data = await db.select().from(propertyForms).where(where)
    .orderBy(desc(propertyForms.createdAt)).limit(limit).offset((page - 1) * limit);
  return { data, total };
}

export async function createPropertyForm(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { propertyForms } = await import('../drizzle/schema');
  const [result] = await db.insert(propertyForms).values(input);
  return result;
}

export async function updatePropertyForm(id: number, input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { propertyForms } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.update(propertyForms).set(input).where(eq(propertyForms.id, id));
}

// ==================== TASKS ====================
export async function getTasks(status?: string, priority?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const { tasks } = await import('../drizzle/schema');
  const { eq, and, desc, count } = await import('drizzle-orm');
  const conditions: any[] = [];
  if (status) conditions.push(eq(tasks.status, status as any));
  if (priority) conditions.push(eq(tasks.priority, priority as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(tasks).where(where);
  const data = await db.select().from(tasks).where(where)
    .orderBy(desc(tasks.createdAt)).limit(limit).offset((page - 1) * limit);
  return { data, total };
}

export async function createTask(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { tasks } = await import('../drizzle/schema');
  const [result] = await db.insert(tasks).values(input);
  return result;
}

export async function updateTask(id: number, input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { tasks } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.update(tasks).set(input).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { tasks } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ==================== APPOINTMENTS ====================
export async function getAppointments(status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const { appointments } = await import('../drizzle/schema');
  const { eq, desc, count } = await import('drizzle-orm');
  const where = status ? eq(appointments.status, status as any) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(appointments).where(where);
  const data = await db.select().from(appointments).where(where)
    .orderBy(desc(appointments.appointmentDate)).limit(limit).offset((page - 1) * limit);
  return { data, total };
}

export async function createAppointment(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { appointments } = await import('../drizzle/schema');
  const [result] = await db.insert(appointments).values(input);
  return result;
}

export async function updateAppointment(id: number, input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { appointments } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.update(appointments).set(input).where(eq(appointments.id, id));
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { appointments } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.delete(appointments).where(eq(appointments.id, id));
}

// ==================== EXPENSES ====================
export async function getExpenses(propertyId?: number, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const { expenses } = await import('../drizzle/schema');
  const { eq, desc, count, sum } = await import('drizzle-orm');
  const where = propertyId ? eq(expenses.propertyId, propertyId) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(expenses).where(where);
  const data = await db.select().from(expenses).where(where)
    .orderBy(desc(expenses.expenseDate)).limit(limit).offset((page - 1) * limit);
  return { data, total };
}

export async function createExpense(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { expenses } = await import('../drizzle/schema');
  const [result] = await db.insert(expenses).values(input);
  return result;
}

export async function updateExpense(id: number, input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { expenses } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.update(expenses).set(input).where(eq(expenses.id, id));
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { expenses } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.delete(expenses).where(eq(expenses.id, id));
}

export async function getExpenseCategories() {
  const db = await getDb();
  if (!db) return [];
  const { expenseCategories } = await import('../drizzle/schema');
  return db.select().from(expenseCategories);
}

// ==================== INVOICES ====================
export async function getInvoices(status?: string, page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const { invoices } = await import('../drizzle/schema');
  const { eq, desc, count } = await import('drizzle-orm');
  const where = status ? eq(invoices.status, status as any) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(invoices).where(where);
  const data = await db.select().from(invoices).where(where)
    .orderBy(desc(invoices.issueDate)).limit(limit).offset((page - 1) * limit);
  return { data, total };
}

export async function createInvoice(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { invoices } = await import('../drizzle/schema');
  const [result] = await db.insert(invoices).values(input);
  return result;
}

export async function updateInvoice(id: number, input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { invoices } = await import('../drizzle/schema');
  const { eq } = await import('drizzle-orm');
  await db.update(invoices).set(input).where(eq(invoices.id, id));
}

// ==================== SYSTEM SETTINGS ====================
export async function getSystemSettings() {
  const db = await getDb();
  if (!db) return [];
  const { systemSettings } = await import('../drizzle/schema');
  return db.select().from(systemSettings);
}

export async function upsertSystemSetting(key: string, value: string, label?: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { systemSettings } = await import('../drizzle/schema');
  await db.insert(systemSettings).values({ key, value, label, category }).onDuplicateKeyUpdate({ set: { value } });
}

// ==================== PROPERTY DOCUMENTS ====================
export async function getPropertyDocuments(propertyId?: number, contractId?: number) {
  const db = await getDb();
  if (!db) return [];
  const { propertyDocuments } = await import('../drizzle/schema');
  const { eq, and, desc } = await import('drizzle-orm');
  const conditions: any[] = [];
  if (propertyId) conditions.push(eq(propertyDocuments.propertyId, propertyId));
  if (contractId) conditions.push(eq(propertyDocuments.contractId, contractId));
  return db.select().from(propertyDocuments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(propertyDocuments.createdAt));
}

export async function createPropertyDocument(input: any) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const { propertyDocuments } = await import('../drizzle/schema');
  const [result] = await db.insert(propertyDocuments).values(input);
  return result;
}
