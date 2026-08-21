import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: number, dto: CreateBusinessDto) {
    const existing = await this.prisma.business.findUnique({
      where: { ownerId },
    });
    if (existing) {
      throw new ConflictException('You already have a business');
    }
    return this.prisma.business.create({
      data: { ...dto, ownerId },
    });
  }

  async findMine(ownerId: number) {
    const business = await this.prisma.business.findUnique({
      where: { ownerId },
    });
    if (!business) {
      throw new NotFoundException('You have not created a business yet');
    }
    return business;
  }

  async findOne(id: number) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async update(ownerId: number, dto: UpdateBusinessDto) {
    const business = await this.findMine(ownerId);
    return this.prisma.business.update({
      where: { id: business.id },
      data: dto,
    });
  }

  // Helper used by other modules (categories/products) to make sure
  // the logged-in owner actually owns the business they're acting on.
  async assertOwnership(userId: number, businessId: number) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) {
      throw new ForbiddenException('You do not own this business');
    }
    return business;
  }
}
