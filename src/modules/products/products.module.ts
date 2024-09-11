import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { FilesService } from '../files/files.service';
import { File } from '../files/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, File])],
  controllers: [ProductsController],
  providers: [ProductsService, FilesService],
})
export class ProductsModule {}
