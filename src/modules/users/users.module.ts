import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BullModule } from '@nestjs/bull';
import { EmailQueue } from './queues/email.queue';
import { ResetPassword } from '../auth/reset-password.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ResetPassword])],
  exports: [TypeOrmModule, UsersService],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
