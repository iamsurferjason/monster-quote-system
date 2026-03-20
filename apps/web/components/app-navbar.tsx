'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser, hasRole, logout, type FrontendUser } from '../lib/auth';

export default function AppNavbar() {
  const [user, setUser] = useState<FrontendUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <header className="border-b border-gray-800 bg-black text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/quotations" className="text-xl font-bold">
            Monster Quote System
          </Link>

          <nav className="flex items-center gap-2">
  <Link href="/dashboard" className="rounded border px-3 py-2 text-sm">
    Dashboard
  </Link>
  <Link href="/quotations" className="rounded border px-3 py-2 text-sm">
    報價
  </Link>
  <Link href="/orders" className="rounded border px-3 py-2 text-sm">
    訂單
  </Link>

            {hasRole(user, ['ADMIN', 'SALES']) && (
              <Link
                href="/quotations/new"
                className="rounded bg-green-600 px-3 py-2 text-sm text-white"
              >
                新增報價
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-right text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500">{user.roles.join(', ')}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="rounded bg-red-600 px-3 py-2 text-sm text-white"
              >
                登出
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded border px-3 py-2 text-sm">
              前往登入
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}