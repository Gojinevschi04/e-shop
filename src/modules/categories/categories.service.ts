import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { plainToInstance } from 'class-transformer';
import { CategoryDto } from './dto/category.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CATEGORIES_PAGINATION_CONFIG } from './config-categories';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CategoryDto): Promise<CategoryDto> {
    const newCategory = plainToInstance(Category, createCategoryDto);

    if (createCategoryDto.parentId != null) {
      const parent = await this.categoriesRepository.findOneBy({
        id: createCategoryDto.parentId,
      });

      if (parent == null) {
        throw new BadRequestException('Nonexistent parent category');
      }
      newCategory.parent = parent;
    }

    return plainToInstance(
      CategoryDto,
      this.categoriesRepository.save(newCategory),
    );
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Category>> {
    return await paginate(
      query,
      this.categoriesRepository,
      CATEGORIES_PAGINATION_CONFIG,
    );
  }

  async findOneById(id: number): Promise<CategoryDto | null> {
    return plainToInstance(
      CategoryDto,
      this.categoriesRepository.findOneBy({ id: id }),
    );
  }

  async update(
    id: number,
    updateCategoryDto: CategoryDto,
  ): Promise<CategoryDto | null> {
    let categoryData = await this.categoriesRepository.findOneBy({
      id: id,
    });

    if (categoryData == null) {
      throw new BadRequestException('Nonexistent category to update');
    }

    categoryData = this.categoriesRepository.merge(
      categoryData,
      updateCategoryDto,
    );

    if (updateCategoryDto.parentId != null) {
      const parent = await this.categoriesRepository.findOneBy({
        id: updateCategoryDto.parentId,
      });

      if (parent == null) {
        throw new BadRequestException('Nonexistent parent category');
      }
      categoryData.parent = parent;
    } else {
      categoryData.parent = null;
    }

    return plainToInstance(
      CategoryDto,
      this.categoriesRepository.save(categoryData),
    );
  }

  async remove(id: number): Promise<void> {
    const data = await this.categoriesRepository.findOneBy({
      id: id,
    });

    if (data == null) {
      throw new BadRequestException('Nonexistent category to delete');
    }
    await this.categoriesRepository.delete(id);
  }
}
