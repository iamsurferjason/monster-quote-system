'use client';

import Link from 'next/link';
import { useState } from 'react';

type ContactForm = {
  name: string;
  title: string;
  phone: string;
  email: string;
};

export default function NewSupplierPage() {
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [message, setMessage] = useState('');

  function addContact() {
    setContacts((prev) => [
      ...prev,
      { name: '', title: '', phone: '', email: '' },
    ]);
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateContact<K extends keyof ContactForm>(
    index: number,
    field: K,
    value: ContactForm[K],
  ) {
    setContacts((prev) =>
      prev.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('送出中...');

    const token = localStorage.getItem('accessToken');

    if (!token) {
      setMessage('尚未登入');
      return;
    }

    if (!companyName.trim()) {
      setMessage('公司名稱為必填');
      return;
    }

    const payload = {
      companyName: companyName.trim(),
      taxId: taxId.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      bankName: bankName.trim() || undefined,
      bankCode: bankCode.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      bankAccountName: bankAccountName.trim() || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      contacts: contacts
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          title: c.title.trim() || undefined,
          phone: c.phone.trim() || undefined,
          email: c.email.trim() || undefined,
        })),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/suppliers`,
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
      window.location.href = '/suppliers';
    } catch {
      setMessage('無法連線到 API');
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">新增供應商</h1>
        <div className="flex gap-2">
          <Link href="/suppliers" className="rounded border border-gray-700 px-4 py-2 text-white hover:bg-gray-800">
            返回供應商列表
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">基本資料</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                公司名稱 <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="請輸入公司名稱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                統一編號
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="請輸入統一編號"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                地址
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="請輸入地址"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                電話
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="請輸入電話"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="請輸入 Email"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">銀行資料</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                銀行名稱
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="請輸入銀行名稱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                銀行代碼
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="請輸入銀行代碼"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                銀行帳號
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="請輸入銀行帳號"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                戶名
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="請輸入戶名"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                付款條件
              </label>
              <input
                className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="例如：月結 30 天"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">聯絡人</h2>
            <button
              type="button"
              onClick={addContact}
              className="rounded border border-gray-700 bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              新增聯絡人
            </button>
          </div>

          {contacts.length === 0 && (
            <p className="text-gray-400 text-sm">尚未新增聯絡人</p>
          )}

          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-700 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">聯絡人 #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                  >
                    刪除
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      姓名
                    </label>
                    <input
                      className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                      value={contact.name}
                      onChange={(e) =>
                        updateContact(index, 'name', e.target.value)
                      }
                      placeholder="請輸入姓名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      職稱
                    </label>
                    <input
                      className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                      value={contact.title}
                      onChange={(e) =>
                        updateContact(index, 'title', e.target.value)
                      }
                      placeholder="請輸入職稱"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      電話
                    </label>
                    <input
                      className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(index, 'phone', e.target.value)
                      }
                      placeholder="請輸入電話"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                      value={contact.email}
                      onChange={(e) =>
                        updateContact(index, 'email', e.target.value)
                      }
                      placeholder="請輸入 Email"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            建立供應商
          </button>

          {message && <p>{message}</p>}
        </div>
      </form>
    </main>
  );
}
