import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726049303574 implements MigrationInterface {
    name = 'Migration1726049303574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product"
            (
                "id"          SERIAL            NOT NULL,
                "name"        character varying NOT NULL,
                "description" character varying NOT NULL,
                "price"       integer           NOT NULL,
                "brand"       character varying NOT NULL,
                "color"       character varying NOT NULL,
                "material"    character varying NOT NULL,
                "isAvailable" boolean           NOT NULL DEFAULT true,
                "createdAt"   TIMESTAMP         NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt"   TIMESTAMP         NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "categoryId"  integer,
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"
        `);
        await queryRunner.query(`
            DROP TABLE "product"
        `);
    }

}
