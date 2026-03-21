'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Invoice = {
  id: string;
  invoiceNo: string;
  status: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: string | null;
  customer: {
    companyName: string;
  };
  order: {
    orderNo: string;
  } | null;
};

type InvoiceStats = {
  totalIssued: { count: number; amount: number };
  totalPaid: { count: number; amount: number };
  totalOverdue: { count: number; amount: number };
  pendingAmount: number;
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-600 text-gray-200',
  ISSUED: 'bg-blue-600 text-blue-100',
  PARTIAL_PAID: 'bg-yellow-600 text-yellow-100',
  PAID: 'bg-green-600 text-green-100',
  OVERDUE: 'bg-red-600 text-red-100',
  CANCELLED: 'bg-gray-800 text-gray-400',
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  ISSUED: '已開立',
  PARTIAL_PAID: '部分付款',
  PAID: '已付清',
  OVERDUE: '逾期',
  CANCELLED: '已取消',
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-900 p-5`}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>
        {value.toLocaleString('zh-TW', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        setLoading(false);
        return;
      }

      try {
        const [invoicesRes, statsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const invoicesData = await invoicesRes.json();
        if (!invoicesRes.ok) {
          setMessage(invoicesData.message || '載入失敗');
          setLoading(false);
          return;
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        setInvoices(invoicesData);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8 text-white">
      {/* 頁頭 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">發票列表</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新增發票
        </Link>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="已開立總額"
            value={stats.totalIssued.amount}
            color="text-white"
          />
          <StatCard
            label="已收款"
            value={stats.totalPaid.amount}
            color="text-green-400"
          />
          <StatCard
            label="逾期"
            value={stats.totalOverdue.amount}
            color="text-red-400"
          />
          <StatCard
            label="待收款"
            value={stats.pendingAmount}
            color="text-yellow-400"
          />
        </div>
      )}

      {/* 狀態訊息 */}
      {loading && (
        <p className="text-gray-400">載入中...</p>
      )}
      {!loading && message && (
        <p className="text-red-400">{message}</p>
      )}

      {/* 空資料 */}
      {!loading && !message && invoices.length === 0 && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-12 text-center">
          <p className="text-gray-400">尚無發票資料</p>
          <Link
            href="/invoices/new"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            建立第一張發票
          </Link>
        </div>
      )}

      {/* 表格 */}
      {!loading && !message && invoices.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-700 text-left text-xs uppercase tracking-wide text-white">
                <th className="border border-gray-600 px-4 py-3">發票號</th>
                <th className="border border-gray-600 px-4 py-3">客戶</th>
                <th className="border border-gray-600 px-4 py-3">訂單號</th>
                <th className="border border-gray-600 px-4 py-3">總金額</th>
                <th className="border border-gray-600 px-4 py-3">已付金額</th>
                <th className="border border-gray-600 px-4 py-3">狀態</th>
                <th className="border border-gray-600 px-4 py-3">到期日</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="cursor-pointer hover:bg-gray-800/60"
                >
                  <td className="border border-gray-700 px-4 py-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {invoice.invoiceNo}
                    </Link>
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {invoice.customer.companyName}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-300">
                    {invoice.order?.orderNo ?? '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {Number(invoice.totalAmount).toLocaleString()}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {Number(invoice.paidAmount).toLocaleString()}
                  </td>
                  <td className="border border-gray-700 px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[invoice.status] ?? 'bg-gray-700 text-gray-300'}`}
                    >
                      {STATUS_LABEL[invoice.status] ?? invoice.status}
                    </span>
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-300">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString('zh-TW')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
