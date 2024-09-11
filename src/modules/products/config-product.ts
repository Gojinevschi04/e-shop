import { PaginateConfig } from 'nestjs-paginate';
import { Product } from './product.entity';

export const PRODUCT_PAGINATION_CONFIG: PaginateConfig<Product> = {
  sortableColumns: [
    'id',
    'name',
    'description',
    'category.name',
    'price',
    'material',
    'color',
    'brand',
  ],
  nullSort: 'last',
  defaultSortBy: [['id', 'DESC']],
  searchableColumns: ['id', 'name', 'description', 'category.name'],
  select: [
    'id',
    'name',
    'description',
    'brand',
    'color',
    'isAvailable',
    'category.name',
    'price',
    'material',
  ],
  filterableColumns: {
    name: true,
  },
  relations: ['category'],
};
