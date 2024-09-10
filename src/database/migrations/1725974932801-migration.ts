import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1725974932801 implements MigrationInterface {
  name = 'Migration1725974932801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "category"
            DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"
    `);
    await queryRunner.query(`
        ALTER TABLE "category"
            DROP CONSTRAINT "UQ_d5456fd7e4c4866fec8ada1fa10"
    `);
    await queryRunner.query(`
        ALTER TABLE "category"
            DROP COLUMN "parentId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "category"
            ADD "parentId" integer
    `);
    await queryRunner.query(`
        ALTER TABLE "category"
            ADD CONSTRAINT "UQ_d5456fd7e4c4866fec8ada1fa10" UNIQUE ("parentId")
    `);
    await queryRunner.query(`
        ALTER TABLE "category"
            ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }
}
