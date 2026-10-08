'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, LogIn, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Chào mừng trở lại, ${json.data.user.name}!`);
        // Chuyển hướng vào hệ thống PMS
        window.location.href = '/admin';
      } else {
        toast.error(json.error || 'Đăng nhập không thành công');
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundImage: `linear-gradient(rgba(15, 91, 102, 0.85), rgba(7, 42, 47, 0.95)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2.5rem',
        }}
      >
        {/* Brand Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="Song Ngọc Emblem" width={56} height={56} style={{ display: 'block' }} />
          </div>
          <h1 className="serif-heading" style={{ fontSize: '1.85rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
            Song Ngọc Homestay PMS
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Hệ thống Quản lý Homestay & Điều hành Lễ tân
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin hoặc receptionist"
                style={{
                  width: '100%',
                  padding: '0.6875rem 0.875rem 0.6875rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.925rem',
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.6875rem 0.875rem 0.6875rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.925rem',
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            leftIcon={<LogIn size={18} />}
            style={{ width: '100%', backgroundColor: 'var(--color-primary)', marginTop: '0.5rem' }}
          >
            Đăng nhập hệ thống
          </Button>

          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} />
              <span>Quay lại trang chủ Homestay</span>
            </Link>
          </div>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Tài khoản mẫu: <code>admin / admin123</code> hoặc <code>receptionist / rec123</code>
        </div>
      </div>
    </div>
  );
}
