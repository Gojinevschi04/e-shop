import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Paginate,
  Paginated,
  PaginatedSwaggerDocs,
  PaginateQuery,
} from 'nestjs-paginate';
import { USER_PAGINATION_CONFIG } from './config-user';
import { BearerTokenDto } from '../auth/dto/bearerTokenDto';
import { UserChangePasswordDto } from './dto/user-change-password.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBody({
    type: UserDto,
    description: 'Create new user',
  })
  @Post()
  create(@Body() createUserDto: UserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @PaginatedSwaggerDocs(User, USER_PAGINATION_CONFIG)
  @Get()
  @Public()
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return await this.usersService.findAll(query);
  }

  @ApiCreatedResponse({
    description: 'User data found',
    type: UserDto,
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto | null> {
    return this.usersService.findOneById(id);
  }

  @ApiBody({
    type: UserDto,
    description: 'Update user',
  })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UserDto,
  ): Promise<UserDto | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('change-password')
  @ApiCreatedResponse({
    description: 'Password changed successfully',
    type: BearerTokenDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async changePassword(
    @Body() userChangePasswordDto: UserChangePasswordDto,
    @Request() req: any,
  ): Promise<void> {
    return this.usersService.changePassword(req.user, userChangePasswordDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Public()
  @Post('/send')
  async sendEmail(@Body() data: { to: string; subject: string; text: string }) {
    return this.usersService.sendEmail(data);
  }
}
