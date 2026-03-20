'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/auth';

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      window.location.href = '/login';
      return;
    }

    setReady(true);
  }, []);

  if (!ready) {
    return <div className="p-6">驗證登入中...</div>;
  }

  return <>{children}</>;
}