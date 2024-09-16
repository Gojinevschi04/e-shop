import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '../../modules/products/product.entity';

export default class ProductSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'TRUNCATE "cart_item" RESTART IDENTITY CASCADE; TRUNCATE "product" RESTART IDENTITY CASCADE;',
    );
    const repository = dataSource.getRepository(Product);
    await repository.insert([
      {
        name: 'Red Rose Bouquet',
        description:
          'A beautiful bouquet of 12 red roses, perfect for any romantic occasion.',
        price: 55,
        brand: 'FlowerPower',
        color: 'Red',
        material: 'Fresh Flowers',
        isAvailable: true,
        category: { id: 1 },
      },
      {
        name: 'Elegant White Lilies',
        description:
          'Graceful white lilies arranged in a stunning display, ideal for formal events.',
        price: 65,
        brand: 'BlossomBouquet',
        color: 'White',
        material: 'Fresh Flowers',
        isAvailable: true,
        category: { id: 3 },
      },
      {
        name: 'Tropical Orchid Arrangement',
        description:
          'An exotic arrangement of colorful orchids to brighten up any room.',
        price: 75,
        brand: 'ExoticFlorals',
        color: 'Purple',
        material: 'Fresh Flowers',
        isAvailable: true,
        category: { id: 3 },
      },
      {
        name: 'Sunflower Basket',
        description:
          'A cheerful basket of sunflowers, perfect for gifting and decoration.',
        price: 40,
        brand: 'SunshineFlorals',
        color: 'Yellow',
        material: 'Fresh Flowers',
        isAvailable: true,
        category: { id: 2 },
      },
    ]);
  }
}
