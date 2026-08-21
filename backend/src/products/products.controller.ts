import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post()
  create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.userId, dto);
  }

  // Public storefront: only published products.
  // ?businessId=1 to filter to a single store.
  @Get()
  findAll(@Query('businessId') businessId?: string) {
    return this.productsService.findPublished(
      businessId ? parseInt(businessId, 10) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Get('mine')
  findMine(@Request() req: any) {
    return this.productsService.findMine(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Patch(':id/publish')
  publish(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.publish(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Patch(':id/unpublish')
  unpublish(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.productsService.unpublish(req.user.userId, id);
  }
}
