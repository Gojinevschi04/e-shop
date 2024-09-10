import { PaginateConfig } from 'nestjs-paginate';
import { Category } from './category.entity';

export const CATEGORIES_PAGINATION_CONFIG: PaginateConfig<Category> = {
  sortableColumns: ['id', 'name', 'description', 'parent.id', 'parent.name'],
  nullSort: 'last',
  defaultSortBy: [['id', 'DESC']],
  searchableColumns: ['id', 'name', 'description', 'parent.id'],
  select: ['id', 'name', 'description', 'parent.id', 'parent.name'],
  filterableColumns: {
    name: true,
  },
  relations: ['parent'],
};
