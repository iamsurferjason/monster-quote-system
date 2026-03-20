import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PdfModule } from './pdf/pdf.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuotationsModule } from './quotations/quotations.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    PdfModule,
    AuthModule,
    QuotationsModule,
    OrdersModule,
    CustomersModule,
    ProductsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}