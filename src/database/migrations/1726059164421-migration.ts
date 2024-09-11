import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1726059164421 implements MigrationInterface {
  name = 'Migration1726059164421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "file"
        (
            "id"        SERIAL            NOT NULL,
            "name"      character varying NOT NULL,
            "path"      character varying NOT NULL,
            "mimetype"  character varying NOT NULL,
            "createdAt" TIMESTAMP         NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
            "updatedAt" TIMESTAMP         NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
            CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
        )
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            ADD "imageId" integer
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            ADD CONSTRAINT "UQ_b1b332c0f436897f21a960f26c7" UNIQUE ("imageId")
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            ADD CONSTRAINT "FK_b1b332c0f436897f21a960f26c7" FOREIGN KEY ("imageId") REFERENCES "file" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product"
            DROP CONSTRAINT "FK_b1b332c0f436897f21a960f26c7"
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            DROP CONSTRAINT "UQ_b1b332c0f436897f21a960f26c7"
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            DROP COLUMN "imageId"
    `);
    await queryRunner.query(`
        DROP TABLE "file"
    `);
  }
}
