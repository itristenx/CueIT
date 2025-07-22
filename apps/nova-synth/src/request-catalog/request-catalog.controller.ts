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
  Query,
  Version,
} from '@nestjs/common';
import { RequestCatalogService } from './request-catalog.service';
import {
  CreateRequestCatalogItemDto,
  UpdateRequestCatalogItemDto,
  CreateRequestDto,
} from './dto/request-catalog.dto';
import { RequestCatalogCategory } from '../../generated/prisma';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('request-catalog')
@UseGuards(ClerkAuthGuard)
export class RequestCatalogController {
  constructor(private readonly requestCatalogService: RequestCatalogService) {}

  // V2 Enhanced endpoints (default)
  @Post('items')
  @Version('2')
  async createCatalogItem(
    @Body() createDto: CreateRequestCatalogItemDto,
    @Request() req,
  ) {
    const user = req.user;
    const item = await this.requestCatalogService.createCatalogItem(
      createDto,
      user.sub,
    );

    return {
      success: true,
      data: item,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('items')
  @Version('2')
  async findAllCatalogItems(
    @Query('category') category?: RequestCatalogCategory,
    @Query('isActive') isActive?: boolean,
  ) {
    const items = await this.requestCatalogService.findAllCatalogItems(
      category,
      isActive,
    );

    return {
      success: true,
      data: items,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('items/:id')
  @Version('2')
  async findCatalogItem(@Param('id') id: string) {
    const item = await this.requestCatalogService.findCatalogItemById(id);

    return {
      success: true,
      data: item,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('items/:id')
  @Version('2')
  async updateCatalogItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequestCatalogItemDto,
    @Request() req,
  ) {
    const user = req.user;
    const item = await this.requestCatalogService.updateCatalogItem(
      id,
      updateDto,
      user.sub,
    );

    return {
      success: true,
      data: item,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('items/:id')
  @Version('2')
  async deleteCatalogItem(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.requestCatalogService.deleteCatalogItem(id, user.sub);

    return {
      success: true,
      message: 'Request catalog item deleted successfully',
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('requests')
  @Version('2')
  async createRequest(@Body() createDto: CreateRequestDto, @Request() req) {
    const user = req.user;
    const request = await this.requestCatalogService.createRequest(
      createDto,
      user.sub,
    );

    return {
      success: true,
      data: request,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('requests')
  @Version('2')
  async findMyRequests(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const user = req.user;
    const result = await this.requestCatalogService.findRequestsByUser(
      user.sub,
      parseInt(page),
      parseInt(limit),
    );

    return {
      success: true,
      data: result.requests,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @Version('2')
  async getCatalogStats() {
    const stats = await this.requestCatalogService.getCatalogStats();

    return {
      success: true,
      data: stats,
      version: '2.0',
      timestamp: new Date().toISOString(),
    };
  }

  // V1 Legacy endpoints (for backward compatibility)
  @Post('items')
  @Version('1')
  async createCatalogItemV1(
    @Body() createDto: CreateRequestCatalogItemDto,
    @Request() req,
  ) {
    const user = req.user;
    const item = await this.requestCatalogService.createCatalogItem(
      createDto,
      user.sub,
    );
    return item;
  }

  @Get('items')
  @Version('1')
  async findAllCatalogItemsV1(
    @Query('category') category?: RequestCatalogCategory,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.requestCatalogService.findAllCatalogItems(category, isActive);
  }

  @Get('items/:id')
  @Version('1')
  async findCatalogItemV1(@Param('id') id: string) {
    return this.requestCatalogService.findCatalogItemById(id);
  }

  @Patch('items/:id')
  @Version('1')
  async updateCatalogItemV1(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequestCatalogItemDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.requestCatalogService.updateCatalogItem(
      id,
      updateDto,
      user.sub,
    );
  }

  @Delete('items/:id')
  @Version('1')
  async deleteCatalogItemV1(@Param('id') id: string, @Request() req) {
    const user = req.user;
    await this.requestCatalogService.deleteCatalogItem(id, user.sub);
    return { message: 'Request catalog item deleted successfully' };
  }

  @Post('requests')
  @Version('1')
  async createRequestV1(@Body() createDto: CreateRequestDto, @Request() req) {
    const user = req.user;
    return this.requestCatalogService.createRequest(createDto, user.sub);
  }

  @Get('requests')
  @Version('1')
  async findMyRequestsV1(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const user = req.user;
    return this.requestCatalogService.findRequestsByUser(
      user.sub,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('stats')
  @Version('1')
  async getCatalogStatsV1() {
    return this.requestCatalogService.getCatalogStats();
  }
}
