import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateLeadsTable1775698441434 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
