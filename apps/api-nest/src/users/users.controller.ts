import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Version,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // V1 Legacy endpoints
  @Post()
  @Version('1')
  createV1(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Version('1')
  findAllV1() {
    return this.usersService.findAll();
  }

  // V2 Modern endpoints with enhanced features
  @Post()
  @Version('2')
  async createV2(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      ...user,
      version: '2.0.0',
      apiVersion: 'v2',
    };
  }

  @Get()
  @Version('2')
  async findAllV2() {
    const users = await this.usersService.findAll();
    return {
      users,
      version: '2.0.0',
      apiVersion: 'v2',
      pagination: {
        page: 1,
        limit: 50,
        total: users.length,
      },
    };
  }

  @Get('me')
  async getCurrentUser(@Request() req) {
    const clerkId = req.user.sub;
    return this.usersService.findByClerkId(clerkId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
