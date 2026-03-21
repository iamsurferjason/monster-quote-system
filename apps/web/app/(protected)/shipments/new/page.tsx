'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type OrderOption = {
  id: string;
  orderNo: string;
  customerName: string | null;
};

export default function NewShipmentPage() {
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [orderId, setOrderId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [weight, setWeight] = useState('');
  const [packageCount, setPackageCount] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        setOrders(data);
      } catch {
        // ignore fetch error for dropdown
      }
    }

    fetchOrders();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('送出中...');

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setMessage('尚未登入');
      return;
    }

    if (!orderId) {
      setMessage('請選擇訂單');
      return;
    }

    const payload: Record<string, unknown> = {
      orderId,
      carrier: carrier.trim() || undefined,
      trackingNo: trackingNo.trim() || undefined,
      shippingDate: shippingDate || undefined,
      estimatedArrival: estimatedArrival || undefined,
      originCountry: originCountry.trim() || undefined,
      destCountry: destCountry.trim() || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      packageCount: packageCount ? parseInt(packageCount, 10) : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/shipments`,
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
        return;
      }

      setMessage('建立成功，正在跳轉...');
      window.location.href = '/shipments';
    } catch {
      setMessage('無法連線到 API');
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">新增出貨單</h1>
        <Link
          href="/shipments"
          className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          取消
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">出貨資訊</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                訂單 <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              >
                <option value="">請選擇訂單</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNo}
                    {order.customerName ? ` — ${order.customerName}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                承運商
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="例如：DHL、FedEx"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                追蹤號
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="請輸入追蹤號"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                出貨日期
              </label>
              <input
                type="date"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                預計到貨
              </label>
              <input
                type="date"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                來源國（2 碼）
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value.toUpperCase())}
                placeholder="例如：TW"
                maxLength={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                目的國（2 碼）
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={destCountry}
                onChange={(e) => setDestCountry(e.target.value.toUpperCase())}
                placeholder="例如：US"
                maxLength={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                重量 (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="請輸入重量"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                箱數
              </label>
              <input
                type="number"
                step="1"
                min="0"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={packageCount}
                onChange={(e) => setPackageCount(e.target.value)}
                placeholder="請輸入箱數"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                備註
              </label>
              <textarea
                rows={3}
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="請輸入備註"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            建立出貨單
          </button>

          <Link
            href="/shipments"
            className="rounded border border-gray-700 px-6 py-3 text-white hover:bg-gray-800"
          >
            取消
          </Link>

          {message && <p>{message}</p>}
        </div>
      </form>
    </main>
  );
}
