import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-3xl font-bold">Monster Quote System</h1>
      <p className="mb-6">前端已建立，請先登入。</p>

      <Link
        href="/login"
        className="rounded bg-black px-4 py-2 text-white"
      >
        前往登入
      </Link>
    </main>
  );
}