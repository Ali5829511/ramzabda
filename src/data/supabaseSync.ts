/**
 * supabaseSync.ts
 * ---------------
 * Thin sync layer between the Zustand store and Supabase.
 *
 * Strategy:
 *   • On app startup  → load all rows from Supabase and hydrate the store.
 *   • On each mutation → fire-and-forget upsert / delete to Supabase.
 *   • When Supabase env vars are absent → silently skip (localStorage only).
 */

import { supabase } from './supabase';

// ─── table name mapping ───────────────────────────────────────
export type DbTable =
  | 'users'
  | 'properties'
  | 'units'
  | 'contracts'
  | 'invoices'
  | 'installments'
  | 'payments'
  | 'maintenance_requests'
  | 'customers'
  | 'interactions'
  | 'appointments'
  | 'marketing_listings'
  | 'marketing_campaigns'
  | 'templates'
  | 'notifications'
  | 'expenses'
  | 'support_tickets'
  | 'brokerage_contracts'
  | 'ad_licenses';

const ALL_TABLES: DbTable[] = [
  'users', 'properties', 'units', 'contracts', 'invoices',
  'installments', 'payments', 'maintenance_requests', 'customers',
  'interactions', 'appointments', 'marketing_listings', 'marketing_campaigns',
  'templates', 'notifications', 'expenses', 'support_tickets',
  'brokerage_contracts', 'ad_licenses',
];

// ─── helpers ──────────────────────────────────────────────────
const isConfigured = (): boolean =>
  !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// ─── load all data from Supabase ──────────────────────────────
export interface SupabaseSnapshot {
  users: any[];
  properties: any[];
  units: any[];
  contracts: any[];
  invoices: any[];
  installments: any[];
  payments: any[];
  maintenanceRequests: any[];
  customers: any[];
  interactions: any[];
  appointments: any[];
  marketingListings: any[];
  marketingCampaigns: any[];
  templates: any[];
  notifications: any[];
  expenses: any[];
  supportTickets: any[];
  brokerageContracts: any[];
  adLicenses: any[];
}

/**
 * Fetch all records from every table.
 * Returns null when Supabase is not configured or any fetch fails.
 */
export async function loadAllFromSupabase(): Promise<SupabaseSnapshot | null> {
  if (!isConfigured()) return null;

  try {
    const results = await Promise.all(
      ALL_TABLES.map(table =>
        supabase.from(table).select('data').then(({ data, error }) => {
          if (error) throw new Error(`[supabaseSync] ${table}: ${error.message}`);
          return { table, rows: (data ?? []).map((r: { data: unknown }) => r.data) };
        })
      )
    );

    const snapshot: Record<string, any[]> = {};
    results.forEach(({ table, rows }) => { snapshot[table] = rows; });

    return {
      users:               snapshot['users'],
      properties:          snapshot['properties'],
      units:               snapshot['units'],
      contracts:           snapshot['contracts'],
      invoices:            snapshot['invoices'],
      installments:        snapshot['installments'],
      payments:            snapshot['payments'],
      maintenanceRequests: snapshot['maintenance_requests'],
      customers:           snapshot['customers'],
      interactions:        snapshot['interactions'],
      appointments:        snapshot['appointments'],
      marketingListings:   snapshot['marketing_listings'],
      marketingCampaigns:  snapshot['marketing_campaigns'],
      templates:           snapshot['templates'],
      notifications:       snapshot['notifications'],
      expenses:            snapshot['expenses'],
      supportTickets:      snapshot['support_tickets'],
      brokerageContracts:  snapshot['brokerage_contracts'],
      adLicenses:          snapshot['ad_licenses'],
    };
  } catch (err) {
    console.error('[supabaseSync] loadAll failed:', err);
    return null;
  }
}

// ─── fire-and-forget helpers ──────────────────────────────────

/** Upsert a single record. Call after every add / update mutation. */
export function syncUpsert(table: DbTable, record: { id: string }): void {
  if (!isConfigured()) return;
  supabase
    .from(table)
    .upsert({ id: record.id, data: record }, { onConflict: 'id' })
    .then(({ error }) => {
      if (error) console.error(`[supabaseSync] upsert ${table}:`, error.message);
    });
}

/** Delete a single record. Call after every delete mutation. */
export function syncDelete(table: DbTable, id: string): void {
  if (!isConfigured()) return;
  supabase
    .from(table)
    .delete()
    .eq('id', id)
    .then(({ error }) => {
      if (error) console.error(`[supabaseSync] delete ${table}:`, error.message);
    });
}

/**
 * Bulk-upsert an entire collection (used during seeding / reset).
 * Splits into batches to avoid request-size limits.
 */
export async function syncBulkUpsert(
  table: DbTable,
  records: Array<{ id: string }>
): Promise<void> {
  if (!isConfigured() || records.length === 0) return;
  const BATCH = 200;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH).map(r => ({ id: r.id, data: r }));
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`[supabaseSync] bulk upsert ${table} (batch ${i}):`, error.message);
    }
  }
}
