import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ResetPassword } from './reset-password.entity';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bull';
import { UserRole } from '../../common/enums/user.role';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let emailService: EmailService;
  let jwtService: JwtService;

  const mockBullQueue: any = {
    add: jest.fn(),
    process: jest.fn(),
  };

  const mockUsersRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOneByUsername: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockResetPasswordRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        EmailService,
        UsersService,
        JwtService,
        {
          provide: getQueueToken('email'),
          useValue: mockBullQueue,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(ResetPassword),
          useValue: mockResetPasswordRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUser => should validate the credentials and return the existent user', async () => {
    const username = 'john';
    const pass = 'test';
    const user = {
      id: 1,
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hash123',
    } as User;

    // @ts-ignore
    jest.spyOn(usersService, 'findOneByUsername').mockReturnValue(user);

    const result = await service.validateUser(username, pass);

    expect(usersService.findOneByUsername).toHaveBeenCalled();
    expect(usersService.findOneByUsername).toHaveBeenCalledWith(username);

    // expect(result).toEqual(user);
  });

  it('validateUser => should validate the credentials of a nonexistent user and return null', async () => {
    const username = 'ella';
    const pass = '123';
    const user = null;

    // @ts-ignore
    jest.spyOn(usersService, 'findOneByUsername').mockReturnValue(user);

    const result = await service.validateUser(username, pass);

    expect(usersService.findOneByUsername).toHaveBeenCalled();
    expect(usersService.findOneByUsername).toHaveBeenCalledWith(username);

    expect(result).toBeNull();
  });

  it('validateUser => should validate the wrong credentials and return null', async () => {
    const username = 'ella';
    const pass = 'wrong123';
    const user = {
      id: 1,
      username: 'ella',
      firstName: 'Ella',
      lastName: 'Doe',
      password: '2heu3b2',
    } as User;

    // @ts-ignore
    jest.spyOn(usersService, 'findOneByUsername').mockReturnValue(user);

    const result = await service.validateUser(username, pass);

    expect(usersService.findOneByUsername).toHaveBeenCalled();
    expect(usersService.findOneByUsername).toHaveBeenCalledWith(username);

    expect(result).toBeNull();
  });

  it('login => should ', async () => {});

  it('forgotPassword => should ', async () => {});

  it('resetPassword => should ', async () => {});
});
