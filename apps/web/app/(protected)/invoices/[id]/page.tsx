'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Payment = {
  id: string;
  paymentDate: string;
  amount: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
};

type InvoiceDetail = {
  id: string;
  invoiceNo: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: string | null;
  notes: string | null;
  customer: {
    companyName: string;
  };
  order: {
    orderNo: string;
  } | null;
  payments: Payment[];
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

const PAYMENT_METHODS = ['現金', '轉帳', '支票', '信用卡'];

const TERMINAL_STATUSES = ['PAID', 'CANCELLED'];

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [message, setMessage] = useState('載入中...');

  // 新增付款表單
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState('轉帳');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payMessage, setPayMessage] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  // 狀態操作
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function init() {
      const { id } = await params;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || '載入失敗');
          return;
        }

        setInvoice(data.data ?? data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    init();
  }, [params]);

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;

    setPaySubmitting(true);
    setPayMessage('送出中...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setPayMessage('尚未登入');
      setPaySubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      amount: payAmount,
      paymentDate: payDate,
      method: payMethod || undefined,
      reference: payRef.trim() || undefined,
      notes: payNotes.trim() || undefined,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${invoice.id}/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setPayMessage(
          typeof data.message === 'string'
            ? data.message
            : Array.isArray(data.message)
              ? data.message.join(' / ')
              : '新增付款失敗',
        );
        setPaySubmitting(false);
        return;
      }

      setPayMessage('新增成功');
      setPayAmount(0);
      setPayDate('');
      setPayRef('');
      setPayNotes('');
      setPaySubmitting(false);
      window.location.reload();
    } catch {
      setPayMessage('無法連線到 API');
      setPaySubmitting(false);
    }
  }

  async function updateStatus(status: string) {
    if (!invoice) return;
    setStatusMessage('更新中...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setStatusMessage('尚未登入');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${invoice.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(data.message || '更新失敗');
        return;
      }

      setStatusMessage('');
      window.location.reload();
    } catch {
      setStatusMessage('無法連線到 API');
    }
  }

  if (message) {
    return (
      <main className="mx-auto max-w-5xl p-8 text-white">
        <p className="text-gray-400">{message}</p>
      </main>
    );
  }

  if (!invoice) {
    return null;
  }

  const totalNum = Number(invoice.totalAmount);
  const paidNum = Number(invoice.paidAmount);
  const remainingNum = totalNum - paidNum;
  const isTerminal = TERMINAL_STATUSES.includes(invoice.status);

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      {/* 頁頭 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">發票詳情</h1>
          <p className="mt-1 text-gray-400">{invoice.invoiceNo}</p>
        </div>
        <Link
          href="/invoices"
          className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          返回列表
        </Link>
      </div>

      {/* 基本資訊 */}
      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">基本資訊</h2>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="flex gap-2">
            <span className="text-gray-400">發票號：</span>
            <span className="text-gray-100">{invoice.invoiceNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">狀態：</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[invoice.status] ?? 'bg-gray-700 text-gray-300'}`}
            >
              {STATUS_LABEL[invoice.status] ?? invoice.status}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">客戶：</span>
            <span className="text-gray-100">{invoice.customer.companyName}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">訂單號：</span>
            <span className="text-gray-100">
              {invoice.order?.orderNo ?? '-'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">到期日：</span>
            <span className="text-gray-100">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString('zh-TW')
                : '-'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400">備註：</span>
            <span className="text-gray-100">{invoice.notes || '-'}</span>
          </div>
        </div>
      </div>

      {/* 金額區塊 */}
      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">金額</h2>
        <div className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>小計</span>
            <span>{Number(invoice.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>稅額</span>
            <span>{Number(invoice.taxAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-gray-600 pt-2 font-semibold text-white">
            <span>總金額</span>
            <span>{totalNum.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-400">
            <span>已付金額</span>
            <span>{paidNum.toLocaleString()}</span>
          </div>
          <div
            className={`flex justify-between font-semibold ${remainingNum > 0 ? 'text-yellow-400' : 'text-green-400'}`}
          >
            <span>未付金額</span>
            <span>{remainingNum.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 付款記錄 */}
      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">付款記錄</h2>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-gray-400">尚無付款記錄</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full border-collapse text-sm text-white">
              <thead>
                <tr className="bg-gray-700 text-left text-xs uppercase tracking-wide">
                  <th className="border border-gray-600 px-4 py-3">日期</th>
                  <th className="border border-gray-600 px-4 py-3">金額</th>
                  <th className="border border-gray-600 px-4 py-3">付款方式</th>
                  <th className="border border-gray-600 px-4 py-3">參考號</th>
                  <th className="border border-gray-600 px-4 py-3">備註</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-800/60">
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        'zh-TW',
                      )}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {payment.method ?? '-'}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-300">
                      {payment.reference || '-'}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-300">
                      {payment.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新增付款表單（非終態才顯示） */}
      {!isTerminal && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">新增付款</h2>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  金額 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                  value={payAmount}
                  onChange={(e) =>
                    setPayAmount(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  付款日期
                </label>
                <input
                  type="date"
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  付款方式
                </label>
                <select
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="">選擇方式</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  參考號
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="交易號或支票號"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  備註
                </label>
                <textarea
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="選填"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={paySubmitting}
                className="rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                新增付款
              </button>
              {payMessage && (
                <p
                  className={`text-sm ${payMessage.includes('成功') ? 'text-green-400' : 'text-red-400'}`}
                >
                  {payMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 狀態操作 */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">狀態操作</h2>
        <div className="flex flex-wrap gap-3">
          {invoice.status === 'DRAFT' && (
            <button
              type="button"
              onClick={() => updateStatus('ISSUED')}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              開立發票
            </button>
          )}

          {(invoice.status === 'ISSUED' ||
            invoice.status === 'PARTIAL_PAID') && (
            <button
              type="button"
              onClick={() => updateStatus('OVERDUE')}
              className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
            >
              標記逾期
            </button>
          )}

          {!isTerminal && (
            <button
              type="button"
              onClick={() => updateStatus('CANCELLED')}
              className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
            >
              取消發票
            </button>
          )}

          {isTerminal && (
            <p className="text-sm text-gray-400">此發票已結束，無可用操作。</p>
          )}
        </div>

        {statusMessage && (
          <p
            className={`mt-3 text-sm ${statusMessage.includes('中') ? 'text-gray-400' : 'text-red-400'}`}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </main>
  );
}
