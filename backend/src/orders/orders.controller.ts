import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Roles('CUSTOMER')
  @Post()
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Roles('OWNER', 'CUSTOMER')
  @Get()
  findAll(@Request() req: any) {
    return this.ordersService.findAllForUser(req.user.userId, req.user.role);
  }

  @Roles('OWNER', 'CUSTOMER')
  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(req.user.userId, req.user.role, id);
  }

  @Roles('OWNER')
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(req.user.userId, id, dto);
  }
}
