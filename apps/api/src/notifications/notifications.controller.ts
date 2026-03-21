import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  sendEmail(@Body() dto: SendEmailDto) {
    return this.notificationsService.sendEmail(dto);
  }

  @Get('test')
  testConnection() {
    return this.notificationsService.testConnection();
  }

  @Post('overdue-invoice')
  notifyOverdueInvoice(
    @Body() body: { to: string; invoiceNo: string; amount: number; dueDate: string },
  ) {
    return this.notificationsService.notifyOverdueInvoice(
      body.to,
      body.invoiceNo,
      body.amount,
      body.dueDate,
    );
  }

  @Post('quotation-approval')
  notifyQuotationApproval(
    @Body() body: { to: string; quotationNo: string; customerName: string },
  ) {
    return this.notificationsService.notifyQuotationPendingApproval(
      body.to,
      body.quotationNo,
      body.customerName,
    );
  }

  @Post('shipment-delivered')
  notifyShipmentDelivered(
    @Body() body: { to: string; shipmentNo: string; orderNo: string },
  ) {
    return this.notificationsService.notifyShipmentDelivered(
      body.to,
      body.shipmentNo,
      body.orderNo,
    );
  }
}
