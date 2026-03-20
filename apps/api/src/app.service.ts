import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Monster Quote System API';
  }

  async getHealth() {
    const now = await this.prisma.$queryRaw`SELECT NOW() as now`;
    return {
      status: 'ok',
      database: 'connected',
      now,
    };
  }
}
