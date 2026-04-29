import { getBase44Client } from "./base44Client";

export const BASE44_ENTITY_NAMES = [
  "Property",
  "Unit",
  "Tenant",
  "Lease",
  "Payment",
  "Maintenance",
  "Notification",
  "Report",
  "AuditLog",
  "Role",
  "SyncState",
  "Invoice",
  "MaintenanceReport",
  "ElectricityMeter",
  "Appointment",
  "BrokerageContract",
  "AdLicense",
  "SupportTicket",
  "Expense",
  "SignatureRequest",
  "Document",
  "Message",
  "Contract",
  "FinancialTransaction",
  "Technician",
  "Inventory",
  "Complaint",
  "TenantRating",
  "TenantFeedback",
  "SalesInvoice",
  "ServiceQuote",
  "ReceiptVoucher",
  "User",
] as const;

export type Base44EntityName = (typeof BASE44_ENTITY_NAMES)[number];

type Base44EntityApi = {
  list: (options?: Record<string, unknown>) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  get: (id: string) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
  restore: (id: string) => Promise<unknown>;
  bulkCreate?: (items: Record<string, unknown>[]) => Promise<unknown>;
  deleteMany?: (query: Record<string, unknown>) => Promise<unknown>;
};

function getEntityApi(entity: Base44EntityName): Base44EntityApi {
  const client = getBase44Client();
  const entities = (client as { entities?: Record<string, unknown> }).entities;
  if (!entities || !entities[entity]) {
    throw new Error(`Base44 entity is not available: ${entity}`);
  }

  return entities[entity] as Base44EntityApi;
}

export type Base44ListParams = {
  q?: Record<string, unknown>;
  limit?: number;
  skip?: number;
  sort_by?: string;
};

export async function listBase44(entity: Base44EntityName, params: Base44ListParams = {}) {
  const api = getEntityApi(entity);
  const hasOptions =
    typeof params.limit === "number" ||
    typeof params.skip === "number" ||
    typeof params.sort_by === "string" ||
    typeof params.q === "object";

  if (!hasOptions) {
    return api.list();
  }

  return api.list({
    q: params.q,
    limit: params.limit,
    skip: params.skip,
    sort_by: params.sort_by,
  });
}

export async function createBase44(entity: Base44EntityName, data: Record<string, unknown>) {
  return getEntityApi(entity).create(data);
}

export async function bulkCreateBase44(entity: Base44EntityName, items: Record<string, unknown>[]) {
  const api = getEntityApi(entity);
  if (!api.bulkCreate) {
    throw new Error(`bulkCreate is not supported for entity: ${entity}`);
  }
  return api.bulkCreate(items);
}

export async function getBase44ById(entity: Base44EntityName, id: string) {
  return getEntityApi(entity).get(id);
}

export async function updateBase44ById(
  entity: Base44EntityName,
  id: string,
  data: Record<string, unknown>
) {
  return getEntityApi(entity).update(id, data);
}

export async function deleteBase44ById(entity: Base44EntityName, id: string) {
  return getEntityApi(entity).delete(id);
}

export async function restoreBase44ById(entity: Base44EntityName, id: string) {
  return getEntityApi(entity).restore(id);
}

export async function deleteManyBase44(entity: Base44EntityName, query: Record<string, unknown>) {
  const api = getEntityApi(entity);
  if (!api.deleteMany) {
    throw new Error(`deleteMany is not supported for entity: ${entity}`);
  }
  return api.deleteMany(query);
}
