import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { AuthProvider } from '@/context/AuthContext';
import { AdminUIProvider } from '@/context/AdminUIContext';
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
      <AdminUIProvider>
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-body">
            <AdminHeader />
            <main className="admin-main">{children}</main>
          </div>
        </div>
      </AdminUIProvider>
    </AuthProvider>
  );
}
