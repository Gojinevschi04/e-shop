import { PaginateConfig } from 'nestjs-paginate';
import { Review } from './review.entity';

export const REVIEW_PAGINATION_CONFIG: PaginateConfig<Review> = {
  sortableColumns: ['id', 'rating'],
  nullSort: 'last',
  defaultSortBy: [['id', 'DESC']],
  searchableColumns: ['id', 'rating', 'product.id'],
  select: ['id', 'user.username', 'content', 'rating', 'product.name'],
  filterableColumns: {
    name: true,
  },
  relations: ['user', 'product'],
};
