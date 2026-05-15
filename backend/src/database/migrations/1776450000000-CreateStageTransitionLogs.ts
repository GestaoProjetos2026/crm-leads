import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create stage_transition_logs table for tracking pipeline
 * stage movements. Enables accurate conversion-latency calculation
 * using real transition timestamps instead of opportunity updated_at.
 */
export class CreateStageTransitionLogs1776450000000
  implements MigrationInterface
{
  name = 'CreateStageTransitionLogs1776450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Create table ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stage_transition_logs" (
        "id" SERIAL NOT NULL,
        "tenant_id" integer NOT NULL,
        "opportunity_id" integer NOT NULL,
        "from_stage_id" integer,
        "to_stage_id" integer NOT NULL,
        "transitioned_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stage_transition_logs" PRIMARY KEY ("id")
      )
    `);

    // ── 2. Foreign keys ──────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "stage_transition_logs"
        ADD CONSTRAINT "FK_stl_opportunity" FOREIGN KEY ("opportunity_id")
        REFERENCES "opportunities"("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE
    `);

    await queryRunner.query(`
      ALTER TABLE "stage_transition_logs"
        ADD CONSTRAINT "FK_stl_from_stage" FOREIGN KEY ("from_stage_id")
        REFERENCES "stages"("id") DEFERRABLE INITIALLY IMMEDIATE
    `);

    await queryRunner.query(`
      ALTER TABLE "stage_transition_logs"
        ADD CONSTRAINT "FK_stl_to_stage" FOREIGN KEY ("to_stage_id")
        REFERENCES "stages"("id") DEFERRABLE INITIALLY IMMEDIATE
    `);

    // ── 3. Indexes for query performance ─────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_stl_tenant_opportunity"
        ON "stage_transition_logs" ("tenant_id", "opportunity_id");

      CREATE INDEX IF NOT EXISTS "IDX_stl_to_stage_time"
        ON "stage_transition_logs" ("to_stage_id", "transitioned_at");
    `);

    // ── 4. Row Level Security ────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "stage_transition_logs" ENABLE ROW LEVEL SECURITY
    `);

    await queryRunner.query(`
      CREATE POLICY "stage_transition_logs_tenant_isolation"
        ON "stage_transition_logs"
        USING ("tenant_id" = current_setting('app.tenant_id', true)::int)
    `);

    // ── 5. Backfill: create initial transition logs for existing opportunities
    await queryRunner.query(`
      INSERT INTO "stage_transition_logs" ("tenant_id", "opportunity_id", "from_stage_id", "to_stage_id", "transitioned_at")
      SELECT o.tenant_id, o.id, NULL, o.stage_id, o.created_at
      FROM "opportunities" o
      WHERE NOT EXISTS (
        SELECT 1 FROM "stage_transition_logs" stl WHERE stl.opportunity_id = o.id
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP POLICY IF EXISTS "stage_transition_logs_tenant_isolation" ON "stage_transition_logs"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stage_transition_logs" DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "stage_transition_logs"`);
  }
}
