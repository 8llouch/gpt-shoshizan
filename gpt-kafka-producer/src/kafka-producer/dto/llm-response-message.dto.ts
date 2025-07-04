import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModelOptionsDto } from './model-options.dto';

export class LlmResponseMessageDto {
  @IsString()
  model: string;

  @IsString()
  prompt: string;

  @IsString()
  response: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  context?: number[];

  @IsOptional()
  @IsString()
  system?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelOptionsDto)
  options?: ModelOptionsDto;

  @IsString()
  conversationId: string;
}
