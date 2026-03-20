import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customer.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        companyName: 'asc',
      },
    });
  }
}