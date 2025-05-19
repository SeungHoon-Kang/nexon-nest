import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  point: number; // 예: 포인트 보상량

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
