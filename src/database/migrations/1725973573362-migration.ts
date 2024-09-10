import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1725973573362 implements MigrationInterface {
  name = 'Migration1725973573362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "category"
            DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"
    `);
    await queryRunner.query(`
        ALTER TABLE "category"
            ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "category"
            DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"
    `);
    await queryRunner.query(`
        ALTER TABLE "category"
            ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
