import { Controller, Get, Param, ParseIntPipe, Patch, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.notificationsService.findAllForUser(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markRead(req.user.userId, id);
  }
}
