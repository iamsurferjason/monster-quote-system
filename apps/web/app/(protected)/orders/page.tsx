'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Order = {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customer: {
    companyName: string;
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`,
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
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">訂單列表</h1>

        <div className="flex gap-2">
          <Link href="/quotations" className="rounded border px-4 py-2">
            報價列表
          </Link>
          <Link href="/login" className="rounded border px-4 py-2">
            回登入
          </Link>
        </div>
      </div>

      {message && <p>{message}</p>}

      {!message && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full border-collapse">
            <thead>
  <tr className="bg-gray-700 text-white text-left uppercase text-xs tracking-wide">
    <th className="border border-gray-700 px-4 py-3">訂單單號</th>
    <th className="border border-gray-700 px-4 py-3">客戶</th>
    <th className="border border-gray-700 px-4 py-3">狀態</th>
    <th className="border border-gray-700 px-4 py-3">總金額</th>
    <th className="border border-gray-700 px-4 py-3">建立時間</th>
    <th className="border border-gray-700 px-4 py-3">操作</th>
  </tr>
</thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border px-4 py-3">{order.orderNo}</td>
                  <td className="border px-4 py-3">
                    {order.customer.companyName}
                  </td>
                  <td className="border px-4 py-3">{order.status}</td>
                  <td className="border px-4 py-3">{order.totalAmount}</td>
                  <td className="border px-4 py-3">
                    {new Date(order.createdAt).toLocaleString('zh-TW')}
                  </td>
                  <td className="border px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 underline"
                    >
                      查看
                    </Link>
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