import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getQueueToken } from '@nestjs/bullmq';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { ResetPassword } from './reset-password.entity';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
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
      controllers: [AuthController],
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

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getProfile => should ensure the JwtAuthGuard is applied to the getProfile method', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      AuthController.prototype.getProfile,
    );
    const guard = new guards[0]();

    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it('login => should ensure the LocalAuthGuard is applied to the login method', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      AuthController.prototype.login,
    );
    const guard = new guards[0]();

    expect(guard).toBeInstanceOf(LocalAuthGuard);
  });
});
