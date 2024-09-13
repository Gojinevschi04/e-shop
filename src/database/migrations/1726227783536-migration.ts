import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726227783536 implements MigrationInterface {
    name = 'Migration1726227783536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cart_item_product_id_product" (
                "cartItemId" integer NOT NULL,
                "productId" integer NOT NULL,
                CONSTRAINT "PK_979f776db68099fdde20210f024" PRIMARY KEY ("cartItemId", "productId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d6fabdc1229a67553afadaa28a" ON "cart_item_product_id_product" ("cartItemId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3ee8223875d5bb2b9ebb96ed01" ON "cart_item_product_id_product" ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_id_product"
            ADD CONSTRAINT "FK_d6fabdc1229a67553afadaa28af" FOREIGN KEY ("cartItemId") REFERENCES "cart_item"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_id_product"
            ADD CONSTRAINT "FK_3ee8223875d5bb2b9ebb96ed018" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_id_product" DROP CONSTRAINT "FK_3ee8223875d5bb2b9ebb96ed018"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_item_product_id_product" DROP CONSTRAINT "FK_d6fabdc1229a67553afadaa28af"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3ee8223875d5bb2b9ebb96ed01"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d6fabdc1229a67553afadaa28a"
        `);
        await queryRunner.query(`
            DROP TABLE "cart_item_product_id_product"
        `);
    }

}
