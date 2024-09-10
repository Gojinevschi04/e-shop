import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1725884189714 implements MigrationInterface {
  name = 'Migration1725884189714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone
    `);
    await queryRunner.query(`
        ALTER TABLE "user"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone
    `);
    await queryRunner.query(`
        ALTER TABLE "reset_password"
            ADD "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone
    `);
    await queryRunner.query(`
        ALTER TABLE "reset_password"
            ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "reset_password"
            DROP COLUMN "updatedAt"
    `);
    await queryRunner.query(`
        ALTER TABLE "reset_password"
            DROP COLUMN "createdAt"
    `);
    await queryRunner.query(`
        ALTER TABLE "user"
            DROP COLUMN "updatedAt"
    `);
    await queryRunner.query(`
        ALTER TABLE "user"
            DROP COLUMN "createdAt"
    `);
  }
}
