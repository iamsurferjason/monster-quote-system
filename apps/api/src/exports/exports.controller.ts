import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('quotations')
  async exportQuotations(@Res() res: Response) {
    const buffer = await this.exportsService.exportQuotations();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="quotations.xlsx"',
    );
    res.send(buffer);
  }

  @Get('orders')
  async exportOrders(@Res() res: Response) {
    const buffer = await this.exportsService.exportOrders();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="orders.xlsx"',
    );
    res.send(buffer);
  }

  @Get('purchase-orders')
  async exportPurchaseOrders(@Res() res: Response) {
    const buffer = await this.exportsService.exportPurchaseOrders();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="purchase-orders.xlsx"',
    );
    res.send(buffer);
  }

  @Get('invoices')
  async exportInvoices(@Res() res: Response) {
    const buffer = await this.exportsService.exportInvoices();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="invoices.xlsx"',
    );
    res.send(buffer);
  }
}
