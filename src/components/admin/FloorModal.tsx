'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { Layers } from 'lucide-react';

interface FloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorToEdit?: { id: string; name: string; floorNumber: number } | null;
  suggestedFloorNumber?: number;
  onSuccess: () => void;
}

export const FloorModal: React.FC<FloorModalProps> = ({
  isOpen,
  onClose,
  floorToEdit,
  suggestedFloorNumber = 1,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [floorNumber, setFloorNumber] = useState<number | string>(suggestedFloorNumber);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (floorToEdit) {
      setName(floorToEdit.name);
      setFloorNumber(floorToEdit.floorNumber);
    } else {
      setName('');
      setFloorNumber(suggestedFloorNumber);
    }
  }, [floorToEdit, suggestedFloorNumber, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const num = Number(floorNumber);

    if (!trimmedName) {
      showToast('Vui lòng nhập tên tầng (ví dụ: Tầng 4, Tầng Áp Mái)', 'error');
      return;
    }

    if (isNaN(num)) {
      showToast('Số thứ tự tầng phải là số hợp lệ', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const url = floorToEdit
        ? `/api/admin/floors/${floorToEdit.id}`
        : '/api/admin/floors';
      const method = floorToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          floorNumber: num,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          floorToEdit ? `Đã cập nhật tầng "${trimmedName}" thành công` : `Đã thêm tầng "${trimmedName}" thành công`,
          'success'
        );
        onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Thao tác không thành công', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ khi lưu thông tin tầng', 'error');
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
            <Layers size={18} />
          </div>
          <span>{floorToEdit ? 'Chỉnh sửa tầng' : 'Thêm tầng mới'}</span>
        </div>
      }
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Tên hiển thị tầng <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Tầng 1 (Trệt), Tầng 2, Tầng Thượng..."
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Tên này sẽ hiển thị trên sơ đồ phòng và bộ lọc tầng.
          </span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Số thứ tự tầng (để sắp xếp) <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="number"
            required
            placeholder="Ví dụ: 1, 2, 3, 4..."
            value={floorNumber}
            onChange={(e) => setFloorNumber(e.target.value)}
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
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Số nguyên duy nhất dùng để xếp thứ tự các tầng từ thấp lên cao (1, 2, 3...).
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="md" loading={submitting}>
            {floorToEdit ? 'Lưu thay đổi' : 'Tạo tầng mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FloorModal;
