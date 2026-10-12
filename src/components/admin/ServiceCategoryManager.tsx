'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { ServiceCategoryIcon } from '@/components/admin/ServiceCategoryIcon';
import {
  SERVICE_CATEGORY_ICON_KEYS,
  SERVICE_CATEGORY_ICON_LABELS,
  isDefaultServiceCategoryId,
  type ServiceCategoryItem,
  type ServiceCategoryIconKey,
} from '@/lib/service-categories';

interface ServiceCategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ServiceCategoryItem[];
  /** true khi bảng ServiceCategory chưa có dữ liệu trong DB (đang hiển thị danh mục mặc định) */
  isFallback: boolean;
  /** Gọi sau khi thêm/sửa/xoá để tải lại danh mục */
  onChanged: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  marginBottom: '0.35rem',
};

/**
 * Modal quản lý danh mục dịch vụ: xem danh sách, thêm, sửa, bật/tắt và xoá danh mục
 */
export const ServiceCategoryManager: React.FC<ServiceCategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  isFallback,
  onChanged,
}) => {
  const { showToast } = useToast();

  const [editing, setEditing] = useState<ServiceCategoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<ServiceCategoryIconKey>('tag');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setEditing(null);
      setDeleteTarget(null);
    } else if (isFallback) {
      showToast(
        'Đang hiển thị danh mục mặc định. Cần tạo bảng ServiceCategory và nạp 4 danh mục mặc định trong database trước khi thêm, sửa hoặc xoá.',
        'info'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFallback]);

  const handleOpenAdd = () => {
    setEditing(null);
    setCode('');
    setName('');
    setIcon('tag');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setShowForm(true);
  };

  const handleOpenEdit = (category: ServiceCategoryItem) => {
    setEditing(category);
    setCode(category.code);
    setName(category.name);
    setIcon((SERVICE_CATEGORY_ICON_KEYS as readonly string[]).includes(category.icon) ? (category.icon as ServiceCategoryIconKey) : 'tag');
    setSortOrder(category.sortOrder);
    setIsActive(category.isActive);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!editing && !code.trim())) {
      showToast('Vui lòng nhập mã và tên danh mục', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/service-categories', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editing
            ? { id: editing.id, name: name.trim(), icon, sortOrder: Number(sortOrder), isActive }
            : { code: code.trim(), name: name.trim(), icon, sortOrder: Number(sortOrder), isActive }
        ),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editing ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới', 'success');
        setShowForm(false);
        setEditing(null);
        onChanged();
      } else {
        showToast(data.error || 'Lưu danh mục thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi dữ liệu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (category: ServiceCategoryItem) => {
    try {
      const res = await fetch('/api/admin/service-categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: category.id, isActive: !category.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${category.isActive ? 'tắt' : 'bật'} danh mục ${category.name}`, 'success');
        onChanged();
      } else {
        showToast(data.error || 'Thao tác thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/service-categories?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xoá danh mục "${deleteTarget.name}"`, 'success');
        setDeleteTarget(null);
        onChanged();
      } else {
        showToast(data.error || 'Xoá danh mục thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Quản Lý Danh Mục Dịch Vụ" maxWidth="640px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {!showForm && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAdd}
                disabled={isFallback}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Thêm danh mục</span>
              </Button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Danh mục</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Mã</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Thứ tự</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Trạng thái</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          <ServiceCategoryIcon icon={category.icon} />
                          {category.name}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--color-text-muted)' }}>{category.code}</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{category.sortOrder}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: category.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: category.isActive ? 'var(--color-success)' : 'var(--color-text-muted)',
                          }}
                        >
                          {category.isActive ? 'Đang bật' : 'Đã tắt'}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isDefaultServiceCategoryId(category.id)}
                            onClick={() => handleOpenEdit(category)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Edit2 size={13} />
                            <span>Sửa</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isDefaultServiceCategoryId(category.id)}
                            onClick={() => handleToggleActive(category)}
                          >
                            {category.isActive ? 'Tắt' : 'Bật'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isDefaultServiceCategoryId(category.id)}
                            onClick={() => setDeleteTarget(category)}
                            style={{ display: 'flex', alignItems: 'center', color: 'var(--color-error)' }}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>
                  Mã danh mục <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editing)}
                  placeholder="VÍ DỤ: SPA"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, opacity: editing ? 0.6 : 1 }}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Tên danh mục <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Spa & Massage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SERVICE_CATEGORY_ICON_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    title={SERVICE_CATEGORY_ICON_LABELS[key]}
                    onClick={() => setIcon(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.7rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      border: `1px solid ${icon === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: icon === key ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: icon === key ? '#ffffff' : 'var(--color-text)',
                    }}
                  >
                    <ServiceCategoryIcon icon={key} size={14} />
                    <span>{SERVICE_CATEGORY_ICON_LABELS[key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Thứ tự hiển thị</label>
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="categoryIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="categoryIsActive" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                  Bật danh mục này
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                {editing ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>

    <ConfirmDialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => {
        if (!open && !deleting) setDeleteTarget(null);
      }}
      variant="danger"
      title={deleteTarget ? `Xóa danh mục "${deleteTarget.name}"?` : 'Xác nhận xóa'}
      description={
        deleteTarget ? (
          <span>
            Hành động này sẽ xóa danh mục <strong>{deleteTarget.name}</strong> (mã <code>{deleteTarget.code}</code>). Các dịch vụ thuộc danh mục này có thể cần được phân loại lại.
          </span>
        ) : null
      }
      confirmText="Xác nhận xóa"
      cancelText="Hủy bỏ"
      loading={deleting}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteTarget(null)}
    />
    </>
  );
};

export default ServiceCategoryManager;
