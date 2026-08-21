import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Role)
  role: Role;
}
