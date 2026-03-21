'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Contact = {
  id: string;
  supplierId: string;
  name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
};

type SupplierDetail = {
  id: string;
  supplierCode: string;
  companyName: string;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  bankName: string | null;
  bankCode: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
  paymentTerms: string | null;
  status: string;
  contacts: Contact[];
};

export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [message, setMessage] = useState('載入中...');

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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${id}`,
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

        setSupplier(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    init();
  }, [params]);

  async function handleDeactivate() {
    if (!supplier) return;

    const confirmed = window.confirm(
      `確定要停用供應商「${supplier.companyName}」嗎？此操作將把狀態設為 INACTIVE。`,
    );

    if (!confirmed) return;

    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('尚未登入');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers/${supplier.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || '停用失敗');
        return;
      }

      alert('已成功停用供應商');
      window.location.href = '/suppliers';
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

  if (!supplier) {
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">供應商詳情</h1>
          <p className="mt-2 text-gray-400">{supplier.supplierCode}</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/suppliers"
            className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800"
          >
            返回列表
          </Link>

          {supplier.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={handleDeactivate}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              停用
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">基本資訊</h2>
        <div className="grid grid-cols-1 gap-2 text-gray-100 md:grid-cols-2">
          <p>
            <strong>供應商代碼：</strong>
            {supplier.supplierCode}
          </p>
          <p>
            <strong>公司名稱：</strong>
            {supplier.companyName}
          </p>
          <p>
            <strong>統一編號：</strong>
            {supplier.taxId || '-'}
          </p>
          <p>
            <strong>電話：</strong>
            {supplier.phone || '-'}
          </p>
          <p>
            <strong>Email：</strong>
            {supplier.email || '-'}
          </p>
          <p>
            <strong>狀態：</strong>
            {supplier.status}
          </p>
          <p className="md:col-span-2">
            <strong>地址：</strong>
            {supplier.address || '-'}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">銀行資料</h2>
        <div className="grid grid-cols-1 gap-2 text-gray-100 md:grid-cols-2">
          <p>
            <strong>銀行名稱：</strong>
            {supplier.bankName || '-'}
          </p>
          <p>
            <strong>銀行代碼：</strong>
            {supplier.bankCode || '-'}
          </p>
          <p>
            <strong>銀行帳號：</strong>
            {supplier.bankAccount || '-'}
          </p>
          <p>
            <strong>戶名：</strong>
            {supplier.bankAccountName || '-'}
          </p>
          <p className="md:col-span-2">
            <strong>付款條件：</strong>
            {supplier.paymentTerms || '-'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">聯絡人</h2>

        {supplier.contacts.length === 0 ? (
          <p className="text-gray-400 text-sm">尚無聯絡人資料</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full border-collapse text-sm text-white">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="border border-gray-700 px-4 py-3">姓名</th>
                  <th className="border border-gray-700 px-4 py-3">職稱</th>
                  <th className="border border-gray-700 px-4 py-3">電話</th>
                  <th className="border border-gray-700 px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {supplier.contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-800/60">
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {contact.name}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {contact.title || '-'}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {contact.phone || '-'}
                    </td>
                    <td className="border border-gray-700 px-4 py-3 text-gray-100">
                      {contact.email || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
