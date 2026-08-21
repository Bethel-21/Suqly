import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // A customer has one Zembil per business (see @@unique([customerId, businessId])).
  async findAllForCustomer(customerId: number) {
    return this.prisma.cart.findMany({
      where: { customerId },
      include: { items: { include: { product: true } }, business: true },
    });
  }

  async findForBusiness(customerId: number, businessId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId_businessId: { customerId, businessId } },
      include: { items: { include: { product: true } } },
    });
    return cart ?? { customerId, businessId, items: [] };
  }

  async addItem(customerId: number, businessId: number, dto: AddItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || !product.published) {
      throw new NotFoundException('Product not available');
    }
    // Products from different businesses can never share an order/cart.
    if (product.businessId !== businessId) {
      throw new BadRequestException(
        'This product does not belong to the selected business',
      );
    }

    // NOTE: adding to Zembil never decrements stock - stock only changes
    // when an order is actually placed.
    const cart = await this.prisma.cart.upsert({
      where: { customerId_businessId: { customerId, businessId } },
      update: {},
      create: { customerId, businessId },
    });

    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
      update: { quantity: { increment: dto.quantity } },
      create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
    });
  }

  async updateItem(customerId: number, itemId: number, dto: UpdateItemDto) {
    const item = await this.findOwnedItem(customerId, itemId);
    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });
  }

  async removeItem(customerId: number, itemId: number) {
    const item = await this.findOwnedItem(customerId, itemId);
    return this.prisma.cartItem.delete({ where: { id: item.id } });
  }

  private async findOwnedItem(customerId: number, itemId: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.cart.customerId !== customerId) {
      throw new ForbiddenException('This is not your cart item');
    }
    return item;
  }
}
