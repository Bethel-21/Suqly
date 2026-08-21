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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post()
  create(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Query('businessId', ParseIntPipe) businessId: number) {
    return this.categoriesService.findAllForBusiness(businessId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.update(req.user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(req.user.userId, id);
  }
}
