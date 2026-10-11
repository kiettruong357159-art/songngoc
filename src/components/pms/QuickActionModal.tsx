'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Sparkles, 
  Wrench, 
  LogIn, 
  LogOut, 
  Coffee, 
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Edit2,
  Trash2
} from 'lucide-react';
import { RoomData } from './RoomCard';
import { ROOM_STATUS_META, RoomStatus } from '@/lib/constants';
import { formatDateVN, formatVND } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface QuickActionModalProps {
  room: RoomData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (roomId: string, newStatus: RoomStatus, note?: string) => Promise<void>;
  onEditRoom?: (room: RoomData) => void;
  onDeleteRoom?: (room: RoomData) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  room,
  isOpen,
  onClose,
  onStatusChange,
  onEditRoom,
  onDeleteRoom,
}) => {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setNote(room.note || '');
    }
  }, [room]);

  if (!room) return null;

  const meta = ROOM_STATUS_META[room.status] || {
    label: room.status,
    color: 'var(--color-text)',
    bg: 'var(--color-bg)',
    border: 'var(--color-border)',
  };

  const handleAction = async (newStatus: RoomStatus) => {
    setIsSubmitting(true);
    try {
      await onStatusChange(room.id, newStatus, note);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNoteOnly = async () => {
    setIsSubmitting(true);
    try {
      await onStatusChange(room.id, room.status, note);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Phòng {room.roomNumber}
          </span>
          <span
            style={{
              fontSize: '0.8125rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: meta.bg,
              color: meta.color,
              fontWeight: 600,
            }}
          >
            {meta.label}
          </span>
        </div>
      }
      maxWidth="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Room Info Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{room.roomType.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {room.floor.name} • {room.roomType.bedType}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              {formatVND(room.roomType.basePrice)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/ đêm</div>
          </div>
        </div>

        {/* Guest Booking Details if Occupied */}
        {room.status === 'OCCUPIED' && room.currentBooking && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-error)', marginBottom: '0.5rem' }}>
              THÔNG TIN LƯU TRÚ HIỆN TẠI
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} style={{ color: 'var(--color-text-muted)' }} />
                <strong>{room.currentBooking.guest.fullName}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={15} style={{ color: 'var(--color-text-muted)' }} />
                <span>{room.currentBooking.guest.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
                <span>Vào: {formatDateVN(room.currentBooking.checkIn)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
                <span>Ra: {formatDateVN(room.currentBooking.checkOut)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Operational Actions by Status */}
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tác vụ vận hành
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {room.status === 'AVAILABLE' && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => router.push(`/admin/checkin?roomId=${room.id}`)}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <LogIn size={18} />
                  <span>Nhận phòng tại quầy (Walk-in Check-in)</span>
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleAction('MAINTENANCE')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Wrench size={18} />
                  <span>Bảo trì phòng này</span>
                </Button>
              </>
            )}

            {room.status === 'OCCUPIED' && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => router.push(`/admin/invoices?bookingId=${room.currentBooking?.id || ''}`)}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <LogOut size={18} />
                  <span>Trả phòng & Thanh toán hóa đơn (Check-out)</span>
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => router.push(`/admin/bookings/${room.currentBooking?.id || ''}`)}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Coffee size={18} />
                  <span>Thêm Minibar & Dịch vụ giặt ủi</span>
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => handleAction('DIRTY')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <AlertTriangle size={18} />
                  <span>Chuyển trạng thái: Cần dọn dẹp</span>
                </Button>
              </>
            )}

            {room.status === 'DIRTY' && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleAction('CLEANING')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={18} />
                  <span>Bắt đầu dọn phòng (Chuyển sang Đang dọn)</span>
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleAction('MAINTENANCE')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Wrench size={18} />
                  <span>Báo hỏng thiết bị (Chuyển sang Bảo trì)</span>
                </Button>
              </>
            )}

            {room.status === 'CLEANING' && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleAction('AVAILABLE')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={18} />
                  <span>Hoàn tất dọn dẹp (Phòng sạch - Sẵn sàng đón khách)</span>
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleAction('DIRTY')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <AlertTriangle size={18} />
                  <span>Chưa đạt yêu cầu (Cần dọn lại)</span>
                </Button>
              </>
            )}

            {room.status === 'MAINTENANCE' && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleAction('DIRTY')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={18} />
                  <span>Bảo trì xong → Chuyển sang Cần dọn dẹp</span>
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleAction('AVAILABLE')}
                  loading={isSubmitting}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={18} />
                  <span>Bảo trì xong &amp; Đã sạch → Sẵn sàng đón khách</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Room Note Section */}
        <div>
          <label
            htmlFor="room-note"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: '0.35rem',
            }}
          >
            Ghi chú nội bộ buồng phòng / lễ tân
          </label>
          <textarea
            id="room-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Vòi sen hơi yếu, khách yêu cầu thêm chăn mỏng..."
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveNoteOnly}
              loading={isSubmitting}
            >
              Lưu ghi chú
            </Button>
          </div>
        </div>

        {/* Room Settings: Edit & Delete */}
        {(onEditRoom || onDeleteRoom) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              marginTop: '0.5rem',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Cấu hình phòng:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onEditRoom && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEditRoom(room);
                  }}
                  leftIcon={<Edit2 size={14} />}
                >
                  Sửa phòng
                </Button>
              )}
              {onDeleteRoom && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onDeleteRoom(room);
                  }}
                  disabled={room.status === 'OCCUPIED'}
                  leftIcon={<Trash2 size={14} />}
                >
                  Xóa phòng
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuickActionModal;
