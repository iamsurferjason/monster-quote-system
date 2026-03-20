'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Quotation = {
  id: string;
  quotationNo: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customer: {
    companyName: string;
  };
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [message, setMessage] = useState('載入中...');

  useEffect(() => {
    async function fetchQuotations() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessage('尚未登入');
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/quotations`,
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

        setQuotations(data);
        setMessage('');
      } catch {
        setMessage('無法連線到 API');
      }
    }

    fetchQuotations();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">報價列表</h1>
      </div>

      {message && <p>{message}</p>}

      {!message && (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900">
          <table className="min-w-full border-collapse text-sm text-white">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="border border-gray-700 px-4 py-3">報價單號</th>
                <th className="border border-gray-700 px-4 py-3">客戶</th>
                <th className="border border-gray-700 px-4 py-3">狀態</th>
                <th className="border border-gray-700 px-4 py-3">總金額</th>
                <th className="border border-gray-700 px-4 py-3">建立時間</th>
                <th className="border border-gray-700 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-800/60">
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {quotation.quotationNo}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {quotation.customer.companyName}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {quotation.status}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {quotation.totalAmount}
                  </td>
                  <td className="border border-gray-700 px-4 py-3 text-gray-100">
                    {new Date(quotation.createdAt).toLocaleString('zh-TW')}
                  </td>
                  <td className="border border-gray-700 px-4 py-3">
                    <Link
                      href={`/quotations/${quotation.id}`}
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