import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { UserRole } from '../../modules/users/enums/user.role';

import * as dotenv from 'dotenv';
import { hashPassword } from '../../utility/password';

dotenv.config();

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "user" RESTART IDENTITY;');
    const repository = dataSource.getRepository(User);
    await repository.insert([
      {
        username: 'john',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: await hashPassword('test'),
        role: UserRole.Admin,
      },
      {
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: await hashPassword('guess'),
        role: UserRole.Moderator,
      },
      {
        username: 'david',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david@example.com',
        password: await hashPassword('cake'),
        role: UserRole.User,
      },
    ]);
  }
}
