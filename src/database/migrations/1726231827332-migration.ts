import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726231827332 implements MigrationInterface {
    name = 'Migration1726231827332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ADD "productId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item"
            ADD CONSTRAINT "FK_75db0de134fe0f9fe9e4591b7bf" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item" DROP CONSTRAINT "FK_75db0de134fe0f9fe9e4591b7bf"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item" DROP COLUMN "productId"
        `);
    }

}
