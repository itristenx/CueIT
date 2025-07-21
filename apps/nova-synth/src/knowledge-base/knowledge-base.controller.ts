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
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKBArticleDto, UpdateKBArticleDto } from './dto/kb-article.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { ArticleStatus } from '../../generated/prisma';

@Controller('knowledge-base')
@UseGuards(ClerkAuthGuard)
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post()
  async create(@Body() createKBArticleDto: CreateKBArticleDto, @Request() req) {
    const user = req.user;
    return this.knowledgeBaseService.create(createKBArticleDto, user.sub);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: ArticleStatus,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.knowledgeBaseService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
      category,
      search,
    );
  }

  @Get('categories')
  async getCategories() {
    return this.knowledgeBaseService.getCategories();
  }

  @Get('tags')
  async getTags() {
    return this.knowledgeBaseService.getTags();
  }

  @Get('popular')
  async getPopular(@Query('limit') limit: string = '10') {
    return this.knowledgeBaseService.getPopularArticles(parseInt(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeBaseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKBArticleDto: UpdateKBArticleDto) {
    return this.knowledgeBaseService.update(id, updateKBArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowledgeBaseService.remove(id);
  }

  @Post(':id/helpful')
  async markHelpful(@Param('id') id: string, @Body() body: { helpful: boolean }) {
    return this.knowledgeBaseService.markHelpful(id, body.helpful);
  }
}
