'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DashboardSummary = {
  quotationCount: number;
  orderCount: number;
  pendingApprovalCount: number;
  completedOrderCount: number;
  purchaseOrderCount: number;
  draftPOCount: number;
  shipmentCount: number;
  inTransitCount: number;
  deliveredCount: number;
  overdueInvoiceCount: number;
  pendingInvoiceAmount: number;
  paidInvoiceAmount: number;
};

type ChartItem = {
  label: string;
  value: number;
};

type DashboardCharts = {
  totalsChart: ChartItem[];
  orderStatusChart: ChartItem[];
};

type RevenueTrendItem = {
  month: string;
  quotationAmount: number;
  orderAmount: number;
};

type RevenueTrendResponse = {
  trend: RevenueTrendItem[];
  growth: {
    quotationGrowthRate: number;
    orderGrowthRate: number;
    currentMonth: string;
    previousMonth: string;
  };
};
const pieColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [growth, setGrowth] = useState<RevenueTrendResponse['growth'] | null>(null);
  const [message, setMessage] = useState('載入中...');

  useEffect(() => {
    async function fetchDashboard() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const [summaryRes, chartsRes, trendRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/summary`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/charts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/revenue-trend`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ]);

        const summaryData = await summaryRes.json();
        const chartsData = await chartsRes.json();
        const trendData = await trendRes.json();

        if (!summaryRes.ok) {
          setMessage(summaryData.message || '摘要載入失敗');
          return;
        }

        if (!chartsRes.ok) {
          setMessage(chartsData.message || '圖表載入失敗');
          return;
        }

        if (!trendRes.ok) {
          setMessage(trendData.message || '趨勢圖載入失敗');
          return;
        }

        setSummary(summaryData);
        setCharts(chartsData);
        setRevenueTrend(trendData.trend);
        setGrowth(trendData.growth);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    fetchDashboard();
  }, []);

  if (message) {
    return (
      <main className="mx-auto max-w-6xl p-8 text-white">
        <p>{message}</p>
      </main>
    );
  }

  if (!summary || !charts || !growth) return null;

  return (
    <main className="mx-auto max-w-6xl p-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-400">系統總覽</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">報價總數</p>
          <p className="mt-3 text-3xl font-bold">{summary.quotationCount}</p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">訂單總數</p>
          <p className="mt-3 text-3xl font-bold">{summary.orderCount}</p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">待審核報價數</p>
          <p className="mt-3 text-3xl font-bold">
            {summary.pendingApprovalCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">已完成訂單數</p>
          <p className="mt-3 text-3xl font-bold">
            {summary.completedOrderCount}
          </p>
        </div>
      </div>

      {/* Phase 3: 採購 */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-300">採購</h2>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">採購單總數</p>
          <p className="mt-3 text-3xl font-bold text-purple-400">
            {summary.purchaseOrderCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">草稿待處理</p>
          <p className="mt-3 text-3xl font-bold text-orange-400">
            {summary.draftPOCount}
          </p>
        </div>
      </div>

      {/* Phase 4: 出貨追蹤 */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-300">出貨追蹤</h2>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">出貨單總數</p>
          <p className="mt-3 text-3xl font-bold text-blue-400">
            {summary.shipmentCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">運輸中</p>
          <p className="mt-3 text-3xl font-bold text-indigo-400">
            {summary.inTransitCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">已送達</p>
          <p className="mt-3 text-3xl font-bold text-green-400">
            {summary.deliveredCount}
          </p>
        </div>
      </div>

      {/* Phase 5: 財務對帳 */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-300">財務對帳</h2>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">逾期發票數</p>
          <p className="mt-3 text-3xl font-bold text-red-400">
            {summary.overdueInvoiceCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">待收款金額</p>
          <p className="mt-3 text-3xl font-bold text-yellow-400">
            {summary.pendingInvoiceAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <p className="text-sm text-gray-400">已收款金額</p>
          <p className="mt-3 text-3xl font-bold text-green-400">
            {summary.paidInvoiceAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
  <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
    <p className="text-sm text-gray-400">
      報價月成長率 ({growth.previousMonth} → {growth.currentMonth})
    </p>
    <p
      className={`mt-3 text-3xl font-bold ${
        growth.quotationGrowthRate >= 0 ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {growth.quotationGrowthRate >= 0 ? '▲' : '▼'}{' '}
      {Math.abs(growth.quotationGrowthRate)}%
    </p>
  </div>

  <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
    <p className="text-sm text-gray-400">
      訂單月成長率 ({growth.previousMonth} → {growth.currentMonth})
    </p>
    <p
      className={`mt-3 text-3xl font-bold ${
        growth.orderGrowthRate >= 0 ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {growth.orderGrowthRate >= 0 ? '▲' : '▼'}{' '}
      {Math.abs(growth.orderGrowthRate)}%
    </p>
  </div>
</div>
      <div className="mb-8 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">近 6 個月營業額趨勢</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#d1d5db" />
              <YAxis stroke="#d1d5db" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  color: '#ffffff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="quotationAmount"
                name="報價總額"
                stroke="#60a5fa"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="orderAmount"
                name="訂單總額"
                stroke="#34d399"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">報價 / 訂單統計</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.totalsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    color: '#ffffff',
                  }}
                />
                <Bar dataKey="value">
                  {charts.totalsChart.map((entry, index) => (
                    <Cell
                      key={`bar-${entry.label}-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">訂單狀態分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.orderStatusChart}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {charts.orderStatusChart.map((entry, index) => (
                    <Cell
                      key={`pie-${entry.label}-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}