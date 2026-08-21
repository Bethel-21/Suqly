import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async create(userId: number, dto: CreateCategoryDto) {
    const business = await this.businessService.findMine(userId);
    return this.prisma.category.create({
      data: { name: dto.name, businessId: business.id },
    });
  }

  async findAllForBusiness(businessId: number) {
    return this.prisma.category.findMany({ where: { businessId } });
  }

  async update(userId: number, id: number, dto: CreateCategoryDto) {
    const category = await this.findOwned(userId, id);
    return this.prisma.category.update({
      where: { id: category.id },
      data: { name: dto.name },
    });
  }

  async remove(userId: number, id: number) {
    const category = await this.findOwned(userId, id);
    return this.prisma.category.delete({ where: { id: category.id } });
  }

  private async findOwned(userId: number, id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.businessService.assertOwnership(userId, category.businessId);
    return category;
  }
}
