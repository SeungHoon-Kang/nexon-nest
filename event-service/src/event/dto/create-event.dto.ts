import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsString()
  rewardCondition: string;

  @IsString()
  rewardId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
