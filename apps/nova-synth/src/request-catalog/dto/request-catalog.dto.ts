import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { RequestCatalogCategory } from '../../../generated/prisma';

export enum FormFieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  DATE = 'date',
  DATETIME = 'datetime',
  NUMBER = 'number',
  EMAIL = 'email',
  URL = 'url',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
}

export class FormFieldOption {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class FormField {
  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsEnum(FormFieldType)
  type: FormFieldType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  options?: FormFieldOption[];

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  validation?: string; // JSON string for validation rules
}

export class CreateRequestCatalogItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(RequestCatalogCategory)
  category: RequestCatalogCategory;

  @IsArray()
  formFields: FormField[];

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  approvalRequired?: string; // JSON string for approval workflow
}

export class UpdateRequestCatalogItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RequestCatalogCategory)
  category?: RequestCatalogCategory;

  @IsOptional()
  @IsArray()
  formFields?: FormField[];

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  approvalRequired?: string;
}

export class CreateRequestDto {
  @IsString()
  catalogItemId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  formData: Record<string, any>;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsString()
  justification?: string;
}
