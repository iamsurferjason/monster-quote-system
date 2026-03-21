'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Supplier = {
  id: string;
  companyName: string;
};

type ItemRow = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

const CURRENCY_OPTIONS = ['TWD', 'USD', 'JPY', 'EUR', 'CNY'];
const INCOTERM_OPTIONS = [
  'EXW',
  'FOB',
  'CFR',
  'CIF',
  'FCA',
  'CPT',
  'CIP',
  'DAP',
  'DDP',
];

const TAX_RATE = 0.05;

function calcSubtotal(item: ItemRow): number {
  return item.quantity * item.unitPrice;
}

export default function NewPurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [currencyCode, setCurrencyCode] = useState('TWD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [incoterm, setIncoterm] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [warehouseNote, setWarehouseNote] = useState('');
  const [items, setItems] = useState<ItemRow[]>([
    { productName: '', quantity: 0, unitPrice: 0 },
  ]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSuppliers() {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setSuppliers(data);
          if (data.length > 0) setSupplierId(data[0].id);
        }
      } catch {
        // ignore supplier fetch error
      }
    }

    fetchSuppliers();
  }, []);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { productName: '', quantity: 0, unitPrice: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem<K extends keyof ItemRow>(
    index: number,
    field: K,
    value: ItemRow[K],
  ) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  const itemsSubtotal = items.reduce((sum, item) => sum + calcSubtotal(item), 0);
  const taxAmount = itemsSubtotal * TAX_RATE;
  const totalAmount = itemsSubtotal + taxAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('送出中...');

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setMessage('尚未登入');
      return;
    }

    if (!supplierId) {
      setMessage('請選擇供應商');
      return;
    }

    const payload = {
      supplierId,
      currencyCode,
      exchangeRate,
      incoterm: incoterm || undefined,
      paymentTerm: paymentTerm.trim() || undefined,
      deliveryDate: deliveryDate || undefined,
      warehouseNote: warehouseNote.trim() || undefined,
      items: items.map((item) => ({
        productName: item.productName.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase-orders`,
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
      window.location.href = '/purchase-orders';
    } catch {
      setMessage('無法連線到 API');
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">新增採購單</h1>
        <Link
          href="/purchase-orders"
          className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          返回採購單列表
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資料 */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">基本資料</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                供應商 <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
              >
                <option value="">請選擇供應商</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                幣別 <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                匯率 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Incoterm
              </label>
              <select
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
              >
                <option value="">不指定</option>
                {INCOTERM_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                付款條件
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={paymentTerm}
                onChange={(e) => setPaymentTerm(e.target.value)}
                placeholder="例如：月結 30 天"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                預計交貨日
              </label>
              <input
                type="date"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                倉庫備註
              </label>
              <textarea
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                rows={3}
                value={warehouseNote}
                onChange={(e) => setWarehouseNote(e.target.value)}
                placeholder="請輸入倉庫備註"
              />
            </div>
          </div>
        </div>

        {/* 採購明細 */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">採購明細</h2>
            <button
              type="button"
              onClick={addItem}
              className="rounded border border-gray-700 bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              新增明細
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full border-collapse text-sm text-white">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="border border-gray-700 px-3 py-2">產品名稱</th>
                  <th className="border border-gray-700 px-3 py-2 w-28">數量</th>
                  <th className="border border-gray-700 px-3 py-2 w-36">單價</th>
                  <th className="border border-gray-700 px-3 py-2 w-36">小計</th>
                  <th className="border border-gray-700 px-3 py-2 w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="text"
                        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white"
                        value={item.productName}
                        onChange={(e) =>
                          updateItem(index, 'productName', e.target.value)
                        }
                        placeholder="請輸入產品名稱"
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            'quantity',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-700 px-3 py-2 text-gray-100">
                      {calcSubtotal(item).toLocaleString()}
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 合計區塊 */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>小計</span>
                <span>{itemsSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>稅額（5%）</span>
                <span>{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-2 font-semibold text-white">
                <span>總金額</span>
                <span>{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 送出 */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            建立採購單
          </button>
          <Link
            href="/purchase-orders"
            className="rounded border border-gray-700 px-6 py-3 text-white hover:bg-gray-800"
          >
            取消
          </Link>
          {message && <p className="text-sm text-gray-300">{message}</p>}
        </div>
      </form>
    </main>
  );
}
