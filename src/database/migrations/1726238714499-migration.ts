import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726238714499 implements MigrationInterface {
    name = 'Migration1726238714499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "quantity" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "quantity"
            SET NOT NULL
        `);
    }

}
