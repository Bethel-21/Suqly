import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [PrismaModule, BusinessModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
