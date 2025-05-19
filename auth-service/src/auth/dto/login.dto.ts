// src/auth/dto/register.dto.ts
import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(5, 20)
  loginId: string;

  @IsString()
  @Length(8, 32)
  password: string;
}
