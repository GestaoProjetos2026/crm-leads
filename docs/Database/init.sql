-- =============================================================================
-- SalesWeakness — Full Database Schema (Sprint 4)
-- =============================================================================
-- This file is mounted by docker-compose as an init script.
-- It creates the complete schema for development environments.
-- =============================================================================

-- ── Tenants (SaaS customers) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" SERIAL NOT NULL,
  "name" character varying(255) NOT NULL,
  "plan" character varying NOT NULL DEFAULT 'starter',
  "is_blocked" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
);

-- ── Users (authenticated users, belong to a tenant) ──────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "email" character varying(255) NOT NULL,
  "password_hash" character varying(255) NOT NULL,
  "profile" character varying NOT NULL DEFAULT 'sales_rep',
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_users" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_email" UNIQUE ("email"),
  CONSTRAINT "FK_users_tenant" FOREIGN KEY ("tenant_id")
    REFERENCES "tenants"("id") ON DELETE CASCADE
);

-- ── Campaigns (marketing campaigns) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "name" character varying(255) NOT NULL,
  "budget" numeric(15,2),
  "status" character varying(50) NOT NULL DEFAULT 'active',
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_campaigns" PRIMARY KEY ("id")
);

-- ── Leads (prospects entering the CRM pipeline) ─────────────────────────────
CREATE TABLE IF NOT EXISTS "leads" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "campaign_id" integer,
  "first_name" character varying(255) NOT NULL,
  "last_name" character varying(255) NOT NULL,
  "email" character varying(255) NOT NULL,
  "source" character varying(100) NOT NULL,
  "is_inactive" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_leads" PRIMARY KEY ("id"),
  CONSTRAINT "FK_leads_campaign" FOREIGN KEY ("campaign_id")
    REFERENCES "campaigns"("id") ON DELETE SET NULL
);

-- ── Contacts (1:1 with leads) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "lead_id" integer UNIQUE,
  "phone" character varying,
  "linkedin_url" character varying,
  CONSTRAINT "PK_contacts" PRIMARY KEY ("id"),
  CONSTRAINT "FK_contacts_lead" FOREIGN KEY ("lead_id")
    REFERENCES "leads"("id") ON DELETE CASCADE
);

-- ── Stages (pipeline steps with SLA thresholds) ─────────────────────────────
CREATE TABLE IF NOT EXISTS "stages" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "name" character varying(100) NOT NULL,
  "order_position" integer NOT NULL,
  "probability_percent" integer NOT NULL DEFAULT 0,
  "sla_max_hours" integer NOT NULL DEFAULT 48,
  CONSTRAINT "PK_stages" PRIMARY KEY ("id")
);

-- ── Opportunities (sales opportunities in the pipeline) ──────────────────────
CREATE TABLE IF NOT EXISTS "opportunities" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "lead_id" integer NOT NULL,
  "stage_id" integer NOT NULL,
  "assigned_user_id" integer,
  "value" numeric(15,2),
  "status" character varying(20) NOT NULL DEFAULT 'Open',
  "lost_reason" character varying(255),
  "expected_close_date" date,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_opportunities" PRIMARY KEY ("id"),
  CONSTRAINT "FK_opportunities_lead" FOREIGN KEY ("lead_id")
    REFERENCES "leads"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_opportunities_stage" FOREIGN KEY ("stage_id")
    REFERENCES "stages"("id")
);

-- ── Audit Logs (append-only weakness detection records) ──────────────────────
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" SERIAL NOT NULL,
  "tenant_id" integer NOT NULL,
  "opportunity_id" integer NOT NULL,
  "lead_id" integer,
  "stage_id" integer,
  "weakness_type" character varying(50) NOT NULL,
  "description" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"),
  CONSTRAINT "FK_audit_logs_opportunity" FOREIGN KEY ("opportunity_id")
    REFERENCES "opportunities"("id")
);

