import { IsInt } from 'class-validator';

export class CreateOrderDto {
  @IsInt() businessId: number;
}
