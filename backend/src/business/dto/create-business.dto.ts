import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBusinessDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() logo: string;
  @IsString() @IsNotEmpty() motto: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsNotEmpty() phone: string;
}
