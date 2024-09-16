import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { Category } from './category.entity';
import { CATEGORIES_PAGINATION_CONFIG } from './config-categories';
import { Public } from '../auth/public.decorator';

@Public()
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiBody({
    type: CategoryDto,
    description: 'Create new category',
  })
  @Post()
  create(@Body() createCategoryDto: CategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @PaginatedSwaggerDocs(Category, CATEGORIES_PAGINATION_CONFIG)
  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Category>> {
    return await this.categoriesService.findAll(query);
  }

  @ApiCreatedResponse({
    description: 'Category data found',
    type: CategoryDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryDto | null> {
    return this.categoriesService.findOneById(id);
  }

  @ApiBody({
    type: CategoryDto,
    description: 'Update category',
  })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: CategoryDto,
  ): Promise<CategoryDto | null> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
