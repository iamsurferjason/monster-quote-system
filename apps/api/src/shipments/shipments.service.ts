import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shipment.findMany({
      include: {
        order: {
          select: {
            orderNo: true,
            customer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            orderNo: true,
            customer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with id ${id} not found`);
    }

    return shipment;
  }

  async create(dto: CreateShipmentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('訂單不存在');
    }

    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `SH-${ym}-`;
    const last = await this.prisma.shipment.findFirst({
      where: { shipmentNo: { startsWith: prefix } },
      orderBy: { shipmentNo: 'desc' },
    });
    const seq = last ? parseInt(last.shipmentNo.split('-')[2]) + 1 : 1;
    const shipmentNo = `${prefix}${String(seq).padStart(4, '0')}`;

    return this.prisma.shipment.create({
      data: {
        shipmentNo,
        orderId: dto.orderId,
        carrier: dto.carrier,
        trackingNo: dto.trackingNo,
        shippingDate: dto.shippingDate ? new Date(dto.shippingDate) : undefined,
        estimatedArrival: dto.estimatedArrival ? new Date(dto.estimatedArrival) : undefined,
        originCountry: dto.originCountry,
        destCountry: dto.destCountry,
        weight: dto.weight,
        packageCount: dto.packageCount,
        notes: dto.notes,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateShipmentStatusDto) {
    await this.findOne(id);

    return this.prisma.shipment.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async updateTracking(id: string, dto: Partial<CreateShipmentDto>) {
    await this.findOne(id);

    return this.prisma.shipment.update({
      where: { id },
      data: {
        carrier: dto.carrier,
        trackingNo: dto.trackingNo,
        estimatedArrival: dto.estimatedArrival ? new Date(dto.estimatedArrival) : undefined,
        notes: dto.notes,
      },
    });
  }
}
