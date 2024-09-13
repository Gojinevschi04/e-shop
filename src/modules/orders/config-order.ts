import { PaginateConfig } from 'nestjs-paginate';
import { Order } from './order.entity';

export const ORDER_PAGINATION_CONFIG: PaginateConfig<Order> = {
  sortableColumns: ['id', 'user.id', 'status', 'address', 'totalSum'],
  nullSort: 'last',
  defaultSortBy: [['id', 'DESC']],
  searchableColumns: [
    'id',
    'user.id',
    'status',
    'address',
    'totalSum',
    'products',
  ],
  select: ['id', 'user.id', 'products', 'status', 'address', 'totalSum'],
  filterableColumns: {
    name: true,
  },
  relations: ['parent'],
};
