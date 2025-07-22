import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  async getAllFeedback(@Query('type') type?: string) {
    if (type) {
      return this.feedbackService.getFeedbackByType(type);
    }
    return this.feedbackService.getAllFeedback();
  }

  @Get('stats')
  async getFeedbackStats() {
    return this.feedbackService.getFeedbackStats();
  }

  @Get(':id')
  async getFeedbackById(@Param('id') id: string) {
    return this.feedbackService.getFeedbackById(id);
  }

  @Post()
  async createFeedback(@Body() createFeedbackDto: any) {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Put(':id')
  async updateFeedback(
    @Param('id') id: string,
    @Body() updateFeedbackDto: any,
  ) {
    return this.feedbackService.updateFeedback(id, updateFeedbackDto);
  }

  @Delete(':id')
  async deleteFeedback(@Param('id') id: string) {
    return this.feedbackService.deleteFeedback(id);
  }
}
