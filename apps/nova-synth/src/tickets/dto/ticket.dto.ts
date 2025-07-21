import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Priority, TicketStatus, TicketType } from '../../../generated/prisma';

export class CreateTicketDto {
  /**
   * Optional: Number of seconds for undo send window. If set, ticket can be undone within this window.
   */
  @IsOptional()
  undoSendTimeout?: number;
  @IsOptional()
  reassignmentLocked?: boolean;
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateTicketDto {
  /**
   * Optional: Number of seconds for undo send window (for admin update).
   */
  @IsOptional()
  undoSendTimeout?: number;
  @IsOptional()
  reassignmentLocked?: boolean;
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  isInternal?: boolean;
}
