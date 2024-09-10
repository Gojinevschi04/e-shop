import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { USER_PAGINATION_CONFIG } from './config-user';
import { plainToInstance } from 'class-transformer';
import { UserChangePasswordDto } from './dto/user-change-password.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { hashPassword } from '../../utility/password';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectQueue('email')
    private readonly emailQueue: Queue,
  ) {}

  async create(createUserDto: UserDto): Promise<UserDto> {
    const user = plainToInstance(User, createUserDto);

    user.password = await hashPassword(createUserDto.password);
    return plainToInstance(UserDto, this.usersRepository.save(user));
  }

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return await paginate(query, this.usersRepository, USER_PAGINATION_CONFIG);
  }

  async findOneById(id: number): Promise<UserDto | null> {
    return plainToInstance(UserDto, this.usersRepository.findOneBy({ id: id }));
  }

  findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username: username });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email: email });
  }

  async update(id: number, updateUserDto: UserDto): Promise<UserDto | null> {
    const oldUserData = await this.usersRepository.findOneBy({ id: id });

    if (oldUserData == null) {
      return null;
    }

    const userData = this.usersRepository.merge(oldUserData, updateUserDto);
    userData.password = await hashPassword(updateUserDto.password);

    return plainToInstance(UserDto, this.usersRepository.save(userData));
  }

  async changePassword(
    userData: User,
    userChangePasswordDto: UserChangePasswordDto,
  ): Promise<void> {
    const isMatch = await bcrypt.compare(
      userChangePasswordDto.currentPassword,
      userData.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Wrong Password');
    }
    if (
      userChangePasswordDto.newPassword !==
      userChangePasswordDto.confirmNewPassword
    ) {
      throw new BadRequestException("Confirmed password doesn't match");
    }
    if (
      userChangePasswordDto.currentPassword ===
      userChangePasswordDto.newPassword
    ) {
      throw new BadRequestException(
        "Your new password can't be your old password",
      );
    }

    userData.password = await hashPassword(userChangePasswordDto.newPassword);
    await this.usersRepository.save(userData);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async sendEmail(data: { to: string; subject: string; text: string }) {
    await this.emailQueue.add(data);
    return { message: 'Email added to the queue' };
  }
}
