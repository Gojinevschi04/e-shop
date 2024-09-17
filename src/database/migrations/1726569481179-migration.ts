import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726569481179 implements MigrationInterface {
    name = 'Migration1726569481179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "payment_status" character varying NOT NULL DEFAULT 'Created'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "payment_status"
        `);
    }

}
