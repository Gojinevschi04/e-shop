// import { Seeder } from 'typeorm-extension';
// import { DataSource } from 'typeorm';
// import { CartItem } from '../../modules/cart/cart-item.entity';
//
// export default class CartItemSeeder implements Seeder {
//   public async run(dataSource: DataSource): Promise<void> {
//     await dataSource.query(' TRUNCATE "cart_item" RESTART IDENTITY;');
//     const repository = dataSource.getRepository(CartItem);
//     await repository.insert([
//       {
//         user: { id: 1 },
//         product: { id: 1 },
//         quantity: 1,
//         totalPrice: 20,
//       },
//       {
//         user: { id: 1 },
//         product: { id: 3 },
//         quantity: 5,
//         totalPrice: 300,
//       },
//       {
//         user: { id: 1 },
//         product: { id: 1 },
//         quantity: 3,
//         totalPrice: 202,
//       },
//     ]);
//   }
// }
