import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1726143834996 implements MigrationInterface {
  name = 'Migration1726143834996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product"
            DROP CONSTRAINT "FK_b1b332c0f436897f21a960f26c7"
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            ADD CONSTRAINT "FK_b1b332c0f436897f21a960f26c7" FOREIGN KEY ("imageId") REFERENCES "file" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product"
            DROP CONSTRAINT "FK_b1b332c0f436897f21a960f26c7"
    `);
    await queryRunner.query(`
        ALTER TABLE "product"
            ADD CONSTRAINT "FK_b1b332c0f436897f21a960f26c7" FOREIGN KEY ("imageId") REFERENCES "file" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
