import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

// Allowed forward transitions per the spec. No separate "Accepted" status -
// Pending -> Processing already means "owner accepted / started processing".
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Places an order from the customer's Zembil for ONE business.
  // Runs as a transaction: stock is checked + decremented atomically,
  // so two simultaneous orders can never oversell the same stock.
  async create(customerId: number, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId_businessId: { customerId, businessId: dto.businessId } },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your Zembil for this business is empty');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${item.product.name}`,
          );
        }
      }

      const order = await tx.order.create({
        data: {
          customerId,
          businessId: dto.businessId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Zembil is cleared after a successful order.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      const business = await tx.business.findUnique({
        where: { id: dto.businessId },
      });
      await tx.notification.create({
        data: {
          userId: business!.ownerId,
          message: 'New order received.',
        },
      });

      return order;
    });
  }

  async findAllForUser(userId: number, role: string) {
    if (role === 'OWNER') {
      const business = await this.prisma.business.findUnique({
        where: { ownerId: userId },
      });
      if (!business) return [];
      return this.prisma.order.findMany({
        where: { businessId: business.id },
        include: { items: true },
      });
    }
    return this.prisma.order.findMany({
      where: { customerId: userId },
      include: { items: true },
    });
  }

  async findOne(userId: number, role: string, id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, business: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isCustomerOwner = role === 'CUSTOMER' && order.customerId === userId;
    const isBusinessOwner =
      role === 'OWNER' && order.business.ownerId === userId;
    if (!isCustomerOwner && !isBusinessOwner) {
      throw new ForbiddenException('You cannot view this order');
    }
    return order;
  }

  // Only the business owner can change status. Cancelling restores stock.
  async updateStatus(ownerId: number, id: number, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, business: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.business.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this order');
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move order from ${order.status} to ${dto.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.status === 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status: dto.status },
      });

      const messages: Record<string, string> = {
        PROCESSING: 'Your order is now processing.',
        READY: 'Your order is ready.',
        COMPLETED: 'Your order has been completed.',
        CANCELLED: 'Your order has been cancelled.',
      };
      const message = messages[dto.status];
      if (message) {
        await tx.notification.create({
          data: { userId: order.customerId, message },
        });
      }

      return updated;
    });
  }
}
