'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';
import { AVAILABLE_AMENITY_ICONS, AmenityIcon } from '@/components/admin/AmenityIcon';

export interface AmenityData {
  id: string;
  code: string;
  name: string;
  icon: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenityToEdit?: AmenityData | null;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'GENERAL', label: 'Tiện nghi chung & Không gian' },
  { value: 'BEDROOM', label: 'Phòng ngủ & Nghỉ ngơi' },
  { value: 'BATHROOM', label: 'Phòng tắm & Vệ sinh' },
  { value: 'MEDIA', label: 'Công nghệ & Giải trí' },
];

export const AmenityModal: React.FC<AmenityModalProps> = ({
  isOpen,
  onClose,
  amenityToEdit,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [icon, setIcon] = useState('sparkles');
  const [category, setCategory] = useState('GENERAL');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (amenityToEdit) {
      setName(amenityToEdit.name);
      setCode(amenityToEdit.code);
      setIcon(amenityToEdit.icon || 'sparkles');
      setCategory(amenityToEdit.category || 'GENERAL');
      setSortOrder(amenityToEdit.sortOrder ?? 0);
      setIsActive(amenityToEdit.isActive ?? true);
    } else {
      setName('');
      setCode('');
      setIcon('sparkles');
      setCategory('GENERAL');
      setSortOrder(0);
      setIsActive(true);
    }
  }, [amenityToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên tiện nghi', 'info');
      return;
    }

    try {
      setSubmitting(true);
      const isEditing = Boolean(amenityToEdit);
      const url = '/api/admin/amenities';
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = isEditing
        ? {
            id: amenityToEdit?.id,
            name: name.trim(),
            code: code.trim() || undefined,
            icon,
            category,
            sortOrder: Number(sortOrder) || 0,
            isActive,
          }
        : {
            name: name.trim(),
            code: code.trim() || undefined,
            icon,
            category,
            sortOrder: Number(sortOrder) || 0,
            isActive,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi lưu tiện nghi');
      }

      showToast(
        isEditing ? 'Cập nhật tiện nghi thành công!' : 'Thêm tiện nghi mới thành công!',
        'success'
      );
      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Thao tác không thành công';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={amenityToEdit ? 'Chỉnh sửa Tiện nghi' : 'Thêm Tiện nghi mới'}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Tên tiện nghi */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
            Tên tiện nghi <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Máy pha cà phê Nespresso, Bồn tắm thư giãn..."
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: '0.9375rem',
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Mã code và Thứ tự hiển thị */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
              Mã định danh (Code)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Tự sinh nếu để trống"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Ví dụ: coffee_maker, jacuzzi
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
              Thứ tự ưu tiên
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Số nhỏ hơn xếp trước
            </span>
          </div>
        </div>

        {/* Phân loại nhóm */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
            Nhóm danh mục
          </label>
          <CustomSelect
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(val) => setCategory(val)}
          />
        </div>

        {/* Bộ chọn Biểu tượng Icon */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Biểu tượng đại diện (Icon)
            </label>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              Đang chọn: <AmenityIcon icon={icon} size={16} /> <code>{icon}</code>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
              gap: '0.5rem',
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '0.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            {AVAILABLE_AMENITY_ICONS.map((item) => {
              const isSelected = icon === item.key;
              const IconComp = item.Icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIcon(item.key)}
                  title={item.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={18} />
                  <span style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {item.key}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trạng thái kích hoạt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            Kích hoạt hiển thị cho hạng phòng
          </label>
        </div>

        {/* Nút hành động */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : amenityToEdit ? 'Cập nhật' : 'Tạo tiện nghi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AmenityModal;
