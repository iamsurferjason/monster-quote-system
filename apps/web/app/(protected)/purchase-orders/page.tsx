'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplier: {
    companyName: string;
  };
  currencyCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-600 text-gray-100',
  SENT: 'bg-blue-600 text-blue-100',
  CONFIRMED: 'bg-yellow-600 text-yellow-100',
  PARTIAL_RECEIVED: 'bg-orange-600 text-orange-100',
  RECEIVED: 'bg-green-600 text-green-100',
  CANCELLED: 'bg-red-600 text-red-100',
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  SENT: '已送出',
  CONFIRMED: '已確認',
  PARTIAL_RECEIVED: '部分收貨',
  RECEIVED: '已收貨',
  CANCELLED: '已取消',
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [message, setMessage] = useState('載入中...');

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || '載入失敗');
          return;
        }

        setOrders(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    fetchOrders();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">採購單列表</h1>
        <Link
          href="/purchase-orders/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新增採購單
        </Link>
      </div>

      {message && <p>{message}</p>}

      {!message && orders.length === 0 && (
        <p className="text-gray-400">尚無採購單資料</p>
      )}

      {!message && orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900">
          <table className="min-w-full border-collapse text-sm text-white">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="border border-gray-700 px-4 py-3">PO號</th>
                <th className="border border-gray-700 px-4 py-3">供應商名稱</th>
                <th className="border border-gray-700 px-4 py-3">幣別</th>
                <th className="border border-gray-700 px-4 py-3">總金額</th>
                <th className="border border-gray-700 px-4 py-3">狀態</th>
                <th className="border border-gray-700 px-4 py-3">建立時間</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer hover:bg-gray-800/60"
                  onClick={() => {
                    window.location.href = `/purchase-orders/${order.id}`;
                  }}
                >
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {order.poNumber}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {order.supplier?.companyName || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {order.currencyCode}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {order.totalAmount != null
                      ? order.totalAmount.toLocaleString()
                      : '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-700 text-gray-100'}`}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {new Date(order.createdAt).toLocaleString('zh-TW')}
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
