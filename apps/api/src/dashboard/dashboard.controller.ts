import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @UseGuards(JwtAuthGuard)
  @Get('charts')
  getCharts() {
    return this.dashboardService.getCharts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue-trend')
  getRevenueTrend() {
    return this.dashboardService.getRevenueTrend();
  }
}