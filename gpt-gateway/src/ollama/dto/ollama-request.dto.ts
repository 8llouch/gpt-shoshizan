import { IsString, IsOptional, IsBoolean, IsArray, IsObject, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class OllamaOptionsDto {
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  top_p?: number;

  @IsOptional()
  @IsNumber()
  num_ctx?: number;

  @IsOptional()
  @IsNumber()
  num_predict?: number;

  @IsOptional()
  @IsNumber()
  repeat_penalty?: number;

  @IsOptional()
  @IsNumber()
  seed?: number;

  @IsOptional()
  @IsNumber()
  stop?: string[];
}

export class OllamaRequestDto {
  @IsString()
  model: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  context?: number[];

  @IsOptional()
  @IsString()
  system?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @Type(() => OllamaOptionsDto)
  options?: OllamaOptionsDto;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
