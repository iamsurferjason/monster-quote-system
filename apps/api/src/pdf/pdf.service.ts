import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateQuotationPdfHtml(data: {
    quotationNo: string;
    companyName: string;
    customerName: string;
    createdAt: string;
    items: Array<{
      productName: string;
      qty: string | number;
      unitPrice: string | number;
      discountRate?: string | number | null;
      amount: string | number;
    }>;
    subtotal: string | number;
    taxAmount: string | number;
    totalAmount: string | number;
  }) {
    const rows = data.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.productName}</td>
            <td class="num">${item.qty}</td>
            <td class="num">${item.unitPrice}</td>
            <td class="num">${item.discountRate ?? 0}</td>
            <td class="num">${item.amount}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${data.quotationNo}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111;
              background: #fff;
              font-size: 14px;
              line-height: 1.5;
            }
            .container { width: 100%; }
            .header { margin-bottom: 24px; }
            .company-name {
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 4px 0;
            }
            .document-title {
              font-size: 20px;
              font-weight: 600;
              margin: 0;
            }
            .meta {
              margin-top: 20px;
              margin-bottom: 24px;
            }
            .meta-row { margin-bottom: 6px; }
            .label {
              display: inline-block;
              width: 120px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border: 1px solid #cfcfcf;
              padding: 10px 8px;
              vertical-align: middle;
            }
            th {
              background: #f5f5f5;
              font-weight: 700;
              text-align: left;
            }
            td.num, th.num { text-align: right; }
            .summary {
              width: 320px;
              margin-left: auto;
              margin-top: 24px;
              border-collapse: collapse;
            }
            .summary td {
              border: 1px solid #cfcfcf;
              padding: 10px 8px;
            }
            .summary .summary-label {
              background: #f5f5f5;
              font-weight: 600;
            }
            .summary .summary-value { text-align: right; }
            .footer {
              margin-top: 36px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-name">${data.companyName}</div>
              <div class="document-title">Quotation</div>
            </div>

            <div class="meta">
              <div class="meta-row">
                <span class="label">Quotation No</span>
                <span>${data.quotationNo}</span>
              </div>
              <div class="meta-row">
                <span class="label">Customer</span>
                <span>${data.customerName}</span>
              </div>
              <div class="meta-row">
                <span class="label">Date</span>
                <span>${data.createdAt}</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Product</th>
                  <th class="num" style="width: 90px;">Qty</th>
                  <th class="num" style="width: 120px;">Unit Price</th>
                  <th class="num" style="width: 100px;">Discount %</th>
                  <th class="num" style="width: 120px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <table class="summary">
              <tr>
                <td class="summary-label">Subtotal</td>
                <td class="summary-value">${data.subtotal}</td>
              </tr>
              <tr>
                <td class="summary-label">Tax</td>
                <td class="summary-value">${data.taxAmount}</td>
              </tr>
              <tr>
                <td class="summary-label">Total</td>
                <td class="summary-value"><strong>${data.totalAmount}</strong></td>
              </tr>
            </table>

            <div class="footer">
              Monster Tool Co., Ltd.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async generateOrderPdfHtml(data: {
    orderNo: string;
    companyName: string;
    customerName: string;
    createdAt: string;
    status: string;
    items: Array<{
      productName: string;
      qty: string | number;
      unitPrice: string | number;
      amount: string | number;
    }>;
    totalAmount: string | number;
  }) {
    const rows = data.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.productName}</td>
            <td class="num">${item.qty}</td>
            <td class="num">${item.unitPrice}</td>
            <td class="num">${item.amount}</td>
          </tr>
        `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${data.orderNo}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111;
              background: #fff;
              font-size: 14px;
              line-height: 1.5;
            }
            .container { width: 100%; }
            .header { margin-bottom: 24px; }
            .company-name {
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 4px 0;
            }
            .document-title {
              font-size: 20px;
              font-weight: 600;
              margin: 0;
            }
            .meta {
              margin-top: 20px;
              margin-bottom: 24px;
            }
            .meta-row { margin-bottom: 6px; }
            .label {
              display: inline-block;
              width: 120px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border: 1px solid #cfcfcf;
              padding: 10px 8px;
              vertical-align: middle;
            }
            th {
              background: #f5f5f5;
              font-weight: 700;
              text-align: left;
            }
            td.num, th.num { text-align: right; }
            .summary {
              width: 320px;
              margin-left: auto;
              margin-top: 24px;
              border-collapse: collapse;
            }
            .summary td {
              border: 1px solid #cfcfcf;
              padding: 10px 8px;
            }
            .summary .summary-label {
              background: #f5f5f5;
              font-weight: 600;
            }
            .summary .summary-value { text-align: right; }
            .footer {
              margin-top: 36px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-name">${data.companyName}</div>
              <div class="document-title">Order</div>
            </div>

            <div class="meta">
              <div class="meta-row">
                <span class="label">Order No</span>
                <span>${data.orderNo}</span>
              </div>
              <div class="meta-row">
                <span class="label">Customer</span>
                <span>${data.customerName}</span>
              </div>
              <div class="meta-row">
                <span class="label">Date</span>
                <span>${data.createdAt}</span>
              </div>
              <div class="meta-row">
                <span class="label">Status</span>
                <span>${data.status}</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Product</th>
                  <th class="num" style="width: 90px;">Qty</th>
                  <th class="num" style="width: 120px;">Unit Price</th>
                  <th class="num" style="width: 120px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <table class="summary">
              <tr>
                <td class="summary-label">Total</td>
                <td class="summary-value"><strong>${data.totalAmount}</strong></td>
              </tr>
            </table>

            <div class="footer">
              Monster Tool Co., Ltd.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}