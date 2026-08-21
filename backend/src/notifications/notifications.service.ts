import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAllForUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(userId: number, id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) {
      throw new ForbiddenException('This is not your notification');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
