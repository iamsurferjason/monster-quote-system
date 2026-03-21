import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1e3a5f' },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
};

const ROW_FILLS: ExcelJS.Fill[] = [
  {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1a1a2e' },
  },
  {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF16213e' },
  },
];

function applyHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
  });
  row.commit();
}

function applyDataRow(row: ExcelJS.Row, index: number): void {
  row.eachCell((cell) => {
    cell.fill = ROW_FILLS[index % 2];
  });
  row.commit();
}

function autoFitColumns(worksheet: ExcelJS.Worksheet): void {
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? String(cell.value) : '';
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    column.width = maxLength + 2;
  });
}

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportQuotations(): Promise<Buffer> {
    const quotations = await this.prisma.quotation.findMany({
      include: { customer: true, createdBy: true, items: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('報價單');

    worksheet.columns = [
      { header: '報價單號', key: 'quotationNo' },
      { header: '客戶', key: 'customer' },
      { header: '幣別', key: 'currency' },
      { header: '小計', key: 'subtotal' },
      { header: '稅額', key: 'taxAmount' },
      { header: '總金額', key: 'totalAmount' },
      { header: '狀態', key: 'status' },
      { header: '建立日期', key: 'createdAt' },
    ];

    applyHeaderRow(worksheet.getRow(1));
    worksheet.autoFilter = 'A1:H1';

    quotations.forEach((q, index) => {
      const row = worksheet.addRow({
        quotationNo: q.quotationNo,
        customer: q.customer?.companyName ?? '',
        currency: q.currencyCode ?? '',
        subtotal: Number(q.subtotal),
        taxAmount: Number(q.taxAmount),
        totalAmount: Number(q.totalAmount),
        status: q.status,
        createdAt: new Date(q.createdAt).toLocaleDateString('zh-TW'),
      });
      applyDataRow(row, index);
    });

    autoFitColumns(worksheet);

    return workbook.xlsx.writeBuffer();
  }

  async exportOrders(): Promise<Buffer> {
    const orders = await this.prisma.order.findMany({
      include: { customer: true, createdBy: true, items: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('訂單');

    worksheet.columns = [
      { header: '訂單號', key: 'orderNo' },
      { header: '客戶', key: 'customer' },
      { header: '幣別', key: 'currency' },
      { header: '總金額', key: 'totalAmount' },
      { header: '狀態', key: 'status' },
      { header: '建立日期', key: 'createdAt' },
    ];

    applyHeaderRow(worksheet.getRow(1));
    worksheet.autoFilter = 'A1:F1';

    orders.forEach((o, index) => {
      const row = worksheet.addRow({
        orderNo: o.orderNo,
        customer: o.customer?.companyName ?? '',
        currency: o.currencyCode ?? '',
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: new Date(o.createdAt).toLocaleDateString('zh-TW'),
      });
      applyDataRow(row, index);
    });

    autoFitColumns(worksheet);

    return workbook.xlsx.writeBuffer();
  }

  async exportPurchaseOrders(): Promise<Buffer> {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      include: { supplier: true, items: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('採購單');

    worksheet.columns = [
      { header: '採購單號', key: 'poNo' },
      { header: '供應商', key: 'supplier' },
      { header: '幣別', key: 'currency' },
      { header: '小計', key: 'subtotal' },
      { header: '稅額', key: 'taxAmount' },
      { header: '總金額', key: 'totalAmount' },
      { header: '狀態', key: 'status' },
      { header: '建立日期', key: 'createdAt' },
    ];

    applyHeaderRow(worksheet.getRow(1));
    worksheet.autoFilter = 'A1:H1';

    purchaseOrders.forEach((po, index) => {
      const row = worksheet.addRow({
        poNo: po.poNo,
        supplier: po.supplier?.companyName ?? '',
        currency: po.currencyCode ?? '',
        subtotal: Number(po.subtotal),
        taxAmount: Number(po.taxAmount),
        totalAmount: Number(po.totalAmount),
        status: po.status,
        createdAt: new Date(po.createdAt).toLocaleDateString('zh-TW'),
      });
      applyDataRow(row, index);
    });

    autoFitColumns(worksheet);

    return workbook.xlsx.writeBuffer();
  }

  async exportInvoices(): Promise<Buffer> {
    const invoices = await this.prisma.invoice.findMany({
      include: { customer: true, order: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('發票');

    worksheet.columns = [
      { header: '發票號', key: 'invoiceNo' },
      { header: '客戶', key: 'customer' },
      { header: '訂單號', key: 'orderNo' },
      { header: '總金額', key: 'totalAmount' },
      { header: '已付金額', key: 'paidAmount' },
      { header: '未付金額', key: 'unpaidAmount' },
      { header: '狀態', key: 'status' },
      { header: '到期日', key: 'dueDate' },
      { header: '建立日期', key: 'createdAt' },
    ];

    applyHeaderRow(worksheet.getRow(1));
    worksheet.autoFilter = 'A1:I1';

    invoices.forEach((inv, index) => {
      const totalAmount = Number(inv.totalAmount);
      const paidAmount = Number(inv.paidAmount);
      const unpaidAmount = totalAmount - paidAmount;

      const row = worksheet.addRow({
        invoiceNo: inv.invoiceNo,
        customer: inv.customer?.companyName ?? '',
        orderNo: inv.order?.orderNo ?? '',
        totalAmount,
        paidAmount,
        unpaidAmount,
        status: inv.status,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('zh-TW') : '',
        createdAt: new Date(inv.createdAt).toLocaleDateString('zh-TW'),
      });
      applyDataRow(row, index);
    });

    autoFitColumns(worksheet);

    return workbook.xlsx.writeBuffer();
  }
}
