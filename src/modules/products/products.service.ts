import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { ProductDto } from './dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { PRODUCT_PAGINATION_CONFIG } from './config-product';
import { FilesService } from '../files/files.service';
import { FileDto } from '../files/file.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private filesServices: FilesService,
  ) {}

  async create(
    createProductDto: ProductDto,
    file: FileDto,
  ): Promise<ProductDto> {
    const newProduct = plainToInstance(Product, createProductDto);
    console.log(file);

    const image = await this.filesServices.saveFileData(file);
    newProduct.image = image;

    const category = await this.categoriesRepository.findOneBy({
      id: createProductDto.categoryId,
    });

    if (category == null) {
      throw new BadRequestException('Nonexistent category');
    }
    newProduct.category = category;

    return plainToInstance(
      ProductDto,
      this.productsRepository.save(newProduct),
    );
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Product>> {
    return await paginate(
      query,
      this.productsRepository,
      PRODUCT_PAGINATION_CONFIG,
    );
  }

  async findOneById(id: number): Promise<ProductDto | null> {
    return plainToInstance(
      ProductDto,
      this.productsRepository.findOneBy({ id: id }),
    );
  }

  async update(
    id: number,
    updateProductDto: ProductDto,
  ): Promise<ProductDto | null> {
    const oldProductData = await this.productsRepository.findOneBy({
      id: id,
    });

    if (oldProductData == null) {
      throw new BadRequestException('Nonexistent product to update');
    }

    const productData = this.productsRepository.merge(
      oldProductData,
      updateProductDto,
    );

    const category = await this.categoriesRepository.findOneBy({
      id: updateProductDto.categoryId,
    });

    if (category == null) {
      throw new BadRequestException('Nonexistent category');
    }

    productData.category = category;

    return plainToInstance(
      ProductDto,
      this.productsRepository.save(productData),
    );
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
