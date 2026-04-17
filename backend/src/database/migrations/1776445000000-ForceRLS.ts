import { MigrationInterface, QueryRunner } from "typeorm";

export class ForceRLS1776445000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Obriga o PostgreSQL a aplicar o RLS até mesmo para o dono (owner) das tabelas
        await queryRunner.query(`ALTER TABLE "leads" FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "opportunities" FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" NO FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "opportunities" NO FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "audit_logs" NO FORCE ROW LEVEL SECURITY;`);
    }
}