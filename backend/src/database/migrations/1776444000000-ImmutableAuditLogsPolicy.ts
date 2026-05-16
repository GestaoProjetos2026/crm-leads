import { MigrationInterface, QueryRunner } from "typeorm";

export class ImmutableAuditLogsPolicy1776444000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Política restritiva que bloqueia permanentemente qualquer UPDATE
        await queryRunner.query(`
            CREATE POLICY prevent_update_audit_logs ON "audit_logs"
            AS RESTRICTIVE FOR UPDATE
            USING (false);
        `);

        // Política restritiva que bloqueia permanentemente qualquer DELETE
        await queryRunner.query(`
            CREATE POLICY prevent_delete_audit_logs ON "audit_logs"
            AS RESTRICTIVE FOR DELETE
            USING (false);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP POLICY prevent_update_audit_logs ON "audit_logs";`);
        await queryRunner.query(`DROP POLICY prevent_delete_audit_logs ON "audit_logs";`);
    }
}