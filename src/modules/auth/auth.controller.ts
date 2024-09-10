import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BearerTokenDto } from './dto/bearerTokenDto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '../users/enums/user.role';
import { Roles } from '../users/users.decorator';
import { Public } from './public.decorator';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../users/dto/user.dto';
import { UserEmailDto } from './dto/user-email.dto';
import { UserResetPasswordDto } from './dto/user-reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
  })
  @ApiCreatedResponse({
    description: 'Authentication successfully',
    type: BearerTokenDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async login(@Request() req: any): Promise<BearerTokenDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.Admin)
  @Get('/profile')
  getProfile(@Request() req: any) {
    return plainToInstance(UserDto, req.user);
  }

  @Public()
  @ApiBody({
    type: UserEmailDto,
    description: 'User email',
  })
  @ApiCreatedResponse({
    description: 'Password reset email has been sent successfully',
  })
  @Post('/forgot-password')
  forgotPassword(@Body() userEmailDto: UserEmailDto): Promise<void> {
    return this.authService.forgotPassword(userEmailDto);
  }

  @Public()
  @Post('/reset-password')
  @ApiCreatedResponse({
    description: 'Password reset successfully',
  })
  @ApiBody({
    type: UserResetPasswordDto,
    description: 'User reset password',
  })
  async resetPassword(
    @Body() userResetPasswordDto: UserResetPasswordDto,
  ): Promise<void> {
    return this.authService.resetPassword(userResetPasswordDto);
  }
}
