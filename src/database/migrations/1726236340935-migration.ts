import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726236340935 implements MigrationInterface {
    name = 'Migration1726236340935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "order" (
                "id" SERIAL NOT NULL,
                "status" character varying NOT NULL,
                "address" character varying NOT NULL,
                "totalSum" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "userId" integer,
                CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "order_products_cart_item" (
                "orderId" integer NOT NULL,
                "cartItemId" integer NOT NULL,
                CONSTRAINT "PK_302df1169d0c19f044e42b86f35" PRIMARY KEY ("orderId", "cartItemId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_89f6933c6e43ed6204b9ad9ca7" ON "order_products_cart_item" ("orderId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6230257b47e0ca38258a28110c" ON "order_products_cart_item" ("cartItemId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products_cart_item"
            ADD CONSTRAINT "FK_89f6933c6e43ed6204b9ad9ca78" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products_cart_item"
            ADD CONSTRAINT "FK_6230257b47e0ca38258a28110c4" FOREIGN KEY ("cartItemId") REFERENCES "cart_item"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order_products_cart_item" DROP CONSTRAINT "FK_6230257b47e0ca38258a28110c4"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products_cart_item" DROP CONSTRAINT "FK_89f6933c6e43ed6204b9ad9ca78"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6230257b47e0ca38258a28110c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_89f6933c6e43ed6204b9ad9ca7"
        `);
        await queryRunner.query(`
            DROP TABLE "order_products_cart_item"
        `);
        await queryRunner.query(`
            DROP TABLE "order"
        `);
    }

}
