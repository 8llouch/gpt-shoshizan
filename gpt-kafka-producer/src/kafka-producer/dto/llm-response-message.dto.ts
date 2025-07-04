import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

export class LlmResponseMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  response: string;

  @IsString()
  @IsOptional()
  timestamp?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  context?: number[];
}
