import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsNotEmpty() image: string;
  @IsNumber() @Min(0) price: number;
  @IsInt() @Min(0) stock: number;
  @IsInt() categoryId: number;
}
