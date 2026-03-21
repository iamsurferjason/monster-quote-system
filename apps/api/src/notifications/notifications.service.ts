import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASS', ''),
      },
    });
  }

  async sendEmail(dto: SendEmailDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', dto.to),
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
      });
      this.logger.log(`Email sent to ${dto.to}: ${dto.subject}`);
      return { success: true, message: 'Email 已發送' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${dto.to}`, error);
      return { success: false, message: `發送失敗: ${msg}` };
    }
  }

  // 快捷方法：逾期發票通知
  async notifyOverdueInvoice(to: string, invoiceNo: string, amount: number, dueDate: string) {
    return this.sendEmail({
      to,
      subject: `[Monster Quote] 發票逾期提醒 - ${invoiceNo}`,
      html: `
        <h2>發票逾期提醒</h2>
        <p>發票 <strong>${invoiceNo}</strong> 已逾期。</p>
        <p>未付金額：<strong>${amount.toLocaleString()}</strong></p>
        <p>到期日：<strong>${dueDate}</strong></p>
        <p>請盡快處理。</p>
      `,
    });
  }

  // 快捷方法：報價待審核通知
  async notifyQuotationPendingApproval(to: string, quotationNo: string, customerName: string) {
    return this.sendEmail({
      to,
      subject: `[Monster Quote] 報價待審核 - ${quotationNo}`,
      html: `
        <h2>報價單待審核</h2>
        <p>客戶 <strong>${customerName}</strong> 的報價單 <strong>${quotationNo}</strong> 等待您審核。</p>
        <p>請登入系統進行審核。</p>
      `,
    });
  }

  // 快捷方法：出貨送達通知
  async notifyShipmentDelivered(to: string, shipmentNo: string, orderNo: string) {
    return this.sendEmail({
      to,
      subject: `[Monster Quote] 出貨送達確認 - ${shipmentNo}`,
      html: `
        <h2>出貨送達確認</h2>
        <p>出貨單 <strong>${shipmentNo}</strong>（訂單 ${orderNo}）已送達。</p>
        <p>請確認收貨並更新系統。</p>
      `,
    });
  }

  // 連線測試
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP 連線正常' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, message: `SMTP 連線失敗: ${msg}` };
    }
  }
}
