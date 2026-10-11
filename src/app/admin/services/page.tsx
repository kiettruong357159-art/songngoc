'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Coffee, 
  Plus, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Search,
  Shirt,
  Utensils,
  Car
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  isActive: boolean;
}

export default function AdminServicesPage() {
  const { showToast } = useToast();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('MINIBAR');
  const [formPrice, setFormPrice] = useState<number>(20000);
  const [formUnit, setFormUnit] = useState('Lon');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      } else {
        showToast(data.error || 'Không thể tải danh mục dịch vụ', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName('');
    setFormCategory('MINIBAR');
    setFormPrice(20000);
    setFormUnit('Lon');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormPrice(service.price);
    setFormUnit(service.unit);
    setFormIsActive(service.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUnit.trim()) {
      showToast('Vui lòng nhập tên dịch vụ và đơn vị tính', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingService) {
        // Update
        const res = await fetch('/api/admin/services', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            name: formName.trim(),
            category: formCategory,
            price: Number(formPrice),
            unit: formUnit.trim(),
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã cập nhật dịch vụ', 'success');
          setIsModalOpen(false);
          fetchServices(true);
        } else {
          showToast(data.error || 'Cập nhật thất bại', 'error');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            category: formCategory,
            price: Number(formPrice),
            unit: formUnit.trim(),
            isActive: formIsActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã thêm dịch vụ mới', 'success');
          setIsModalOpen(false);
          fetchServices(true);
        } else {
          showToast(data.error || 'Thêm mới thất bại', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi dữ liệu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          isActive: !service.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${!service.isActive ? 'kích hoạt' : 'tạm ngưng'} dịch vụ ${service.name}`, 'success');
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s))
        );
      } else {
        showToast(data.error || 'Thao tác thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối', 'error');
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.unit.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, categoryFilter, search]);

  const categorySelectOptions: SelectOption[] = Object.entries(SERVICE_CATEGORY_LABELS).map(
    ([key, label]) => ({
      value: key,
      label,
    })
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MINIBAR':
        return <Coffee size={15} />;
      case 'LAUNDRY':
        return <Shirt size={15} />;
      case 'FOOD':
        return <Utensils size={15} />;
      case 'TRANSPORT':
        return <Car size={15} />;
      default:
        return <Coffee size={15} />;
    }
  };

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
            Danh Mục Dịch Vụ & Minibar
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Quản lý bảng giá các mặt hàng đồ uống minibar, dịch vụ giặt ủi và tiện ích gia tăng.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchServices(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Thêm dịch vụ mới</span>
          </Button>
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
          justifyContent: 'space-between',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: categoryFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-bg)',
              color: categoryFilter === 'ALL' ? '#ffffff' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            Tất cả ({services.length})
          </button>

          {Object.entries(SERVICE_CATEGORY_LABELS).map(([catKey, label]) => {
            const count = services.filter((s) => s.category === catKey).length;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: categoryFilter === catKey ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: categoryFilter === catKey ? '#ffffff' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                {getCategoryIcon(catKey)}
                <span>{label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
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
            placeholder="Tìm tên dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* Services Table */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
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
                <th style={{ padding: '0.875rem 1rem' }}>Tên dịch vụ</th>
                <th style={{ padding: '0.875rem 1rem' }}>Danh mục</th>
                <th style={{ padding: '0.875rem 1rem' }}>Đơn giá</th>
                <th style={{ padding: '0.875rem 1rem' }}>Đơn vị tính</th>
                <th style={{ padding: '0.875rem 1rem' }}>Trạng thái</th>
                <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                    <div>Đang tải danh mục...</div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    Không có dịch vụ nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {service.name}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {getCategoryIcon(service.category)}
                        <span>{SERVICE_CATEGORY_LABELS[service.category] || service.category}</span>
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {formatVND(service.price)}
                    </td>
                    <td style={{ padding: '1rem' }}>{service.unit}</td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: service.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: service.isActive ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {service.isActive ? 'Đang bán' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(service)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit2 size={13} />
                          <span>Sửa</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleActive(service)}
                        >
                          {service.isActive ? 'Ngưng' : 'Bật'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Service */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tên dịch vụ / mặt hàng <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Bia Heineken bạc, Giặt ủi áo sơ mi..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Nhóm danh mục <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <CustomSelect
              options={categorySelectOptions}
              value={formCategory}
              onChange={(val) => setFormCategory(val)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Đơn giá (VNĐ) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={5000}
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontWeight: 700,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Đơn vị tính <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Lon, Chai, Bộ, Kg, Lượt..."
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Kích hoạt kinh doanh mặt hàng này ngay
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingService ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
