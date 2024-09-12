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
import { File } from '../files/file.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    private filesServices: FilesService,
  ) {}

  async create(
    createProductDto: ProductDto,
    file?: FileDto,
  ): Promise<ProductDto> {
    const newProduct = plainToInstance(Product, createProductDto);

    if (file) {
      newProduct.image = await this.filesServices.saveFileData(file);
    }

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
    file?: FileDto,
  ): Promise<ProductDto | null> {
    let oldProductData = await this.productsRepository.findOneBy({
      id: id,
    });

    if (oldProductData == null) {
      throw new BadRequestException('Nonexistent product to update');
    }

    const category = await this.categoriesRepository.findOneBy({
      id: updateProductDto.categoryId,
    });

    if (category == null) {
      throw new BadRequestException('Nonexistent category');
    }

    if (oldProductData.image != null) {
      await this.filesServices.deleteFile(oldProductData.image.id);
      await this.filesRepository.delete(oldProductData.image.id);
    }

    oldProductData = this.productsRepository.merge(
      oldProductData,
      updateProductDto,
    );

    if (file) {
      const image = await this.filesServices.saveFileData(file);
      oldProductData.image = image;
    }

    oldProductData.category = category;

    return plainToInstance(
      ProductDto,
      this.productsRepository.save(oldProductData),
    );
  }

  async remove(id: number): Promise<void> {
    const productData = await this.productsRepository.findOneBy({
      id: id,
    });

    if (productData == null) {
      throw new BadRequestException('Nonexistent product to delete');
    }

    if (productData.image != null) {
      await this.filesServices.deleteFile(productData.image.id);
      await this.filesRepository.delete(productData.image.id);
    }
    await this.productsRepository.delete(id);
    return;
  }
}
