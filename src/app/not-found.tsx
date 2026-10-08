import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h2 className="serif-heading" style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
        404 - Không Tìm Thấy Trang
      </h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
        Trang quý khách đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Về trang chủ Homestay
      </Link>
    </div>
  );
}
