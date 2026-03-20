import AppNavbar from '../../components/app-navbar';
import AuthGuard from '../../components/auth-guard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <AppNavbar />
        <div className="bg-black text-white">{children}</div>
      </div>
    </AuthGuard>
  );
}