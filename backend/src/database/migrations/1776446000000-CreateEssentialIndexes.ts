import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEssentialIndexes1776446000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Índices para agilizar buscas filtradas pelo inquilino (tenant_id)
        await queryRunner.query(`CREATE INDEX "IDX_leads_tenant_email" ON "leads" ("tenant_id", "email");`);
        await queryRunner.query(`CREATE INDEX "IDX_opps_tenant_status_date" ON "opportunities" ("tenant_id", "status", "updated_at");`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_tenant_opp" ON "audit_logs" ("tenant_id", "opportunity_id");`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_leads_tenant_email";`);
        await queryRunner.query(`DROP INDEX "IDX_opps_tenant_status_date";`);
        await queryRunner.query(`DROP INDEX "IDX_audit_tenant_opp";`);
    }
}