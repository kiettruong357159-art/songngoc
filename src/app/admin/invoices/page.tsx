'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Eye, 
  RefreshCw,
  Receipt,
  DollarSign
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
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
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');
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
        if (paymentMethodFilter && paymentMethodFilter !== 'ALL') {
          params.set('paymentMethod', paymentMethodFilter);
        }

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
    [currentPage, debouncedSearch, paymentMethodFilter, showToast]
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

  const paymentMethodOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả hình thức' },
    { value: 'VIETQR', label: 'VietQR Napas247' },
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'CARD', label: 'Thẻ POS' },
  ];

  return (
    <div>
      {/* Standard Action Header */}
      <div className="admin-action-header">
        <div className="admin-action-header-left">
          {/* Breadcrumb handled by layout */}
        </div>
        <div className="admin-action-header-right">
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

      {/* Standard Filter Card */}
      <div className="admin-filter-card">
        <div className="admin-search-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, mã đặt phòng, tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-control" style={{ width: '220px' }}>
          <CustomSelect
            options={paymentMethodOptions}
            value={paymentMethodFilter}
            onChange={(val) => {
              setPaymentMethodFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Phương thức thanh toán..."
          />
        </div>
      </div>

      {/* Standard Table Card */}
      <div className="admin-table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã HĐ & Ngày xuất</th>
                <th>Đơn phòng & Khách</th>
                <th>Tiền phòng</th>
                <th>Dịch vụ / Phụ thu</th>
                <th>Cọc đã trừ</th>
                <th>Thực thu</th>
                <th>Hình thức</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
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
                    Chưa có hóa đơn thanh toán nào phù hợp.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{inv.invoiceCode}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDateVN(inv.createdAt)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.booking.guest.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {inv.booking.bookingCode} • {inv.booking.room ? `P.${inv.booking.room.roomNumber}` : 'Chưa gán'}
                      </div>
                    </td>

                    <td>{formatVND(inv.roomCharge)}</td>

                    <td>
                      <div>{formatVND(inv.serviceCharge)}</div>
                      {inv.surcharge > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          +{formatVND(inv.surcharge)} phụ thu
                        </div>
                      )}
                    </td>

                    <td style={{ color: 'var(--color-success)' }}>
                      -{formatVND(inv.depositDeducted)}
                    </td>

                    <td style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
                      {formatVND(inv.finalAmount)}
                    </td>

                    <td>
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

                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-table-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInvoiceDetail(inv)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={14} />
                          <span>Chi tiết</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Standard Table Footer */}
        {!loading && (
          <div className="admin-table-footer">
            <div className="admin-table-count">
              {totalCount > 0 ? (
                <>
                  Hiển thị <strong>{(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalCount)}</strong> trên tổng số <strong>{totalCount}</strong> hóa đơn
                </>
              ) : (
                <span>Không có hóa đơn</span>
              )}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
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
