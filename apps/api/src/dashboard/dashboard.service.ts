import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      quotationCount,
      orderCount,
      pendingApprovalCount,
      completedOrderCount,
    ] = await Promise.all([
      this.prisma.quotation.count(),
      this.prisma.order.count(),
      this.prisma.quotation.count({
        where: {
          status: 'SENT',
        },
      }),
      this.prisma.order.count({
        where: {
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      quotationCount,
      orderCount,
      pendingApprovalCount,
      completedOrderCount,
    };
  }

  async getCharts() {
    const quotationCount = await this.prisma.quotation.count();
    const orderCount = await this.prisma.order.count();

    const orderStatusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      orderBy: {
        status: 'asc',
      },
    });

    return {
      totalsChart: [
        { label: '報價', value: quotationCount },
        { label: '訂單', value: orderCount },
      ],
      orderStatusChart: orderStatusGroups.map((item) => ({
        label: item.status,
        value: item._count.status,
      })),
    };
  }

  async getRevenueTrend() {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label });
  }

  const quotationRows = await this.prisma.quotation.findMany({
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  const orderRows = await this.prisma.order.findMany({
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  const quotationMap = new Map<string, number>();
  const orderMap = new Map<string, number>();

  for (const month of months) {
    quotationMap.set(month.key, 0);
    orderMap.set(month.key, 0);
  }

  for (const row of quotationRows) {
    const d = new Date(row.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (quotationMap.has(key)) {
      quotationMap.set(key, quotationMap.get(key)! + Number(row.totalAmount));
    }
  }

  for (const row of orderRows) {
    const d = new Date(row.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (orderMap.has(key)) {
      orderMap.set(key, orderMap.get(key)! + Number(row.totalAmount));
    }
  }

  const trend = months.map((month) => ({
    month: month.label,
    quotationAmount: quotationMap.get(month.key) ?? 0,
    orderAmount: orderMap.get(month.key) ?? 0,
  }));

  const currentMonth = trend[trend.length - 1];
  const previousMonth = trend[trend.length - 2];

  const quotationGrowthRate = previousMonth
    ? ((currentMonth.quotationAmount - previousMonth.quotationAmount) /
        (previousMonth.quotationAmount || 1)) *
      100
    : 0;

  const orderGrowthRate = previousMonth
    ? ((currentMonth.orderAmount - previousMonth.orderAmount) /
        (previousMonth.orderAmount || 1)) *
      100
    : 0;

  return {
    trend,
    growth: {
      quotationGrowthRate: Number(quotationGrowthRate.toFixed(2)),
      orderGrowthRate: Number(orderGrowthRate.toFixed(2)),
      currentMonth: currentMonth?.month ?? '',
      previousMonth: previousMonth?.month ?? '',
    },
  };
}
}