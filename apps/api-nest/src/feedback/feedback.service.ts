import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async getAllFeedback() {
    return await this.prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFeedbackById(id: string) {
    return await this.prisma.feedback.findUnique({
      where: { id },
    });
  }

  async createFeedback(data: any) {
    return await this.prisma.feedback.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content,
        rating: data.rating,
        email: data.email,
        metadata: data.metadata,
      },
    });
  }

  async updateFeedback(id: string, data: any) {
    return await this.prisma.feedback.update({
      where: { id },
      data: {
        status: data.status,
        metadata: data.metadata,
      },
    });
  }

  async deleteFeedback(id: string) {
    return await this.prisma.feedback.delete({
      where: { id },
    });
  }

  async getFeedbackByType(type: string) {
    return await this.prisma.feedback.findMany({
      where: { type },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFeedbackStats() {
    const totalFeedback = await this.prisma.feedback.count();
    const avgRating = await this.prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
    });
    const feedbackByType = await this.prisma.feedback.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    });

    return {
      total: totalFeedback,
      averageRating: avgRating._avg.rating || 0,
      byType: feedbackByType,
    };
  }
}