-- ── Performance Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "IDX_opportunities_tenant_status" ON "opportunities" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "IDX_opportunities_updated_at" ON "opportunities" ("updated_at");
CREATE INDEX IF NOT EXISTS "IDX_leads_tenant_email" ON "leads" ("tenant_id", "email");
CREATE INDEX IF NOT EXISTS "IDX_audit_logs_tenant_type" ON "audit_logs" ("tenant_id", "weakness_type");
CREATE INDEX IF NOT EXISTS "IDX_audit_logs_idempotency" ON "audit_logs" ("opportunity_id", "stage_id", "weakness_type");
CREATE INDEX IF NOT EXISTS "IDX_stages_tenant_order" ON "stages" ("tenant_id", "order_position");

-- ── Row Level Security (RLS) ─────────────────────────────────────────────────
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_tenant_isolation" ON "tenants"
  USING ("id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "users_tenant_isolation" ON "users"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "campaigns_tenant_isolation" ON "campaigns"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "leads_tenant_isolation" ON "leads"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "contacts_tenant_isolation" ON "contacts"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "stages_tenant_isolation" ON "stages"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "opportunities_tenant_isolation" ON "opportunities"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

CREATE POLICY "audit_logs_tenant_isolation" ON "audit_logs"
  USING ("tenant_id" = current_setting('app.tenant_id', true)::int);

-- ── Seed Data (Demo Tenant) ──────────────────────────────────────────────────
INSERT INTO "tenants" ("name", "plan") VALUES ('Demo Company', 'professional');

-- Default pipeline stages
INSERT INTO "stages" ("tenant_id", "name", "order_position", "probability_percent", "sla_max_hours")
VALUES
  (1, 'Prospecção',    1, 10, 24),
  (1, 'Qualificação',  2, 25, 48),
  (1, 'Negociação',    3, 50, 72),
  (1, 'Proposta',      4, 75, 48),
  (1, 'Fechamento',    5, 90, 24);

-- Demo campaign
INSERT INTO "campaigns" ("tenant_id", "name", "budget", "status")
VALUES (1, 'Black Friday 2026', 50000.00, 'active');

-- Demo user (password: admin123 — scrypt hash)
-- In production, use AuthService.hashPassword()
INSERT INTO "users" ("tenant_id", "email", "password_hash", "profile")
VALUES (1, 'diretor@demo.com', 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4:placeholder_hash_use_auth_service', 'director');

-- Demo leads
INSERT INTO "leads" ("tenant_id", "campaign_id", "first_name", "last_name", "email", "source")
VALUES
  (1, 1, 'Maria', 'Santos', 'maria@empresa.com', 'facebook_leads'),
  (1, 1, 'Pedro', 'Oliveira', 'pedro@empresa.com', 'landing_page'),
  (1, 1, 'Ana', 'Costa', 'ana@empresa.com', 'facebook_leads'),
  (1, NULL, 'Lucas', 'Souza', 'lucas@empresa.com', 'manual'),
  (1, 1, 'Juliana', 'Ferreira', 'juliana@empresa.com', 'landing_page');

-- Demo opportunities (some stagnant for testing)
INSERT INTO "opportunities" ("tenant_id", "lead_id", "stage_id", "value", "status", "updated_at")
VALUES
  (1, 1, 2, 15000.00, 'Open', NOW() - INTERVAL '72 hours'),  -- Stagnant in Qualificação (SLA: 48h)
  (1, 2, 3, 45000.00, 'Open', NOW() - INTERVAL '96 hours'),  -- Stagnant in Negociação (SLA: 72h)
  (1, 3, 1, 8000.00, 'Open', NOW() - INTERVAL '2 hours'),    -- OK in Prospecção
  (1, 4, 4, 120000.00, 'Open', NOW() - INTERVAL '60 hours'), -- Stagnant in Proposta (SLA: 48h)
  (1, 5, 5, 30310.00, 'Open', NOW() - INTERVAL '30 hours');  -- Stagnant in Fechamento (SLA: 24h)
