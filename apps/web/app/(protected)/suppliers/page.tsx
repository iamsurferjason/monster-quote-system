'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Supplier = {
  id: string;
  supplierCode: string;
  companyName: string;
  taxId: string | null;
  phone: string | null;
  status: string;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [message, setMessage] = useState('載入中...');

  useEffect(() => {
    async function fetchSuppliers() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`,
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

        setSuppliers(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    fetchSuppliers();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">供應商列表</h1>
        <Link
          href="/suppliers/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新增供應商
        </Link>
      </div>

      {message && <p>{message}</p>}

      {!message && (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900">
          <table className="min-w-full border-collapse text-sm text-white">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="border border-gray-700 px-4 py-3">供應商代碼</th>
                <th className="border border-gray-700 px-4 py-3">公司名稱</th>
                <th className="border border-gray-700 px-4 py-3">統一編號</th>
                <th className="border border-gray-700 px-4 py-3">電話</th>
                <th className="border border-gray-700 px-4 py-3">狀態</th>
                <th className="border border-gray-700 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-800/60">
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {supplier.supplierCode}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {supplier.companyName}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {supplier.taxId || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {supplier.phone || '-'}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {supplier.status}
                  </td>
                  <td className="border border-gray-700 px-4 py-3">
                    <Link
                      href={`/suppliers/${supplier.id}`}
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
