import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add Stages, Campaigns tables, extend AuditLogs with lead_id/stage_id,
 * convert date columns to timestamp for stagnation precision, add Users table,
 * and apply Row Level Security (RLS) on all tenant-scoped tables.
 */
export class AddStagesRlsSprint41775698500000
  implements MigrationInterface
{
  name = 'AddStagesRlsSprint41775698500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Create new tables ──────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "campaigns" (
        "id" SERIAL NOT NULL,
        "tenant_id" integer NOT NULL,
        "name" character varying(255) NOT NULL,
        "budget" numeric(15,2),
        "status" character varying(50) NOT NULL DEFAULT 'active',
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaigns" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stages" (
        "id" SERIAL NOT NULL,
        "tenant_id" integer NOT NULL,
        "name" character varying(100) NOT NULL,
        "order_position" integer NOT NULL,
        "probability_percent" integer NOT NULL DEFAULT 0,
        "sla_max_hours" integer NOT NULL DEFAULT 48,
        CONSTRAINT "PK_stages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL NOT NULL,
        "tenant_id" integer NOT NULL,
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "profile" character varying NOT NULL DEFAULT 'sales_rep',
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // ── 2. Add new columns to audit_logs ──────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ADD COLUMN IF NOT EXISTS "lead_id" integer,
        ADD COLUMN IF NOT EXISTS "stage_id" integer
    `);

    // ── 3. Convert date columns to timestamp for stagnation precision ─────

    await queryRunner.query(`
      ALTER TABLE "leads"
        ALTER COLUMN "created_at" TYPE timestamp USING "created_at"::timestamp,
        ALTER COLUMN "updated_at" TYPE timestamp USING "updated_at"::timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "opportunities"
        ALTER COLUMN "created_at" TYPE timestamp USING "created_at"::timestamp,
        ALTER COLUMN "updated_at" TYPE timestamp USING "updated_at"::timestamp
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ALTER COLUMN "created_at" TYPE timestamp USING "created_at"::timestamp
    `);

    // ── 4. Add foreign keys ───────────────────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "leads"
        ADD CONSTRAINT "FK_leads_campaign" FOREIGN KEY ("campaign_id")
        REFERENCES "campaigns"("id") ON DELETE SET NULL DEFERRABLE INITIALLY IMMEDIATE
    `);

    await queryRunner.query(`
      ALTER TABLE "opportunities"
        ADD CONSTRAINT "FK_opportunities_lead" FOREIGN KEY ("lead_id")
        REFERENCES "leads"("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE
    `);

    await queryRunner.query(`
      ALTER TABLE "opportunities"
        ADD CONSTRAINT "FK_opportunities_stage" FOREIGN KEY ("stage_id")
        REFERENCES "stages"("id") DEFERRABLE INITIALLY IMMEDIATE
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ADD CONSTRAINT "FK_audit_logs_opportunity" FOREIGN KEY ("opportunity_id")
        REFERENCES "opportunities"("id") DEFERRABLE INITIALLY IMMEDIATE
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "FK_users_tenant" FOREIGN KEY ("tenant_id")
        REFERENCES "tenants"("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE
    `);

    // ── 5. Indexes for performance ────────────────────────────────────────

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_opportunities_tenant_status" ON "opportunities" ("tenant_id", "status");
      CREATE INDEX IF NOT EXISTS "IDX_opportunities_updated_at" ON "opportunities" ("updated_at");
      CREATE INDEX IF NOT EXISTS "IDX_leads_tenant_email" ON "leads" ("tenant_id", "email");
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_tenant_type" ON "audit_logs" ("tenant_id", "weakness_type");
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_idempotency" ON "audit_logs" ("opportunity_id", "stage_id", "weakness_type");
      CREATE INDEX IF NOT EXISTS "IDX_stages_tenant_order" ON "stages" ("tenant_id", "order_position");
    `);

    // ── 6. Row Level Security (RLS) ───────────────────────────────────────

    const rlsTables = [
      'tenants',
      'leads',
      'campaigns',
      'stages',
      'opportunities',
      'audit_logs',
      'users',
    ];

    for (const table of rlsTables) {
      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);

      await queryRunner.query(`
        DROP POLICY IF EXISTS "${table}_tenant_isolation" ON "${table}"
      `);

      if (table === 'tenants') {
        // Tenants table: isolate by id
        await queryRunner.query(`
          CREATE POLICY "${table}_tenant_isolation" ON "${table}"
            USING ("id" = current_setting('app.tenant_id', true)::int)
        `);
      } else {
        // All other tables: isolate by tenant_id
        await queryRunner.query(`
          CREATE POLICY "${table}_tenant_isolation" ON "${table}"
            USING ("tenant_id" = current_setting('app.tenant_id', true)::int)
        `);
      }
    }

    // ── 7. Seed default stages for a demo tenant ──────────────────────────

    await queryRunner.query(`
      INSERT INTO "tenants" ("name", "plan") VALUES ('Demo Company', 'professional')
      ON CONFLICT DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "stages" ("tenant_id", "name", "order_position", "probability_percent", "sla_max_hours")
      VALUES
        (1, 'Prospecção',    1, 10, 24),
        (1, 'Qualificação',  2, 25, 48),
        (1, 'Negociação',    3, 50, 72),
        (1, 'Proposta',      4, 75, 48),
        (1, 'Fechamento',    5, 90, 24)
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    const rlsTables = [
      'users',
      'audit_logs',
      'opportunities',
      'stages',
      'campaigns',
      'leads',
      'tenants',
    ];

    for (const table of rlsTables) {
      await queryRunner.query(
        `DROP POLICY IF EXISTS "${table}_tenant_isolation" ON "${table}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`,
      );
    }

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_opportunity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunities" DROP CONSTRAINT IF EXISTS "FK_opportunities_stage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "opportunities" DROP CONSTRAINT IF EXISTS "FK_opportunities_lead"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "FK_leads_campaign"`,
    );

    // Remove columns
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "lead_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "stage_id"`,
    );

    // Drop new tables
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns"`);
  }
}
