'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Customer = {
  id: string;
  companyName: string;
};

type Order = {
  id: string;
  orderNo: string;
};

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [autoTax, setAutoTax] = useState(false);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = subtotal + taxAmount;

  useEffect(() => {
    async function fetchDropdowns() {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const [customersRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (customersRes.ok) {
          const data = await customersRes.json();
          setCustomers(data);
        }
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data);
        }
      } catch {
        // ignore fetch errors for dropdowns
      }
    }

    fetchDropdowns();
  }, []);

  // 自動計算稅額
  useEffect(() => {
    if (autoTax) {
      setTaxAmount(Math.round(subtotal * 0.05 * 100) / 100);
    }
  }, [autoTax, subtotal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId) {
      setMessage('請選擇客戶');
      return;
    }

    setSubmitting(true);
    setMessage('送出中...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage('尚未登入');
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      customerId,
      subtotal,
      taxAmount,
      totalAmount,
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
    };

    if (orderId) {
      payload.orderId = orderId;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`,
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
        setMessage(
          typeof data.message === 'string'
            ? data.message
            : Array.isArray(data.message)
              ? data.message.join(' / ')
              : '建立失敗',
        );
        setSubmitting(false);
        return;
      }

      setMessage('建立成功，正在跳轉...');
      window.location.href = '/invoices';
    } catch {
      setMessage('無法連線到 API');
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">新增發票</h1>
        <Link
          href="/invoices"
          className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          返回列表
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">基本資料</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 客戶 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                客戶 <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">請選擇客戶</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* 關聯訂單 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                關聯訂單（選填）
              </label>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              >
                <option value="">不關聯訂單</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNo}
                  </option>
                ))}
              </select>
            </div>

            {/* 到期日 */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                到期日
              </label>
              <input
                type="date"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 金額區塊 */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">金額</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 小計 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                小計
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={subtotal}
                onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* 稅額 */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  稅額
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-400">
                  <input
                    type="checkbox"
                    checked={autoTax}
                    onChange={(e) => setAutoTax(e.target.checked)}
                    className="rounded"
                  />
                  自動計算 5%
                </label>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white ${autoTax ? 'cursor-not-allowed opacity-60' : ''}`}
                value={taxAmount}
                onChange={(e) =>
                  !autoTax && setTaxAmount(parseFloat(e.target.value) || 0)
                }
                readOnly={autoTax}
              />
            </div>

            {/* 總金額（唯讀） */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                總金額（自動計算）
              </label>
              <div className="w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-lg font-semibold text-white">
                {totalAmount.toLocaleString('zh-TW', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 備註 */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">備註</h2>
          <textarea
            className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="請輸入備註（選填）"
          />
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            建立發票
          </button>
          <Link
            href="/invoices"
            className="rounded border border-gray-700 px-6 py-3 text-white hover:bg-gray-800"
          >
            取消
          </Link>
          {message && (
            <p
              className={`text-sm ${message.includes('成功') ? 'text-green-400' : 'text-red-400'}`}
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
