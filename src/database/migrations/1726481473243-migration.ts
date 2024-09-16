import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726481473243 implements MigrationInterface {
    name = 'Migration1726481473243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "order_products_product" (
                "orderId" integer NOT NULL,
                "productId" integer NOT NULL,
                CONSTRAINT "PK_59f5d41216418eba313ed3c7d7c" PRIMARY KEY ("orderId", "productId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_1f9ea0b0e59e0d98ade4f2d5e9" ON "order_products_product" ("orderId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d6c66c08b9c7e84a1b657797df" ON "order_products_product" ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products_product"
            ADD CONSTRAINT "FK_1f9ea0b0e59e0d98ade4f2d5e99" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products_product"
            ADD CONSTRAINT "FK_d6c66c08b9c7e84a1b657797dff" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order_products_product" DROP CONSTRAINT "FK_d6c66c08b9c7e84a1b657797dff"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products_product" DROP CONSTRAINT "FK_1f9ea0b0e59e0d98ade4f2d5e99"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d6c66c08b9c7e84a1b657797df"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1f9ea0b0e59e0d98ade4f2d5e9"
        `);
        await queryRunner.query(`
            DROP TABLE "order_products_product"
        `);
    }

}
