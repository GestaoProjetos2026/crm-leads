import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableRLS1776442000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ativando o isolamento nas tabelas principais do CRM
        await queryRunner.query(`ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "opportunities" ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;`);
        
        // Ativando caso a tabela stages também já tenha sido gerada no banco
        // await queryRunner.query(`ALTER TABLE "stages" ENABLE ROW LEVEL SECURITY;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Caso precisemos reverter a migração
        await queryRunner.query(`ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "opportunities" DISABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;`);
    }
}