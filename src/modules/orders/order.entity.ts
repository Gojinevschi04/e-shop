import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderStatus } from '../../common/enums/order-status';
import { Product } from '../products/product.entity';
import { PaymentStatus } from '../../common/enums/payment-status';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
  })
  @JoinColumn()
  user: User;

  @ManyToMany(() => Product, (product) => product.id, {
    eager: true,
  })
  @JoinTable()
  products: Product[];

  @Column({
    name: 'payment_status',
    type: 'varchar',
    default: PaymentStatus.Created,
  })
  paymentStatus: PaymentStatus;

  @Column()
  status: OrderStatus;

  @Column()
  address: string;

  @Column()
  totalSum: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
