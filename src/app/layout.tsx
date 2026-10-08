import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700', '800'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Homestay Song Ngọc Phan Thiết | Đặt Phòng Trực Tuyến & Quản Lý PMS',
  description: 'Homestay Song Ngọc Phan Thiết - 307/2 Thủ Khoa Huân, Phú Thủy. Không gian ấm cúng, gần biển Đồi Dương, tiện nghi đầy đủ cho gia đình và nhóm bạn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

