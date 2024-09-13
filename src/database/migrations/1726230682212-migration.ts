import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726230682212 implements MigrationInterface {
    name = 'Migration1726230682212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cart_item_product_product" (
                "cartItemId" integer NOT NULL,
                "productId" integer NOT NULL,
                CONSTRAINT "PK_a680b43011fb95af5c9ae6e9cc9" PRIMARY KEY ("cartItemId", "productId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a46474f8ad392a2d435e6df88c" ON "cart_item_product_product" ("cartItemId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b4115ada87c883558d9f9e4b94" ON "cart_item_product_product" ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_product"
            ADD CONSTRAINT "FK_a46474f8ad392a2d435e6df88c0" FOREIGN KEY ("cartItemId") REFERENCES "cart_item"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_product"
            ADD CONSTRAINT "FK_b4115ada87c883558d9f9e4b945" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_product" DROP CONSTRAINT "FK_b4115ada87c883558d9f9e4b945"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_product" DROP CONSTRAINT "FK_a46474f8ad392a2d435e6df88c0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b4115ada87c883558d9f9e4b94"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a46474f8ad392a2d435e6df88c"
        `);
        await queryRunner.query(`
            DROP TABLE "cart_item_product_product"
        `);
    }

}
