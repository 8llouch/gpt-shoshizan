import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ModelOptionsDto {
  @IsOptional()
  @IsNumber()
  num_ctx?: number;

  @IsOptional()
  @IsNumber()
  repeat_last_n?: number;

  @IsOptional()
  @IsNumber()
  repeat_penalty?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  seed?: number;

  @IsOptional()
  @IsString()
  stop?: string;

  @IsNumber()
  num_predict: number;

  @IsOptional()
  @IsNumber()
  top_k?: number;

  @IsOptional()
  @IsNumber()
  top_p?: number;

  @IsOptional()
  @IsNumber()
  min_p?: number;

  @IsOptional()
  @IsNumber()
  tfs_z?: number;

  @IsOptional()
  @IsNumber()
  typical_p?: number;

  @IsOptional()
  @IsNumber()
  mirostat?: number;

  @IsOptional()
  @IsNumber()
  mirostat_eta?: number;

  @IsOptional()
  @IsNumber()
  mirostat_tau?: number;

  @IsOptional()
  @IsNumber()
  num_gpu?: number;

  @IsOptional()
  @IsNumber()
  num_thread?: number;
}
