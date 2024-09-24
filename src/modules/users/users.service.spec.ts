import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { hashPassword } from '../../utility/password';
import { UserRole } from '../../common/enums/user.role';
import { UserDto } from './dto/user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create => should create a new user and return its data', async () => {
    const createUserDto = {
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'test',
      role: UserRole.User,
    } as UserDto;

    const newUser = {
      id: Date.now(),
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: await hashPassword('test'),
      role: UserRole.User,
    } as User;

    jest.spyOn(mockUsersRepository, 'save').mockReturnValue(newUser);

    const result = await service.create(createUserDto);

    expect(mockUsersRepository.save).toHaveBeenCalled();
    // expect(mockUsersRepository.save).toHaveBeenCalledWith(newUser);

    expect(result).toEqual(newUser);
  });

  it('findAll => should return a paginated list of users', async () => {});

  it('findOneById => should find an user by given it and return its data', async () => {
    const id = 1;

    const user = {
      id: Date.now(),
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: '2heu3b2',
      role: UserRole.User,
    } as User;

    jest.spyOn(mockUsersRepository, 'findOneBy').mockReturnValue(user);

    const result = await service.findOneById(id);

    expect(result).toEqual(user);

    expect(mockUsersRepository.findOneBy).toHaveBeenCalled();
    expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({
      id,
    });
  });

  it('update => should ', async () => {});

  it('changePassword => should ', async () => {});

  it('remove => should find an existent user and delete it', async () => {
    const id = 1;
    const data = {
      id: Date.now(),
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: '2heu3b2',
      role: UserRole.User,
    } as User;
    const res = undefined;

    jest.spyOn(mockUsersRepository, 'findOneBy').mockReturnValue(data);
    jest.spyOn(mockUsersRepository, 'delete');

    const result = service.remove(id);

    expect(mockUsersRepository.findOneBy).toHaveBeenCalled();
    expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    // expect(mockUsersRepository.delete).toHaveBeenCalled();
    // expect(mockUsersRepository.delete).toHaveBeenCalledWith(id);

    await expect(result).resolves.toBeUndefined();
  });

  it('remove => should find a nonexistent user and throw error', async () => {
    const id = 0;
    const data = null;

    jest.spyOn(mockUsersRepository, 'findOneBy').mockReturnValue(data);

    const remove = service.remove(id);

    expect(mockUsersRepository.findOneBy).toHaveBeenCalled();
    expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: id });

    await expect(remove).rejects.toBeInstanceOf(BadRequestException);
  });
});
