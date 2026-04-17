import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantPolicies1776443000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Política de isolamento para Leads
        await queryRunner.query(`
            CREATE POLICY tenant_isolation ON "leads"
            FOR ALL
            USING ("tenant_id" = current_setting('app.current_tenant_id', true)::INTEGER);
        `);

        // Política de isolamento para Opportunities
        await queryRunner.query(`
            CREATE POLICY tenant_isolation ON "opportunities"
            FOR ALL
            USING ("tenant_id" = current_setting('app.current_tenant_id', true)::INTEGER);
        `);

        // Política de isolamento para Audit Logs
        await queryRunner.query(`
            CREATE POLICY tenant_isolation ON "audit_logs"
            FOR ALL
            USING ("tenant_id" = current_setting('app.current_tenant_id', true)::INTEGER);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP POLICY tenant_isolation ON "leads";`);
        await queryRunner.query(`DROP POLICY tenant_isolation ON "opportunities";`);
        await queryRunner.query(`DROP POLICY tenant_isolation ON "audit_logs";`);
    }
}