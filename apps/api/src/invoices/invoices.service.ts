import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        customer: {
          select: { companyName: true },
        },
        order: {
          select: { orderNo: true },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: { companyName: true },
        },
        order: {
          select: { orderNo: true },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('客戶不存在');
    }

    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `INV-${ym}-`;

    const last = await this.prisma.invoice.findFirst({
      where: { invoiceNo: { startsWith: prefix } },
      orderBy: { invoiceNo: 'desc' },
    });

    const seq = last ? parseInt(last.invoiceNo.split('-')[2]) + 1 : 1;
    const invoiceNo = `${prefix}${String(seq).padStart(4, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNo,
        customerId: dto.customerId,
        orderId: dto.orderId ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        subtotal: dto.subtotal,
        taxAmount: dto.taxAmount,
        totalAmount: dto.totalAmount,
        paidAmount: 0,
        notes: dto.notes ?? null,
        status: 'DRAFT',
      },
      include: {
        customer: {
          select: { companyName: true },
        },
        order: {
          select: { orderNo: true },
        },
        payments: true,
      },
    });

    return invoice;
  }

  async addPayment(invoiceId: string, dto: AddPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.prisma.paymentRecord.create({
      data: {
        invoiceId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method ?? null,
        reference: dto.reference ?? null,
        notes: dto.notes ?? null,
      },
    });

    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    const newStatus =
      newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIAL_PAID';

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: {
        customer: {
          select: { companyName: true },
        },
        order: {
          select: { orderNo: true },
        },
        payments: true,
      },
    });

    return updatedInvoice;
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });

    return updated;
  }

  async getStats() {
    const [totalIssuedAgg, totalPaidAgg, totalOverdueAgg, pendingAgg] =
      await Promise.all([
        this.prisma.invoice.aggregate({
          where: { status: 'ISSUED' },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        this.prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        this.prisma.invoice.aggregate({
          where: { status: 'OVERDUE' },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        this.prisma.invoice.aggregate({
          where: { status: { in: ['ISSUED', 'PARTIAL_PAID', 'OVERDUE'] } },
          _sum: { totalAmount: true, paidAmount: true },
        }),
      ]);

    const pendingTotalAmount = Number(pendingAgg._sum.totalAmount ?? 0);
    const pendingPaidAmount = Number(pendingAgg._sum.paidAmount ?? 0);

    return {
      totalIssued: {
        count: totalIssuedAgg._count.id,
        amount: Number(totalIssuedAgg._sum.totalAmount ?? 0),
      },
      totalPaid: {
        count: totalPaidAgg._count.id,
        amount: Number(totalPaidAgg._sum.totalAmount ?? 0),
      },
      totalOverdue: {
        count: totalOverdueAgg._count.id,
        amount: Number(totalOverdueAgg._sum.totalAmount ?? 0),
      },
      pendingAmount: pendingTotalAmount - pendingPaidAmount,
    };
  }
}
