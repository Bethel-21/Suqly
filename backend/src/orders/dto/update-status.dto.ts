import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums';

export class UpdateStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
}
