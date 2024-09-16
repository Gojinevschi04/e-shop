import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726497005896 implements MigrationInterface {
    name = 'Migration1726497005896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "customerId" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "customerId"
        `);
    }

}
