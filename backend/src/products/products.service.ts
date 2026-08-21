import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async create(userId: number, dto: CreateProductDto) {
    const business = await this.businessService.findMine(userId);
    // Products always start unpublished (schema default handles this),
    // the owner must explicitly publish afterwards.
    return this.prisma.product.create({
      data: { ...dto, businessId: business.id },
    });
  }

  // Public storefront listing - only published products, optionally by business.
  async findPublished(businessId?: number) {
    return this.prisma.product.findMany({
      where: { published: true, ...(businessId ? { businessId } : {}) },
    });
  }

  // Owner's own product list, including unpublished/draft ones.
  async findMine(userId: number) {
    const business = await this.businessService.findMine(userId);
    return this.prisma.product.findMany({ where: { businessId: business.id } });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(userId: number, id: number, dto: UpdateProductDto) {
    const product = await this.findOwned(userId, id);
    return this.prisma.product.update({ where: { id: product.id }, data: dto });
  }

  async remove(userId: number, id: number) {
    const product = await this.findOwned(userId, id);
    // Note: order history keeps priceAtPurchase on OrderItem, so deleting
    // a product never destroys historical order data.
    return this.prisma.product.delete({ where: { id: product.id } });
  }

  async publish(userId: number, id: number) {
    const product = await this.findOwned(userId, id);
    return this.prisma.product.update({
      where: { id: product.id },
      data: { published: true },
    });
  }

  async unpublish(userId: number, id: number) {
    const product = await this.findOwned(userId, id);
    return this.prisma.product.update({
      where: { id: product.id },
      data: { published: false },
    });
  }

  private async findOwned(userId: number, id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.businessService.assertOwnership(userId, product.businessId);
    return product;
  }
}
