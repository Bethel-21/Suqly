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
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Post()
  create(@Request() req: any, @Body() dto: CreateBusinessDto) {
    return this.businessService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Get('me')
  findMine(@Request() req: any) {
    return this.businessService.findMine(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @Patch('me')
  update(@Request() req: any, @Body() dto: UpdateBusinessDto) {
    return this.businessService.update(req.user.userId, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.businessService.findOne(id);
  }
}
