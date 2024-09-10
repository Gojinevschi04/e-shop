import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1725525588564 implements MigrationInterface {
  name = 'Migration1725525588564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user"
        ADD "email" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
  }
}
