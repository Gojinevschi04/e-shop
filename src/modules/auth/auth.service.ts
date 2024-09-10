import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { BearerTokenDto } from './dto/bearerTokenDto';
import * as bcrypt from 'bcrypt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserEmailDto } from './dto/user-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Repository } from 'typeorm';
import { ResetPassword } from './reset-password.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';
import { User } from '../users/user.entity';
import { hashPassword } from '../../utility/password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ResetPassword)
    private resetPasswordRepository: Repository<ResetPassword>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      return user;
    }

    return null;
  }

  async login(userData: LoginUserDto): Promise<BearerTokenDto> {
    const bearerDto = new BearerTokenDto();
    bearerDto.accessToken = this.jwtService.sign(instanceToPlain(userData));
    return bearerDto;
  }

  async forgotPassword(userEmailDto: UserEmailDto): Promise<void> {
    if (!userEmailDto) {
      throw new BadRequestException('Invalid email address');
    }

    const user = await this.usersRepository.findOneBy({
      email: userEmailDto.email,
    });

    if (user == null) {
      return;
    }

    const currentTime: Date = new Date();
    const numberOfHoursToAddInMilliseconds = 60 * 60 * 1000;
    const resetPasswordDto = new ResetPasswordDto();
    resetPasswordDto.userEmail = userEmailDto.email;
    resetPasswordDto.token = uuidv4();

    resetPasswordDto.expiredAt = new Date(
      currentTime.getTime() + numberOfHoursToAddInMilliseconds,
    );

    const resetPassword = plainToInstance(ResetPassword, resetPasswordDto);
    resetPassword.email = userEmailDto.email;

    await this.usersService.sendEmail({
      to: resetPasswordDto.userEmail,
      subject: 'Reset Password Token',
      text: resetPasswordDto.token,
    });

    await this.resetPasswordRepository.save(resetPassword);
  }

  async resetPassword(userResetPasswordDto: UserResetPasswordDto) {
    const existentResetPasswordToken =
      await this.resetPasswordRepository.findOneBy({
        token: userResetPasswordDto.token,
      });

    if (existentResetPasswordToken == null) {
      throw new BadRequestException('Wrong or expired token');
    }

    const dateNow = new Date();
    const isExpired = existentResetPasswordToken.expiredAt <= dateNow;

    if (isExpired) {
      throw new BadRequestException('Wrong or expired token');
    }

    if (
      userResetPasswordDto.newPassword !==
      userResetPasswordDto.confirmNewPassword
    ) {
      throw new BadRequestException("Confirmed password doesn't match");
    }

    const oldUserData = await this.usersRepository.findOneBy({
      email: existentResetPasswordToken.email,
    });

    if (oldUserData == null) {
      throw new BadRequestException('Nonexistent user');
    }

    oldUserData.password = await hashPassword(userResetPasswordDto.newPassword);

    await this.usersRepository.save(oldUserData);
  }
}
