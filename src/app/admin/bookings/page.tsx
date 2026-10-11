'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  Bed, 
  CheckCircle, 
  XCircle, 
  LogIn, 
  Plus, 
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatDateVN, formatVND, calculateNights } from '@/lib/utils';
import { BOOKING_STATUS_META, BookingStatus } from '@/lib/constants';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';

interface BookingRecord {
  id: string;
  bookingCode: string;
  source: string;
  checkIn: string;
  checkOut: string;
  actualCheckIn?: string | null;
  actualCheckOut?: string | null;
  adults: number;
  children: number;
  status: BookingStatus;
  totalRoomAmount: number;
  depositAmount: number;
  paymentStatus: string;
  specialRequests?: string | null;
  guest: {
    id: string;
    fullName: string;
    phone: string;
    email?: string | null;
    idCard?: string | null;
  };
  roomType: {
    id: string;
    name: string;
    basePrice: number;
  };
  room?: {
    id: string;
    roomNumber: string;
    floor?: {
      name: string;
    };
  } | null;
  invoice?: {
    id: string;
    invoiceCode: string;
    totalAmount: number;
    finalPaid: number;
  } | null;
}

export default function AdminBookingsPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Check-in modal state for pre-booked reservations
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [selectedBookingForCheckin, setSelectedBookingForCheckin] = useState<BookingRecord | null>(null);
  const [availableRoomsForAssign, setAvailableRoomsForAssign] = useState<Array<{ id: string; roomNumber: string; floorName: string }>>([]);
  const [assignedRoomId, setAssignedRoomId] = useState('');
  const [guestIdCard, setGuestIdCard] = useState('');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch bookings
  const fetchBookings = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: '10',
        });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);

        const res = await fetch(`/api/admin/bookings?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setBookings(data.bookings);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        } else {
          showToast(data.error || 'Không thể tải danh sách đơn đặt', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Lỗi kết nối máy chủ', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, debouncedSearch, statusFilter, showToast]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Load available rooms for checkin assignment
  const handleOpenCheckinModal = async (booking: BookingRecord) => {
    setSelectedBookingForCheckin(booking);
    setGuestIdCard(booking.guest.idCard || '');
    setAssignedRoomId(booking.room?.id || '');
    setCheckinModalOpen(true);

    try {
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      if (data.success && Array.isArray(data.floors)) {
        const rooms: Array<{ id: string; roomNumber: string; floorName: string }> = [];
        data.floors.forEach((fl: any) => {
          fl.rooms.forEach((r: any) => {
            if (
              (r.status === 'AVAILABLE' || r.id === booking.room?.id) &&
              r.roomType.id === booking.roomType.id
            ) {
              rooms.push({
                id: r.id,
                roomNumber: r.roomNumber,
                floorName: fl.name,
              });
            }
          });
        });
        setAvailableRoomsForAssign(rooms);
        if (rooms.length > 0 && !booking.room?.id) {
          setAssignedRoomId(rooms[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách phòng trống', 'error');
    }
  };

  const handleExecuteCheckin = async () => {
    if (!selectedBookingForCheckin || !assignedRoomId) {
      showToast('Vui lòng chọn phòng để nhận', 'error');
      return;
    }

    setSubmittingCheckin(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBookingForCheckin.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: assignedRoomId,
          idCard: guestIdCard,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Nhận phòng thành công cho đơn ${selectedBookingForCheckin.bookingCode}!`, 'success');
        setCheckinModalOpen(false);
        fetchBookings(true);
      } else {
        showToast(data.error || 'Nhận phòng thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi yêu cầu nhận phòng', 'error');
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Đã cập nhật đơn đặt phòng sang trạng thái ${newStatus}`, 'success');
        fetchBookings(true);
      } else {
        showToast(data.error || 'Cập nhật thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xác nhận (PENDING)' },
    { value: 'CONFIRMED', label: 'Đã xác nhận (CONFIRMED)' },
    { value: 'CHECKED_IN', label: 'Đang lưu trú (CHECKED_IN)' },
    { value: 'CHECKED_OUT', label: 'Đã trả phòng (CHECKED_OUT)' },
    { value: 'CANCELLED', label: 'Đã hủy (CANCELLED)' },
  ];

  const assignRoomOptions: SelectOption[] = availableRoomsForAssign.map((r) => ({
    value: r.id,
    label: `Phòng ${r.roomNumber} (${r.floorName})`,
  }));

  return (
    <div>
      {/* Page Header */}
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
            Quản Lý Đơn Đặt Phòng (Bookings)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Tra cứu, xác nhận và quản lý toàn diện các đơn đặt phòng từ Website và Lễ tân.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBookings(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>

          <Link href="/admin/checkin">
            <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} />
              <span>Nhận phòng tại quầy</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
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
            placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
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

        {/* Status filter dropdown using CustomSelect */}
        <div style={{ width: '240px' }}>
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Lọc trạng thái..."
          />
        </div>
      </div>

      {/* Bookings Table */}
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
                <th style={{ padding: '0.875rem 1rem' }}>Mã đơn & Nguồn</th>
                <th style={{ padding: '0.875rem 1rem' }}>Khách hàng</th>
                <th style={{ padding: '0.875rem 1rem' }}>Hạng phòng & Số phòng</th>
                <th style={{ padding: '0.875rem 1rem' }}>Lịch trình</th>
                <th style={{ padding: '0.875rem 1rem' }}>Tiền phòng & Cọc</th>
                <th style={{ padding: '0.875rem 1rem' }}>Trạng thái</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Đang tải dữ liệu...</div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div>Không tìm thấy đơn đặt phòng nào phù hợp.</div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const meta = BOOKING_STATUS_META[booking.status] || {
                    label: booking.status,
                    badgeType: 'neutral' as const,
                  };

                  const nights = calculateNights(new Date(booking.checkIn), new Date(booking.checkOut));

                  return (
                    <tr
                      key={booking.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Code & Source */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{booking.bookingCode}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {booking.source === 'ONLINE_WEB' ? '🌐 Đặt Website' : '🏨 Tại quầy'}
                        </div>
                      </td>

                      {/* Guest */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{booking.guest.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {booking.guest.phone}
                        </div>
                      </td>

                      {/* Room & Type */}
                      <td style={{ padding: '1rem' }}>
                        <div>{booking.roomType.name}</div>
                        {booking.room ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            Phòng {booking.room.roomNumber} ({booking.room.floor?.name || ''})
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>
                            Chưa gán phòng
                          </div>
                        )}
                      </td>

                      {/* Schedule */}
                      <td style={{ padding: '1rem' }}>
                        <div>
                          {formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {nights} đêm • {booking.adults} Lớn{booking.children > 0 ? `, ${booking.children} Trẻ` : ''}
                        </div>
                      </td>

                      {/* Financials */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{formatVND(booking.totalRoomAmount)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
                          Cọc: {formatVND(booking.depositAmount)}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem' }}>
                        <Badge variant={meta.badgeType as any} size="sm">
                          {meta.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                              >
                                Xác nhận
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                              >
                                Hủy
                              </Button>
                            </>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenCheckinModal(booking)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <LogIn size={14} />
                                <span>Nhận phòng</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                              >
                                Hủy
                              </Button>
                            </>
                          )}

                          {booking.status === 'CHECKED_IN' && (
                            <Link href={`/admin/invoices?bookingId=${booking.id}`}>
                              <Button variant="outline" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <FileText size={14} />
                                <span>Trả phòng</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
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

      {/* Modal Check-in for Pre-booked Reservations */}
      <Modal
        isOpen={checkinModalOpen}
        onClose={() => setCheckinModalOpen(false)}
        title={
          <div>
            Nhận Phòng - Đơn {selectedBookingForCheckin?.bookingCode}
          </div>
        }
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
            }}
          >
            <div><strong>Khách:</strong> {selectedBookingForCheckin?.guest.fullName} ({selectedBookingForCheckin?.guest.phone})</div>
            <div><strong>Hạng phòng:</strong> {selectedBookingForCheckin?.roomType.name}</div>
            <div>
              <strong>Lịch:</strong> {selectedBookingForCheckin?.checkIn && formatDateVN(selectedBookingForCheckin.checkIn)} →{' '}
              {selectedBookingForCheckin?.checkOut && formatDateVN(selectedBookingForCheckin.checkOut)}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Chọn số phòng trống <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            {availableRoomsForAssign.length === 0 ? (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-error)',
                  fontSize: '0.8125rem',
                }}
              >
                Không có phòng trống nào thuộc hạng này sẵn sàng đón khách.
              </div>
            ) : (
              <CustomSelect
                options={assignRoomOptions}
                value={assignedRoomId}
                onChange={(val) => setAssignedRoomId(val)}
                placeholder="Chọn phòng..."
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Số CCCD / Hộ chiếu khách lưu trú
            </label>
            <input
              type="text"
              placeholder="Nhập số CCCD để lưu hồ sơ lưu trú..."
              value={guestIdCard}
              onChange={(e) => setGuestIdCard(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => setCheckinModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteCheckin}
              loading={submittingCheckin}
              disabled={!assignedRoomId || availableRoomsForAssign.length === 0}
            >
              Xác nhận nhận phòng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
