import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1779718741918 implements MigrationInterface {
    name = ' $npmConfigName1779718741918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stages" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "name" character varying(100) NOT NULL, "order_position" integer NOT NULL, "probability_percent" integer NOT NULL DEFAULT '0', "sla_max_hours" integer NOT NULL DEFAULT '48', CONSTRAINT "PK_16efa0f8f5386328944769b9e6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "plan" character varying NOT NULL DEFAULT 'starter', "is_blocked" boolean NOT NULL DEFAULT false, "created_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaigns" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "name" character varying(255) NOT NULL, "budget" numeric(15,2), "status" character varying(50) NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "campaign_id" integer, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "source" character varying(100) NOT NULL, "is_inactive" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "opportunities" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "lead_id" integer NOT NULL, "stage_id" integer NOT NULL, "assigned_user_id" integer, "value" numeric(15,2), "status" character varying(20) NOT NULL DEFAULT 'Open', "lost_reason" character varying(255), "expected_close_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4bd9cd12ddc0ff48a5a97ddebce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "opportunity_id" integer NOT NULL, "weakness_type" character varying(50) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stage_transition_logs" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "opportunity_id" integer NOT NULL, "from_stage_id" integer, "to_stage_id" integer NOT NULL, "transitioned_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_70aa86fbe0f0998189cf6035a2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "profile" character varying NOT NULL DEFAULT 'sales_rep', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lead_status_history" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "lead_id" integer NOT NULL, "old_status" character varying(50), "new_status" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_77ab85c988b965db46f0f52ffe2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "lead_id" integer`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "stage_id" integer`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_cdae2f7bc00b25eb3f22d4082b5" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opportunities" ADD CONSTRAINT "FK_7db3650fcf0fedc967a882f565e" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opportunities" ADD CONSTRAINT "FK_6b809748751441914b5a7068cc5" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_861970fca01f7d3058751d68a4f" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stage_transition_logs" ADD CONSTRAINT "FK_9254db26ef328b66f888a56e9f4" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stage_transition_logs" ADD CONSTRAINT "FK_309a5206fed2554d79ce86914fc" FOREIGN KEY ("from_stage_id") REFERENCES "stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stage_transition_logs" ADD CONSTRAINT "FK_7dac2005a11e5cb5dc4ba70318e" FOREIGN KEY ("to_stage_id") REFERENCES "stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead_status_history" ADD CONSTRAINT "FK_253b0b0889712cc6780068b6a3e" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lead_status_history" ADD CONSTRAINT "FK_c4522d183d638dcfcdd68868eea" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lead_status_history" DROP CONSTRAINT "FK_c4522d183d638dcfcdd68868eea"`);
        await queryRunner.query(`ALTER TABLE "lead_status_history" DROP CONSTRAINT "FK_253b0b0889712cc6780068b6a3e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`);
        await queryRunner.query(`ALTER TABLE "stage_transition_logs" DROP CONSTRAINT "FK_7dac2005a11e5cb5dc4ba70318e"`);
        await queryRunner.query(`ALTER TABLE "stage_transition_logs" DROP CONSTRAINT "FK_309a5206fed2554d79ce86914fc"`);
        await queryRunner.query(`ALTER TABLE "stage_transition_logs" DROP CONSTRAINT "FK_9254db26ef328b66f888a56e9f4"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_861970fca01f7d3058751d68a4f"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7"`);
        await queryRunner.query(`ALTER TABLE "opportunities" DROP CONSTRAINT "FK_6b809748751441914b5a7068cc5"`);
        await queryRunner.query(`ALTER TABLE "opportunities" DROP CONSTRAINT "FK_7db3650fcf0fedc967a882f565e"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_cdae2f7bc00b25eb3f22d4082b5"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "stage_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "lead_id"`);
        await queryRunner.query(`DROP TABLE "lead_status_history"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "stage_transition_logs"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "opportunities"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TABLE "campaigns"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TABLE "stages"`);
    }

}
