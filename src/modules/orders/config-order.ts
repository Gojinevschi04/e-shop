import { PaginateConfig } from 'nestjs-paginate';
import { Order } from './order.entity';

export const ORDER_PAGINATION_CONFIG: PaginateConfig<Order> = {
  sortableColumns: ['id', 'status', 'address', 'totalSum'],
  nullSort: 'last',
  defaultSortBy: [['id', 'DESC']],
  searchableColumns: ['id', 'status', 'address', 'totalSum'],
  select: ['products', 'status', 'address', 'totalSum'],
  filterableColumns: {
    status: true,
  },
  relations: ['user', 'products'],
};
