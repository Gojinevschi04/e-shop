import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726238761241 implements MigrationInterface {
    name = 'Migration1726238761241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "totalPrice" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ALTER COLUMN "totalPrice"
            SET NOT NULL
        `);
    }

}
