'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getCurrentUser,
  hasRole,
  type FrontendUser,
} from '../../../../lib/auth';

type OrderItem = {
  id: string;
  productName: string;
  qty: string;
  unitPrice: string;
  amount: string;
};

type OrderDetail = {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customer: {
    companyName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: OrderItem[];
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [message, setMessage] = useState('載入中...');
  const [user, setUser] = useState<FrontendUser | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      const { id } = await params;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${id}`,
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

        setOrder(data.data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    init();
  }, [params]);

  async function openPdf() {
    const token = localStorage.getItem('accessToken');
    if (!token || !order) {
      alert('尚未登入');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${order.id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        alert(`PDF 載入失敗：${text}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      alert('無法連線到 API');
    }
  }

  async function updateStatus(status: string) {
    const token = localStorage.getItem('accessToken');
    if (!token || !order) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${order.id}/status`,
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
        alert(data.message || '更新失敗');
        return;
      }

      alert('狀態更新成功');
      window.location.reload();
    } catch {
      alert('無法連線到 API');
    }
  }

  if (message) {
    return (
      <main className="mx-auto max-w-5xl p-8 text-white">
        <p>{message}</p>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">訂單詳情</h1>
          <p className="mt-2 text-gray-400">{order.orderNo}</p>
        </div>

        <div className="flex gap-2">
          <Link href="/orders" className="rounded border px-4 py-2">
            返回列表
          </Link>

          <button
            onClick={openPdf}
            className="rounded border border-gray-700 bg-black px-4 py-2 text-white"
            type="button"
          >
            開啟 PDF
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">基本資訊</h2>
        <div className="space-y-2 text-gray-100">
          <p>
            <strong>客戶：</strong>
            {order.customer.companyName}
          </p>
          <p>
            <strong>狀態：</strong>
            {order.status}
          </p>
          <p>
            <strong>建立時間：</strong>
            {new Date(order.createdAt).toLocaleString('zh-TW')}
          </p>
          <p>
            <strong>Email：</strong>
            {order.customer.email || '-'}
          </p>
          <p>
            <strong>電話：</strong>
            {order.customer.phone || '-'}
          </p>
          <p>
            <strong>地址：</strong>
            {order.customer.address || '-'}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">商品明細</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full border-collapse text-white">
            <thead>
              <tr className="bg-gray-700 text-left uppercase text-xs tracking-wide text-white">
                <th className="border border-gray-700 px-4 py-3">商品</th>
                <th className="border border-gray-700 px-4 py-3">數量</th>
                <th className="border border-gray-700 px-4 py-3">單價</th>
                <th className="border border-gray-700 px-4 py-3">金額</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/60">
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {item.productName}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {item.qty}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {item.unitPrice}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto max-w-sm text-right">
          <p className="text-lg">
            <strong>總計：</strong>
            {order.totalAmount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">狀態操作</h2>

        <div className="flex flex-wrap gap-3">
          {hasRole(user, ['ADMIN', 'FINANCE']) ? (
            <>
              {order.status === 'DRAFT' && (
                <>
                  <button
                    onClick={() => updateStatus('CONFIRMED')}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                  >
                    設為 CONFIRMED
                  </button>

                  <button
                    onClick={() => updateStatus('CANCELLED')}
                    className="rounded bg-red-600 px-4 py-2 text-white"
                  >
                    設為 CANCELLED
                  </button>
                </>
              )}

              {order.status === 'CONFIRMED' && (
                <>
                  <button
                    onClick={() => updateStatus('PROCESSING')}
                    className="rounded bg-indigo-600 px-4 py-2 text-white"
                  >
                    設為 PROCESSING
                  </button>

                  <button
                    onClick={() => updateStatus('CANCELLED')}
                    className="rounded bg-red-600 px-4 py-2 text-white"
                  >
                    設為 CANCELLED
                  </button>
                </>
              )}

              {order.status === 'PROCESSING' && (
                <button
                  onClick={() => updateStatus('SHIPPED')}
                  className="rounded bg-purple-600 px-4 py-2 text-white"
                >
                  設為 SHIPPED
                </button>
              )}

              {order.status === 'SHIPPED' && (
                <button
                  onClick={() => updateStatus('COMPLETED')}
                  className="rounded bg-green-600 px-4 py-2 text-white"
                >
                  設為 COMPLETED
                </button>
              )}

              {(order.status === 'COMPLETED' ||
                order.status === 'CANCELLED') && (
                <p className="text-sm text-gray-400">
                  此訂單已結束，無可用操作。
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              你沒有可用的訂單狀態操作權限。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}