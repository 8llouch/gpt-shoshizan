import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModelOptionsDto } from './model-options.dto';

export class LlmRequestMessageDto {
  @IsString()
  model: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  system?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  context?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelOptionsDto)
  options: ModelOptionsDto;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsString()
  conversationId: string;
}
