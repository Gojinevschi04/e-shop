import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { File } from '../files/file.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @JoinColumn()
  @OneToOne(() => File, (image) => image.id, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  image?: File;

  @Column()
  price: number;

  @Column()
  brand: string;

  @Column()
  color: string;

  @Column()
  material: string;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Category, (category) => category.id, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn()
  category: Category;

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
