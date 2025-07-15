import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKBArticleDto, UpdateKBArticleDto } from './dto/kb-article.dto';
import { KBArticle, ArticleStatus } from '../../generated/prisma';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createKBArticleDto: CreateKBArticleDto, authorId: string): Promise<KBArticle> {
    return this.prisma.kBArticle.create({
      data: {
        ...createKBArticleDto,
        authorId,
        publishedAt: createKBArticleDto.status === ArticleStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: true,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: ArticleStatus,
    category?: string,
    search?: string,
  ): Promise<{
    articles: KBArticle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.kBArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.kBArticle.count({ where }),
    ]);

    return { articles, total, page, limit };
  }

  async findOne(id: string, incrementView: boolean = true): Promise<KBArticle | null> {
    if (incrementView) {
      await this.prisma.kBArticle.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return this.prisma.kBArticle.findUnique({
      where: { id },
      include: {
        author: true,
        attachments: true,
      },
    });
  }

  async update(id: string, updateKBArticleDto: UpdateKBArticleDto): Promise<KBArticle> {
    const data: any = { ...updateKBArticleDto };
    
    if (updateKBArticleDto.status === ArticleStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    return this.prisma.kBArticle.update({
      where: { id },
      data,
      include: {
        author: true,
      },
    });
  }

  async remove(id: string): Promise<KBArticle> {
    return this.prisma.kBArticle.delete({
      where: { id },
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.kBArticle.findMany({
      select: { category: true },
      where: { 
        category: { not: null },
        status: ArticleStatus.PUBLISHED,
      },
      distinct: ['category'],
    });

    return categories.map(c => c.category).filter((cat): cat is string => cat !== null);
  }

  async getTags(): Promise<string[]> {
    const articles = await this.prisma.kBArticle.findMany({
      select: { tags: true },
      where: { status: ArticleStatus.PUBLISHED },
    });

    const allTags = articles.flatMap(a => a.tags);
    return [...new Set(allTags)];
  }

  async markHelpful(id: string, helpful: boolean): Promise<KBArticle> {
    return this.prisma.kBArticle.update({
      where: { id },
      data: helpful 
        ? { helpful: { increment: 1 } }
        : { notHelpful: { increment: 1 } },
    });
  }

  async getPopularArticles(limit: number = 10): Promise<KBArticle[]> {
    return this.prisma.kBArticle.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { views: 'desc' },
      take: limit,
      include: {
        author: true,
      },
    });
  }
}
