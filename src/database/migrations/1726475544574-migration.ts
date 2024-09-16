import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726475544574 implements MigrationInterface {
    name = 'Migration1726475544574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "quantity"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "totalPrice"
            SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "totalPrice" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "quantity" DROP NOT NULL
        `);
    }

}
