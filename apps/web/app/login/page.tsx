'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@monster.local');
  const [password, setPassword] = useState('Admin@1234');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('登入中...');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || '登入失敗');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      window.location.href = '/dashboard';
    } catch {
      setMessage('無法連線到 API');
    }
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded border p-6">
        <input
          className="w-full border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <input
          className="w-full border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Login
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}