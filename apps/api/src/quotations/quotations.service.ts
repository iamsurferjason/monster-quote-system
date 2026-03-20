import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuotationStatus } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async create(createQuotationDto: CreateQuotationDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: createQuotationDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const createdBy = await this.prisma.user.findUnique({
      where: { id: createQuotationDto.createdById },
    });

    if (!createdBy) {
      throw new NotFoundException('User not found');
    }

    const quotationCount = await this.prisma.quotation.count();
    const quotationNo = `Q-${new Date().getFullYear()}${String(
      new Date().getMonth() + 1,
    ).padStart(2, '0')}-${String(quotationCount + 1).padStart(4, '0')}`;

    const items = createQuotationDto.items.map((item) => {
      const qty = Number(item.qty);
      const unitPrice = Number(item.unitPrice);
      const discountRate = Number(item.discountRate ?? 0);
      const amount = qty * unitPrice * (1 - discountRate / 100);

      return {
        productId: item.productId ?? null,
        productName: item.productName,
        qty,
        unitPrice,
        discountRate,
        amount,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * 0.05;
    const totalAmount = subtotal + taxAmount;

    const result = await this.prisma.quotation.create({
      data: {
        quotationNo,
        customerId: createQuotationDto.customerId,
        createdById: createQuotationDto.createdById,
        tradeMode: createQuotationDto.tradeMode ?? 'DOMESTIC',
        currencyCode: createQuotationDto.currencyCode ?? 'TWD',
        exchangeRate: createQuotationDto.exchangeRate ?? 1,
        incoterm: createQuotationDto.incoterm ?? null,
        shipFromCountry: createQuotationDto.shipFromCountry ?? null,
        shipToCountry: createQuotationDto.shipToCountry ?? null,
        loadingPort: createQuotationDto.loadingPort ?? null,
        dischargePort: createQuotationDto.dischargePort ?? null,
        paymentTerm: createQuotationDto.paymentTerm ?? null,
        validityDate: createQuotationDto.validityDate
          ? new Date(createQuotationDto.validityDate)
          : null,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: items,
        },
        versions: {
          create: {
            versionNo: 1,
            snapshot: {
              quotationNo,
              customerId: createQuotationDto.customerId,
              createdById: createQuotationDto.createdById,
              tradeMode: createQuotationDto.tradeMode ?? 'DOMESTIC',
              currencyCode: createQuotationDto.currencyCode ?? 'TWD',
              exchangeRate: createQuotationDto.exchangeRate ?? 1,
              incoterm: createQuotationDto.incoterm ?? null,
              shipFromCountry: createQuotationDto.shipFromCountry ?? null,
              shipToCountry: createQuotationDto.shipToCountry ?? null,
              loadingPort: createQuotationDto.loadingPort ?? null,
              dischargePort: createQuotationDto.dischargePort ?? null,
              paymentTerm: createQuotationDto.paymentTerm ?? null,
              validityDate: createQuotationDto.validityDate ?? null,
              status: 'DRAFT',
              subtotal,
              taxAmount,
              totalAmount,
              items: items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                qty: String(item.qty),
                unitPrice: String(item.unitPrice),
                discountRate: String(item.discountRate),
                amount: String(item.amount),
              })),
            },
          },
        },
      },
      include: {
        customer: true,
        items: true,
        createdBy: true,
      },
    });

    return {
      message: 'Quotation created successfully',
      data: result,
    };
  }

  async findAll() {
    return this.prisma.quotation.findMany({
      include: {
        customer: true,
        items: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: true,
        items: true,
        versions: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return {
      message: 'Quotation fetched successfully',
      data: quotation,
    };
  }

  async updateStatus(id: string, status: string, roles: string[]) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    const targetStatus = status as QuotationStatus;
    const hasRole = (role: string) => roles.includes(role);

    const allowedTransitions: Partial<Record<QuotationStatus, QuotationStatus[]>> = {
      DRAFT: ['SENT'],
      SENT: ['APPROVED', 'REJECTED'],
      APPROVED: ['CONVERTED'],
      REJECTED: [],
      CONVERTED: [],
    };

    const allowed = allowedTransitions[quotation.status] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${quotation.status} to ${targetStatus}`,
      );
    }

    if (quotation.status === 'DRAFT' && targetStatus === 'SENT') {
      if (!(hasRole('ADMIN') || hasRole('SALES'))) {
        throw new ForbiddenException('Insufficient role');
      }
    } else if (
      quotation.status === 'SENT' &&
      (targetStatus === 'APPROVED' || targetStatus === 'REJECTED')
    ) {
      if (!(hasRole('ADMIN') || hasRole('MANAGER'))) {
        throw new ForbiddenException('Insufficient role');
      }
    } else if (
      quotation.status === 'APPROVED' &&
      targetStatus === 'CONVERTED'
    ) {
      if (!hasRole('ADMIN')) {
        throw new ForbiddenException('Insufficient role');
      }
    } else {
      if (!hasRole('ADMIN')) {
        throw new ForbiddenException('Insufficient role');
      }
    }

    const updated = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: targetStatus,
      },
    });

    return {
      message: 'Status updated successfully',
      data: updated,
    };
  }

  async convertToOrder(id: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    if (quotation.status !== 'APPROVED') {
      throw new BadRequestException(
        `Only APPROVED quotations can be converted. Current status: ${quotation.status}`,
      );
    }

    const orderCount = await this.prisma.order.count();
    const orderNo = `SO-${new Date().getFullYear()}${String(
      new Date().getMonth() + 1,
    ).padStart(2, '0')}-${String(orderCount + 1).padStart(4, '0')}`;

    const order = await this.prisma.order.create({
      data: {
        orderNo,
        quotationId: quotation.id,
        customerId: quotation.customerId,
        createdById: quotation.createdById,
        tradeMode: quotation.tradeMode,
        currencyCode: quotation.currencyCode,
        exchangeRate: quotation.exchangeRate,
        incoterm: quotation.incoterm,
        shipFromCountry: quotation.shipFromCountry,
        shipToCountry: quotation.shipToCountry,
        loadingPort: quotation.loadingPort,
        dischargePort: quotation.dischargePort,
        paymentTerm: quotation.paymentTerm,
        totalAmount: quotation.totalAmount,
        status: 'DRAFT',
        items: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            qty: item.qty,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await this.prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        status: 'CONVERTED',
      },
    });

    return {
      message: 'Quotation converted to order successfully',
      data: order,
    };
  }

  async generatePdf(id: string) {
    const result = await this.findOne(id);
    const quotation = result.data;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }
            h1 {
              margin-bottom: 8px;
            }
            .meta {
              margin-bottom: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            .summary {
              margin-top: 24px;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <h1>Quotation</h1>
          <div class="meta">
            <p><strong>No:</strong> ${quotation.quotationNo}</p>
            <p><strong>Status:</strong> ${quotation.status}</p>
            <p><strong>Customer:</strong> ${quotation.customer.companyName}</p>
            <p><strong>Trade Mode:</strong> ${quotation.tradeMode ?? '-'}</p>
            <p><strong>Currency:</strong> ${quotation.currencyCode ?? '-'}</p>
            <p><strong>Exchange Rate:</strong> ${quotation.exchangeRate ?? '-'}</p>
            <p><strong>Incoterm:</strong> ${quotation.incoterm ?? '-'}</p>
            <p><strong>Ship From:</strong> ${quotation.shipFromCountry ?? '-'}</p>
            <p><strong>Ship To:</strong> ${quotation.shipToCountry ?? '-'}</p>
            <p><strong>Payment Term:</strong> ${quotation.paymentTerm ?? '-'}</p>
            <p><strong>Date:</strong> ${new Date(quotation.createdAt).toLocaleString('zh-TW')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.qty}</td>
                  <td>${item.unitPrice}</td>
                  <td>${item.discountRate ?? ''}</td>
                  <td>${item.amount}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="summary">
            <p><strong>Subtotal:</strong> ${quotation.subtotal}</p>
            <p><strong>Tax:</strong> ${quotation.taxAmount}</p>
            <p><strong>Total:</strong> ${quotation.totalAmount}</p>
          </div>
        </body>
      </html>
    `;

    return this.pdfService.generatePdfFromHtml(html);
  }
}