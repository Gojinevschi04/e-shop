import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import * as process from 'node:process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPassword } from './reset-password.entity';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([ResetPassword]),
    JwtModule.register({
      global: true,
      secret: process.env.APP_TOKEN,
      signOptions: { expiresIn: `${process.env.APP_EXPIRE_TIME_SECONDS}s` },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
