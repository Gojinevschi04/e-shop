import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1726062534347 implements MigrationInterface {
  name = 'Migration1726062534347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "file"
            RENAME COLUMN "name" TO "originalName"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "file"
            RENAME COLUMN "originalName" TO "name"
    `);
  }
}
