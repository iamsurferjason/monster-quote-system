import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePoStatusDto } from './dto/update-po-status.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: true,
        createdBy: true,
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return {
      message: 'Purchase order fetched successfully',
      data: purchaseOrder,
    };
  }

  async create(userId: string, dto: CreatePurchaseOrderDto) {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `PO-${ym}-`;
    const last = await this.prisma.purchaseOrder.findFirst({
      where: { poNo: { startsWith: prefix } },
      orderBy: { poNo: 'desc' },
    });
    const seq = last ? parseInt(last.poNo.split('-')[2]) + 1 : 1;
    const poNo = `${prefix}${String(seq).padStart(4, '0')}`;

    const items = dto.items.map((item) => {
      const qty = Number(item.qty);
      const unitPrice = Number(item.unitPrice);
      const amount = qty * unitPrice;

      return {
        productId: item.productId ?? null,
        productName: item.productName,
        qty,
        unitPrice,
        amount,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(subtotal * 0.05);
    const totalAmount = subtotal + taxAmount;

    const result = await this.prisma.purchaseOrder.create({
      data: {
        poNo,
        supplierId: dto.supplierId,
        createdById: userId,
        currencyCode: dto.currencyCode ?? 'TWD',
        exchangeRate: dto.exchangeRate ?? 1,
        incoterm: dto.incoterm ?? null,
        paymentTerm: dto.paymentTerm ?? null,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        warehouseNote: dto.warehouseNote ?? null,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: items,
        },
      },
      include: {
        supplier: true,
        items: true,
        createdBy: true,
      },
    });

    return {
      message: 'Purchase order created successfully',
      data: result,
    };
  }

  async updateStatus(id: string, dto: UpdatePoStatusDto) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    return {
      message: 'Status updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchaseOrder.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only DRAFT purchase orders can be deleted',
      );
    }

    await this.prisma.purchaseOrder.delete({
      where: { id },
    });

    return {
      message: 'Purchase order deleted successfully',
    };
  }
}
