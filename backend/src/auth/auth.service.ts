import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private buildAuthResponse(user: {
    id: number;
    phone: string;
    name: string;
    role: string;
  }) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }
}
