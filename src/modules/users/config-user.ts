import { PaginateConfig } from 'nestjs-paginate';
import { User } from './user.entity';

export const USER_PAGINATION_CONFIG: PaginateConfig<User> = {
  sortableColumns: ['id', 'firstName', 'lastName', 'username', 'email', 'role'],
  nullSort: 'last',
  defaultSortBy: [['id', 'DESC']],
  searchableColumns: ['firstName', 'lastName', 'username', 'email', 'role'],
  select: ['id', 'firstName', 'lastName', 'username', 'email', 'role'],
  filterableColumns: {
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    username: true,
  },
};
