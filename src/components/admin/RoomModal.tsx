'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';
import { BedDouble } from 'lucide-react';
import { RoomData } from '@/components/pms/RoomCard';
import { RoomStatus } from '@/lib/constants';
import { formatVND } from '@/lib/utils';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit?: RoomData | null;
  defaultFloorId?: string;
  floors: Array<{ id: string; name: string; floorNumber: number }>;
  roomTypes: Array<{ id: string; name: string; basePrice: number }>;
  onSuccess: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  roomToEdit,
  defaultFloorId,
  floors,
  roomTypes,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [roomNumber, setRoomNumber] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roomToEdit) {
      setRoomNumber(roomToEdit.roomNumber);
      setFloorId(roomToEdit.floor.id);
      setRoomTypeId(roomToEdit.roomType.id);
      setStatus(roomToEdit.status);
      setNote(roomToEdit.note || '');
    } else {
      setRoomNumber('');
      setFloorId(defaultFloorId || (floors.length > 0 ? floors[0].id : ''));
      setRoomTypeId(roomTypes.length > 0 ? roomTypes[0].id : '');
      setStatus('AVAILABLE');
      setNote('');
    }
  }, [roomToEdit, defaultFloorId, floors, roomTypes, isOpen]);

  const floorOptions: SelectOption[] = floors.map((f) => ({
    value: f.id,
    label: `${f.name} (Tầng ${f.floorNumber})`,
  }));

  const roomTypeOptions: SelectOption[] = roomTypes.map((rt) => ({
    value: rt.id,
    label: rt.name,
    sublabel: `${formatVND(rt.basePrice)}/đêm`,
  }));

  const statusOptions: SelectOption[] = [
    { value: 'AVAILABLE', label: 'Phòng trống (Sẵn sàng đón khách)' },
    { value: 'DIRTY', label: 'Chờ dọn dẹp (Buồng phòng)' },
    { value: 'CLEANING', label: 'Đang dọn dẹp' },
    { value: 'MAINTENANCE', label: 'Đang bảo trì / tạm khóa' },
    ...(roomToEdit?.status === 'OCCUPIED'
      ? [{ value: 'OCCUPIED', label: 'Đang có khách lưu trú', disabled: true }]
      : []),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = roomNumber.trim();

    if (!trimmedNumber) {
      showToast('Vui lòng nhập số phòng (ví dụ: 101, 204)', 'error');
      return;
    }

    if (!floorId) {
      showToast('Vui lòng chọn tầng cho phòng', 'error');
      return;
    }

    if (!roomTypeId) {
      showToast('Vui lòng chọn hạng phòng', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const url = roomToEdit
        ? `/api/admin/rooms/${roomToEdit.id}`
        : '/api/admin/rooms';
      const method = roomToEdit ? 'PUT' : 'POST';

      const payload: Record<string, any> = {
        roomNumber: trimmedNumber,
        floorId,
        roomTypeId,
        note: note.trim() || null,
      };

      if (roomToEdit) {
        payload.status = status;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          roomToEdit
            ? `Đã cập nhật phòng ${trimmedNumber} thành công`
            : `Đã tạo phòng ${trimmedNumber} thành công`,
          'success'
        );
        onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Thao tác không thành công', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ khi lưu thông tin phòng', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
            }}
          >
            <BedDouble size={18} />
          </div>
          <span>{roomToEdit ? `Chỉnh sửa phòng ${roomToEdit.roomNumber}` : 'Thêm phòng mới'}</span>
        </div>
      }
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Số phòng */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Số phòng <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: 101, 102, 201, 305..."
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Tầng */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Thuộc tầng <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <CustomSelect
            options={floorOptions}
            value={floorId}
            onChange={setFloorId}
            placeholder="Chọn tầng..."
          />
        </div>

        {/* Hạng phòng */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Hạng phòng <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <CustomSelect
            options={roomTypeOptions}
            value={roomTypeId}
            onChange={setRoomTypeId}
            placeholder="Chọn hạng phòng..."
          />
        </div>

        {/* Trạng thái nếu đang edit */}
        {roomToEdit && (
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
              Trạng thái phòng
            </label>
            <CustomSelect
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as RoomStatus)}
              disabled={roomToEdit.status === 'OCCUPIED'}
            />
            {roomToEdit.status === 'OCCUPIED' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '0.25rem', display: 'block' }}>
                Phòng đang có khách lưu trú, không thể đổi trạng thái thủ công tại đây.
              </span>
            )}
          </div>
        )}

        {/* Ghi chú */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Ghi chú phòng (tùy chọn)
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: View ban công hướng hồ bơi, cửa sổ lớn..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="md" loading={submitting}>
            {roomToEdit ? 'Lưu thay đổi' : 'Tạo phòng mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomModal;
