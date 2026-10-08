import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { AuthProvider } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  const session = verifySessionToken(token);
  if (!session) {
    redirect('/login');
  }

  return (
    <AuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <AdminHeader />
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
