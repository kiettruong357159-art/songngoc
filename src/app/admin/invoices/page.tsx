'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  RefreshCw, 
  Calendar, 
  CreditCard,
  CheckCircle,
  Receipt,
  DollarSign
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import InvoiceDetailModal, { InvoiceRecord, BookingForInvoice } from '@/components/admin/InvoiceDetailModal';
import { useToast } from '@/context/ToastContext';

function InvoicesPageContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const checkoutBookingId = searchParams.get('bookingId');

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [bookingForSettlement, setBookingForSettlement] = useState<BookingForInvoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Invoices list
  const fetchInvoices = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: '10',
        });
        if (debouncedSearch) params.set('search', debouncedSearch);

        const res = await fetch(`/api/admin/invoices?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setInvoices(data.invoices);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        } else {
          showToast(data.error || 'Không thể tải danh sách hóa đơn', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi kết nối máy chủ', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, debouncedSearch, showToast]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // If page was loaded with ?bookingId=..., fetch booking to open settlement modal
  useEffect(() => {
    async function loadBookingToSettle() {
      if (!checkoutBookingId) return;
      try {
        const res = await fetch(`/api/admin/bookings/${checkoutBookingId}`);
        const data = await res.json();
        if (data.success && data.booking) {
          // If invoice already exists for this booking, show invoice
          if (data.booking.invoice) {
            setSelectedInvoice(data.booking.invoice);
            setBookingForSettlement(null);
          } else {
            setBookingForSettlement(data.booking);
            setSelectedInvoice(null);
          }
          setModalOpen(true);
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi tải dữ liệu phòng để thanh toán', 'error');
      }
    }

    loadBookingToSettle();
  }, [checkoutBookingId, showToast]);

  const handleOpenInvoiceDetail = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setBookingForSettlement(null);
    setModalOpen(true);
  };

  // Tính tổng tiền các hóa đơn trên trang hiện tại
  const totalRevenueOnPage = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  }, [invoices]);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 className="serif-heading" style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>
            Hóa Đơn & Quyết Toán (Invoices)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Lịch sử toàn bộ hóa đơn thanh toán trả phòng, thống kê doanh thu và in phiếu thu.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvoices(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Tổng số hóa đơn</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {totalCount}
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Doanh thu trang này</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {formatVND(totalRevenueOnPage)}
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, mã đặt phòng, tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderBottom: '2px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '0.875rem 1rem' }}>Mã HĐ & Ngày xuất</th>
                <th style={{ padding: '0.875rem 1rem' }}>Đơn phòng & Khách</th>
                <th style={{ padding: '0.875rem 1rem' }}>Tiền phòng</th>
                <th style={{ padding: '0.875rem 1rem' }}>Dịch vụ / Phụ thu</th>
                <th style={{ padding: '0.875rem 1rem' }}>Cọc đã trừ</th>
                <th style={{ padding: '0.875rem 1rem' }}>Thực thu</th>
                <th style={{ padding: '0.875rem 1rem' }}>Hình thức</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Đang tải hóa đơn...</div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    Chưa có hóa đơn thanh toán nào được tạo.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{inv.invoiceCode}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDateVN(inv.createdAt)}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{inv.booking.guest.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {inv.booking.bookingCode} • {inv.booking.room ? `P.${inv.booking.room.roomNumber}` : 'Chưa gán'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>{formatVND(inv.roomCharge)}</td>

                    <td style={{ padding: '1rem' }}>
                      <div>{formatVND(inv.serviceCharge)}</div>
                      {inv.surcharge > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          +{formatVND(inv.surcharge)} phụ thu
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--color-success)' }}>
                      -{formatVND(inv.depositDeducted)}
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
                      {formatVND(inv.finalAmount)}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {inv.paymentMethod === 'VIETQR' ? 'VietQR Napas247' : inv.paymentMethod === 'CARD' ? 'Thẻ POS' : 'Tiền mặt'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInvoiceDetail(inv)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={14} />
                        <span>Chi tiết</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Invoice Detail / Settlement Modal */}
      <InvoiceDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedInvoice(null);
          setBookingForSettlement(null);
        }}
        invoice={selectedInvoice}
        booking={bookingForSettlement}
        onSettlementSuccess={() => {
          fetchInvoices(true);
        }}
      />
    </div>
  );
}

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải hóa đơn...</div>}>
      <InvoicesPageContent />
    </Suspense>
  );
}
