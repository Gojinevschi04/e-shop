import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from '../../modules/categories/category.entity';

dotenv.config();

export default class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "category" RESTART IDENTITY;');
    const repository = dataSource.getRepository(Category);
    await repository.insert([
      {
        name: 'gift',
        description:
          'Simple and clean flower arrangements with a modern touch.',
        parent: null,
      },
      {
        name: 'gift-baskets',
        description:
          'Thoughtfully curated gift baskets with flowers and treats.',
        parent: {
          id: 1,
        },
      },
      {
        name: 'flower-chocolate-combos',
        description:
          'Perfect combinations of flowers and chocolates for gifting.',
        parent: {
          id: 2,
        },
      },
    ]);
  }
}
