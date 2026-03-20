import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
        createdBy: true,
        items: true,
        quotation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true,
        items: true,
        quotation: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order fetched successfully',
      data: order,
    };
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      PROCESSING: [OrderStatus.SHIPPED],
      SHIPPED: [OrderStatus.COMPLETED],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[order.status] || [];

    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${status}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    return {
      message: 'Order status updated successfully',
      data: updated,
    };
  }

  async generatePdf(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const html = await this.pdfService.generateOrderPdfHtml({
      orderNo: order.orderNo,
      companyName: 'Monster Tool Co., Ltd.',
      customerName: order.customer.companyName,
      createdAt: new Date(order.createdAt).toLocaleDateString('zh-TW'),
      status: order.status,
      items: order.items.map((item) => ({
        productName: item.productName,
        qty: item.qty.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
      })),
      totalAmount: order.totalAmount.toString(),
    });

    return this.pdfService.generatePdfFromHtml(html);
  }
}