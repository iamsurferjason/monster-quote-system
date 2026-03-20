'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type ItemForm = {
  productId: string;
  productName: string;
  qty: string;
  unitPrice: string;
  discountRate: string;
};

type Customer = {
  id: string;
  customerCode: string;
  companyName: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  brand?: string | null;
  spec?: string | null;
  unit: string;
  listPrice: string | number;
};

export default function NewQuotationPage() {
  const [tradeMode, setTradeMode] = useState('DOMESTIC');
  const [currencyCode, setCurrencyCode] = useState('TWD');
  const [exchangeRate, setExchangeRate] = useState('1');
  const [incoterm, setIncoterm] = useState('FOB');
  const [shipFromCountry, setShipFromCountry] = useState('TW');
  const [shipToCountry, setShipToCountry] = useState('TW');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [createdById, setCreatedById] = useState('');
  const [items, setItems] = useState<ItemForm[]>([
    {
      productId: '',
      productName: '',
      qty: '1',
      unitPrice: '0',
      discountRate: '0',
    },
  ]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/customers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || '客戶載入失敗');
          return;
        }

        setCustomers(data);
      } catch {
        setMessage('無法連線到 API');
      }
    }

    async function fetchProducts() {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || '商品載入失敗');
          return;
        }

        setProducts(data);
      } catch {
        setMessage('無法連線到 API');
      }
    }

    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0].id);
    }
  }, [customers, customerId]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.qty || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const discountRate = Number(item.discountRate || 0);
      const amount = qty * unitPrice * (1 - discountRate / 100);
      return sum + amount;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => subtotal * 0.05, [subtotal]);
  const totalAmount = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        qty: '1',
        unitPrice: '0',
        discountRate: '0',
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem<K extends keyof ItemForm>(
    index: number,
    field: K,
    value: ItemForm[K],
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('送出中...');

    const token = localStorage.getItem('accessToken');
    const currentUserRaw = localStorage.getItem('currentUser');

    if (!token || !currentUserRaw) {
      setMessage('尚未登入');
      return;
    }

    if (!customerId) {
      setMessage('請選擇客戶');
      return;
    }

    const hasEmptyProduct = items.some((item) => !item.productName.trim());
    if (hasEmptyProduct) {
      setMessage('請選擇商品');
      return;
    }

    const currentUser = JSON.parse(currentUserRaw) as { id: string };

    const payload = {
      tradeMode,
      currencyCode,
      exchangeRate: Number(exchangeRate || 1),
      incoterm,
      shipFromCountry,
      shipToCountry,
      paymentTerm,
      customerId,
      createdById: createdById || currentUser.id,
      items: items.map((item) => ({
        productId: item.productId || null,
        productName: item.productName,
        qty: Number(item.qty || 0),
        unitPrice: Number(item.unitPrice || 0),
        discountRate: Number(item.discountRate || 0),
      })),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/quotations`,
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
      window.location.href = `/quotations/${data.data.id}`;
    } catch {
      setMessage('無法連線到 API');
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">新增報價單</h1>

        <div className="flex gap-2">
          <Link href="/quotations" className="rounded border px-4 py-2">
            返回報價列表
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">基本資料</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">客戶</label>
              <select
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">請選擇客戶</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName} ({customer.customerCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Created By ID
              </label>
              <input
                className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
                value={createdById}
                onChange={(e) => setCreatedById(e.target.value)}
                placeholder="留空則使用目前登入者"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">商品明細</h2>

            <button
              type="button"
              onClick={addItem}
              className="rounded bg-black px-4 py-2 text-white border border-gray-700"
            >
              新增一列商品
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const qty = Number(item.qty || 0);
              const unitPrice = Number(item.unitPrice || 0);
              const discountRate = Number(item.discountRate || 0);
              const lineAmount = qty * unitPrice * (1 - discountRate / 100);

              return (
                <div key={index} className="rounded-lg border border-gray-700 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">商品 #{index + 1}</h3>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded bg-red-600 px-3 py-1 text-white"
                      >
                        刪除
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="md:col-span-4">
                      <label className="mb-1 block text-sm font-medium">商品</label>
                      <select
                        className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
                        value={item.productId}
                        onChange={(e) => {
                          const productId = e.target.value;
                          const product = products.find((p) => p.id === productId);

                          updateItem(index, 'productId', productId);
                          updateItem(index, 'productName', product?.name || '');
                          updateItem(
                            index,
                            'unitPrice',
                            product ? String(product.listPrice) : '0',
                          );
                        }}
                      >
                        <option value="">請選擇商品</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        商品名稱
                      </label>
                      <input
                        className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                        value={item.productName}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">數量</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">單價</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, 'unitPrice', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">折扣 %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
                        value={item.discountRate}
                        onChange={(e) =>
                          updateItem(index, 'discountRate', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">小計</label>
                      <div className="rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white">
                        {lineAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">金額摘要</h2>

          <div className="ml-auto max-w-sm space-y-2 text-right">
            <p>
              <strong>小計：</strong>
              {subtotal.toFixed(2)}
            </p>
            <p>
              <strong>稅額：</strong>
              {taxAmount.toFixed(2)}
            </p>
            <p className="text-lg">
              <strong>總計：</strong>
              {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded bg-green-600 px-6 py-3 text-white"
          >
            建立報價單
          </button>

          {message && <p>{message}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
  <div>
    <label className="mb-1 block text-sm font-medium">貿易模式</label>
    <select
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={tradeMode}
      onChange={(e) => setTradeMode(e.target.value)}
    >
      <option value="DOMESTIC">DOMESTIC</option>
      <option value="IMPORT">IMPORT</option>
      <option value="EXPORT">EXPORT</option>
      <option value="TRIANGULAR">TRIANGULAR</option>
    </select>
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">幣別</label>
    <select
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={currencyCode}
      onChange={(e) => setCurrencyCode(e.target.value)}
    >
      <option value="TWD">TWD</option>
      <option value="USD">USD</option>
      <option value="JPY">JPY</option>
      <option value="EUR">EUR</option>
      <option value="CNY">CNY</option>
    </select>
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">匯率</label>
    <input
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={exchangeRate}
      onChange={(e) => setExchangeRate(e.target.value)}
      placeholder="1"
    />
  </div>
</div>

<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
  <div>
    <label className="mb-1 block text-sm font-medium">Incoterm</label>
    <select
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={incoterm}
      onChange={(e) => setIncoterm(e.target.value)}
    >
      <option value="EXW">EXW</option>
      <option value="FOB">FOB</option>
      <option value="CFR">CFR</option>
      <option value="CIF">CIF</option>
      <option value="FCA">FCA</option>
      <option value="CPT">CPT</option>
      <option value="CIP">CIP</option>
      <option value="DAP">DAP</option>
      <option value="DDP">DDP</option>
    </select>
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">出貨國</label>
    <input
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={shipFromCountry}
      onChange={(e) => setShipFromCountry(e.target.value.toUpperCase())}
      placeholder="TW / CN / JP"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">到貨國</label>
    <input
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={shipToCountry}
      onChange={(e) => setShipToCountry(e.target.value.toUpperCase())}
      placeholder="JP / TW / US"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium">付款條件</label>
    <input
      className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-white"
      value={paymentTerm}
      onChange={(e) => setPaymentTerm(e.target.value)}
      placeholder="TT 30 days"
    />
  </div>
</div>
      </form>
    </main>
  );
}