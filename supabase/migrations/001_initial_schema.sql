-- =========================================================
-- Ramz Al-Ibda Property Management Platform
-- Initial Supabase Schema Migration
-- =========================================================

-- Enable UUID extension (used by Supabase internally)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- Users  (المستخدمون)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Properties  (العقارات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Units  (الوحدات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Contracts  (العقود)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Invoices  (الفواتير)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Installments  (الأقساط)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS installments (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Payments  (المدفوعات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Maintenance Requests  (طلبات الصيانة)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Customers / CRM  (العملاء)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Interactions  (التفاعلات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interactions (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Appointments  (المواعيد)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Marketing Listings  (إعلانات التسويق)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketing_listings (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Marketing Campaigns  (الحملات التسويقية)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Templates  (القوالب)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Notifications  (الإشعارات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Expenses  (المصروفات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Support Tickets  (تذاكر الدعم)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Brokerage Contracts  (عقود الوساطة)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brokerage_contracts (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Ad Licenses  (تراخيص الإعلانات)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_licenses (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Archive Documents  (أرشيف الوثائق)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS archive_documents (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Auto-update updated_at trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','properties','units','contracts','invoices',
    'installments','payments','maintenance_requests','customers',
    'interactions','appointments','marketing_listings','marketing_campaigns',
    'templates','notifications','expenses','support_tickets',
    'brokerage_contracts','ad_licenses','archive_documents'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_update_%I ON %I;
       CREATE TRIGGER trg_update_%I
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END
$$;

-- ─────────────────────────────────────────────
-- Row Level Security (RLS)
-- Disabled by default – enable and configure policies
-- once Supabase Auth is integrated.
-- ─────────────────────────────────────────────
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ... (repeat for every table above when auth is configured)
