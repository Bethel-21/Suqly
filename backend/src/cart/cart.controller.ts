import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller('carts')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.cartService.findAllForCustomer(req.user.userId);
  }

  @Get(':businessId')
  findForBusiness(
    @Request() req: any,
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.cartService.findForBusiness(req.user.userId, businessId);
  }

  @Post(':businessId/items')
  addItem(
    @Request() req: any,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: AddItemDto,
  ) {
    return this.cartService.addItem(req.user.userId, businessId, dto);
  }

  @Patch(':businessId/items/:id')
  updateItem(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(req.user.userId, id, dto);
  }

  @Delete(':businessId/items/:id')
  removeItem(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(req.user.userId, id);
  }
}
