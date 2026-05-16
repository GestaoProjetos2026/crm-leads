import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1775698457855 implements MigrationInterface {
    name = 'Migrations1775698457855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "plan" character varying NOT NULL DEFAULT 'starter', "created_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "opportunities" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "lead_id" integer NOT NULL, "stage_id" integer NOT NULL, "assigned_user_id" integer, "value" numeric(15,2), "status" character varying(20) NOT NULL DEFAULT 'Open', "lost_reason" character varying(255), "expected_close_date" date, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_4bd9cd12ddc0ff48a5a97ddebce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "campaign_id" integer, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "source" character varying(100) NOT NULL, "is_inactive" boolean NOT NULL DEFAULT false, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "opportunity_id" integer NOT NULL, "weakness_type" character varying(50) NOT NULL, "description" text, "created_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TABLE "opportunities"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
    }

}
