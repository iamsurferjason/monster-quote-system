'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Shipment = {
  id: string;
  shipmentNo: string;
  orderId: string;
  orderNo: string | null;
  customerName: string | null;
  carrier: string | null;
  trackingNo: string | null;
  status: string;
  shippingDate: string | null;
};

type StatusBadgeProps = {
  status: string;
};

function statusLabel(status: string): string {
  switch (status) {
    case 'PREPARING':
      return '備貨中';
    case 'SHIPPED':
      return '已出貨';
    case 'IN_TRANSIT':
      return '運輸中';
    case 'CUSTOMS_CLEARANCE':
      return '清關中';
    case 'DELIVERED':
      return '已送達';
    case 'RETURNED':
      return '已退回';
    default:
      return status;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'PREPARING':
      return 'bg-gray-700 text-gray-200';
    case 'SHIPPED':
      return 'bg-blue-700 text-blue-100';
    case 'IN_TRANSIT':
      return 'bg-indigo-700 text-indigo-100';
    case 'CUSTOMS_CLEARANCE':
      return 'bg-yellow-700 text-yellow-100';
    case 'DELIVERED':
      return 'bg-green-700 text-green-100';
    case 'RETURNED':
      return 'bg-red-700 text-red-100';
    default:
      return 'bg-gray-700 text-gray-200';
  }
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusBadgeClass(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [message, setMessage] = useState('載入中...');

  useEffect(() => {
    async function fetchShipments() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/shipments`,
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

        setShipments(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    fetchShipments();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">出貨追蹤</h1>
        <Link
          href="/shipments/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新增出貨
        </Link>
      </div>

      {message && <p>{message}</p>}

      {!message && shipments.length === 0 && (
        <p className="text-gray-400">尚無出貨資料</p>
      )}

      {!message && shipments.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900">
          <table className="min-w-full border-collapse text-sm text-white">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="border border-gray-700 px-4 py-3">出貨單號</th>
                <th className="border border-gray-700 px-4 py-3">訂單號</th>
                <th className="border border-gray-700 px-4 py-3">客戶</th>
                <th className="border border-gray-700 px-4 py-3">承運商</th>
                <th className="border border-gray-700 px-4 py-3">追蹤號</th>
                <th className="border border-gray-700 px-4 py-3">狀態</th>
                <th className="border border-gray-700 px-4 py-3">出貨日期</th>
                <th className="border border-gray-700 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-800/60">
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {shipment.shipmentNo}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {shipment.orderNo || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {shipment.customerName || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {shipment.carrier || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {shipment.trackingNo || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {shipment.shippingDate
                      ? shipment.shippingDate.slice(0, 10)
                      : '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3">
                    <Link
                      href={`/shipments/${shipment.id}`}
                      className="text-blue-400 underline"
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
