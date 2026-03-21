'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ShipmentDetail = {
  id: string;
  shipmentNo: string;
  orderId: string;
  orderNo: string | null;
  customerName: string | null;
  carrier: string | null;
  trackingNo: string | null;
  status: string;
  shippingDate: string | null;
  estimatedArrival: string | null;
  actualArrival: string | null;
  originCountry: string | null;
  destCountry: string | null;
  weight: number | null;
  packageCount: number | null;
  notes: string | null;
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

function formatDate(value: string | null): string {
  if (!value) return '-';
  return value.slice(0, 10);
}

type NextStatus = {
  label: string;
  status: string;
  buttonClass: string;
};

function getNextActions(current: string): NextStatus[] {
  const actions: NextStatus[] = [];

  if (current === 'PREPARING') {
    actions.push({
      label: '已出貨',
      status: 'SHIPPED',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    });
  }

  if (current === 'SHIPPED') {
    actions.push({
      label: '運輸中',
      status: 'IN_TRANSIT',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-700',
    });
  }

  if (current === 'IN_TRANSIT') {
    actions.push({
      label: '清關中',
      status: 'CUSTOMS_CLEARANCE',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
    });
  }

  if (current === 'CUSTOMS_CLEARANCE') {
    actions.push({
      label: '已送達',
      status: 'DELIVERED',
      buttonClass: 'bg-green-600 hover:bg-green-700',
    });
  }

  if (current !== 'DELIVERED' && current !== 'RETURNED') {
    actions.push({
      label: '退回',
      status: 'RETURNED',
      buttonClass: 'bg-red-600 hover:bg-red-700',
    });
  }

  return actions;
}

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [message, setMessage] = useState('載入中...');
  const [actionMessage, setActionMessage] = useState('');

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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/shipments/${id}`,
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

        setShipment(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    init();
  }, [params]);

  async function handleStatusUpdate(nextStatus: string) {
    if (!shipment) return;

    setActionMessage('更新中...');

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setActionMessage('尚未登入');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/shipments/${shipment.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setActionMessage(data.message || '狀態更新失敗');
        return;
      }

      setShipment(data);
      setActionMessage('狀態已更新');
    } catch {
      setActionMessage('無法連線到 API');
    }
  }

  if (message) {
    return (
      <main className="mx-auto max-w-5xl p-8 text-white">
        <p>{message}</p>
      </main>
    );
  }

  if (!shipment) {
    return null;
  }

  const nextActions = getNextActions(shipment.status);

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">出貨單詳情</h1>
          <p className="mt-2 text-gray-400">{shipment.shipmentNo}</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/shipments"
            className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            返回列表
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">基本資訊</h2>
        <div className="grid grid-cols-1 gap-3 text-gray-100 md:grid-cols-2">
          <p>
            <strong>出貨單號：</strong>
            {shipment.shipmentNo}
          </p>
          <p>
            <strong>訂單號：</strong>
            {shipment.orderNo || '-'}
          </p>
          <p>
            <strong>客戶：</strong>
            {shipment.customerName || '-'}
          </p>
          <p>
            <strong>承運商：</strong>
            {shipment.carrier || '-'}
          </p>
          <p>
            <strong>追蹤號：</strong>
            {shipment.trackingNo || '-'}
          </p>
          <p className="flex items-center gap-2">
            <strong>狀態：</strong>
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusBadgeClass(shipment.status)}`}
            >
              {statusLabel(shipment.status)}
            </span>
          </p>
          <p>
            <strong>出貨日期：</strong>
            {formatDate(shipment.shippingDate)}
          </p>
          <p>
            <strong>預計到貨：</strong>
            {formatDate(shipment.estimatedArrival)}
          </p>
          <p>
            <strong>實際到貨：</strong>
            {formatDate(shipment.actualArrival)}
          </p>
          <p>
            <strong>來源國：</strong>
            {shipment.originCountry || '-'}
          </p>
          <p>
            <strong>目的國：</strong>
            {shipment.destCountry || '-'}
          </p>
          <p>
            <strong>重量 (kg)：</strong>
            {shipment.weight !== null ? shipment.weight : '-'}
          </p>
          <p>
            <strong>箱數：</strong>
            {shipment.packageCount !== null ? shipment.packageCount : '-'}
          </p>
          {shipment.notes && (
            <p className="md:col-span-2">
              <strong>備註：</strong>
              {shipment.notes}
            </p>
          )}
        </div>
      </div>

      {nextActions.length > 0 && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">狀態操作</h2>
          <div className="flex flex-wrap items-center gap-3">
            {nextActions.map((action) => (
              <button
                key={action.status}
                type="button"
                onClick={() => handleStatusUpdate(action.status)}
                className={`rounded px-4 py-2 text-white ${action.buttonClass}`}
              >
                {action.label}
              </button>
            ))}
            {actionMessage && (
              <p className="text-sm text-gray-300">{actionMessage}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
