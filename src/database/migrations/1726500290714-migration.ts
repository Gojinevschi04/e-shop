import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726500290714 implements MigrationInterface {
    name = 'Migration1726500290714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "customerId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "customerId" character varying NOT NULL
        `);
    }

}
