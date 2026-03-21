'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type PurchaseOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type PurchaseOrderDetail = {
  id: string;
  poNumber: string;
  supplier: {
    id: string;
    companyName: string;
  };
  currencyCode: string;
  exchangeRate: number;
  incoterm: string | null;
  paymentTerm: string | null;
  deliveryDate: string | null;
  warehouseNote: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: PurchaseOrderItem[];
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

export default function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<PurchaseOrderDetail | null>(null);
  const [message, setMessage] = useState('載入中...');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    async function init() {
      const { id } = await params;
      setOrderId(id);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase-orders/${id}`,
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

        setOrder(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    init();
  }, [params]);

  async function handleStatusUpdate(newStatus: string) {
    if (!order) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('尚未登入');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase-orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || '狀態更新失敗');
        return;
      }

      const updated = await res.json();
      setOrder(updated);
    } catch {
      alert('無法連線到 API');
    }
  }

  async function handleDelete() {
    if (!order) return;

    const confirmed = window.confirm(
      `確定要刪除採購單「${order.poNumber}」嗎？此操作無法復原。`,
    );
    if (!confirmed) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('尚未登入');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase-orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || '刪除失敗');
        return;
      }

      alert('採購單已刪除');
      window.location.href = '/purchase-orders';
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

  const canCancel = !['RECEIVED', 'CANCELLED'].includes(order.status);

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      {/* 頁首 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">採購單詳情</h1>
          <p className="mt-2 text-gray-400">{order.poNumber}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/purchase-orders"
            className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            返回列表
          </Link>

          {/* DRAFT：送出、刪除 */}
          {order.status === 'DRAFT' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusUpdate('SENT')}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                送出採購單
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                刪除
              </button>
            </>
          )}

          {/* SENT：確認 */}
          {order.status === 'SENT' && (
            <button
              type="button"
              onClick={() => handleStatusUpdate('CONFIRMED')}
              className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            >
              確認
            </button>
          )}

          {/* CONFIRMED：部分收貨、完整收貨 */}
          {order.status === 'CONFIRMED' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusUpdate('PARTIAL_RECEIVED')}
                className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                部分收貨
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate('RECEIVED')}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                完整收貨
              </button>
            </>
          )}

          {/* PARTIAL_RECEIVED：完整收貨 */}
          {order.status === 'PARTIAL_RECEIVED' && (
            <button
              type="button"
              onClick={() => handleStatusUpdate('RECEIVED')}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              完整收貨
            </button>
          )}

          {/* 任何非 RECEIVED/CANCELLED 狀態：取消 */}
          {canCancel && (
            <button
              type="button"
              onClick={() => handleStatusUpdate('CANCELLED')}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              取消
            </button>
          )}
        </div>
      </div>

      {/* 基本資訊 */}
      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">基本資訊</h2>
          <span
            className={`rounded px-3 py-1 text-sm font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-700 text-gray-100'}`}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-gray-100 md:grid-cols-2">
          <p>
            <strong>PO號：</strong>
            {order.poNumber}
          </p>
          <p>
            <strong>供應商：</strong>
            {order.supplier?.companyName || '-'}
          </p>
          <p>
            <strong>幣別：</strong>
            {order.currencyCode}
          </p>
          <p>
            <strong>匯率：</strong>
            {order.exchangeRate}
          </p>
          <p>
            <strong>Incoterm：</strong>
            {order.incoterm || '-'}
          </p>
          <p>
            <strong>付款條件：</strong>
            {order.paymentTerm || '-'}
          </p>
          <p>
            <strong>預計交貨日：</strong>
            {order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleDateString('zh-TW')
              : '-'}
          </p>
          <p>
            <strong>建立時間：</strong>
            {new Date(order.createdAt).toLocaleString('zh-TW')}
          </p>
          {order.warehouseNote && (
            <p className="md:col-span-2">
              <strong>倉庫備註：</strong>
              {order.warehouseNote}
            </p>
          )}
        </div>
      </div>

      {/* 明細表格 */}
      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">採購明細</h2>

        {order.items.length === 0 ? (
          <p className="text-sm text-gray-400">尚無明細資料</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full border-collapse text-sm text-white">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="border border-gray-700 px-4 py-3">項目名稱</th>
                  <th className="border border-gray-700 px-4 py-3">數量</th>
                  <th className="border border-gray-700 px-4 py-3">單價</th>
                  <th className="border border-gray-700 px-4 py-3">小計</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/60">
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {item.productName}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 合計區塊 */}
        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>小計</span>
              <span>{(order.subtotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>稅額</span>
              <span>{(order.taxAmount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-600 pt-2 font-semibold text-white">
              <span>總金額</span>
              <span>{(order.totalAmount ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
