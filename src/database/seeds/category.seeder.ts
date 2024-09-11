import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from '../../modules/categories/category.entity';

dotenv.config();

export default class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'TRUNCATE "product" RESTART IDENTITY CASCADE; TRUNCATE "category" RESTART IDENTITY CASCADE;',
    );
    const repository = dataSource.getRepository(Category);
    await repository.insert([
      {
        name: 'romantic-flowers',
        description:
          "Beautiful flowers for romantic occasions like anniversaries or Valentine's Day.",
      },
      {
        name: 'get-well-flowers',
        description:
          'Bright flowers to lift spirits and wish a speedy recovery.',
        parent: {
          id: 1,
        },
      },
      {
        name: 'seasonal-flowers',
        description:
          'Fresh flowers for each season, perfect for year-round gifting.',
        parent: {
          id: 1,
        },
      },
      {
        name: 'luxury-flowers',
        description:
          'Exclusive, high-end floral arrangements for special occasions.',
        parent: {
          id: 3,
        },
      },
      {
        name: 'flower-subscriptions',
        description:
          'Weekly or monthly flower delivery plans to keep fresh blooms at your doorstep.',
        parent: {
          id: 4,
        },
      },
    ]);
  }
}
