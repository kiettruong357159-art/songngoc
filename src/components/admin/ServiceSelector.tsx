'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coffee, 
  Shirt, 
  Utensils, 
  Car, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Clock,
  Sparkles
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORIES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  isActive: boolean;
}

interface AddedBookingService {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string | null;
  addedAt: string;
  service: ServiceItem;
}

interface ServiceSelectorProps {
  bookingId: string;
  roomNumber?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  bookingId,
  roomNumber,
  onSuccess,
  onClose,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [existingItems, setExistingItems] = useState<AddedBookingService[]>([]);

  // Selected quantities for new addition: { [serviceId]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [serviceNote, setServiceNote] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Load available catalog and currently added services
  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, existRes] = await Promise.all([
        fetch('/api/admin/services?activeOnly=true'),
        fetch(`/api/admin/bookings/${bookingId}/services`),
      ]);

      const catData = await catRes.json();
      const existData = await existRes.json();

      if (catData.success) {
        setServices(catData.services);
      }
      if (existData.success) {
        setExistingItems(existData.items);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải dữ liệu dịch vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  // Filter catalog items
  const filteredServices = useMemo(() => {
    if (activeCategory === 'ALL') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  // Compute newly selected total
  const selectedNewTotal = useMemo(() => {
    return Object.entries(quantities).reduce((sum, [sId, qty]) => {
      const service = services.find((s) => s.id === sId);
      return sum + (service ? service.price * qty : 0);
    }, 0);
  }, [quantities, services]);

  const selectedCount = Object.keys(quantities).length;

  const handleAddServices = async () => {
    if (selectedCount === 0) {
      showToast('Vui lòng chọn số lượng cho ít nhất 1 dịch vụ', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const items = Object.entries(quantities).map(([serviceId, quantity]) => ({
        serviceId,
        quantity,
        note: serviceNote.trim() || undefined,
      }));

      const res = await fetch(`/api/admin/bookings/${bookingId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Đã thêm dịch vụ vào hóa đơn phòng thành công!', 'success');
        setQuantities({});
        setServiceNote('');
        await loadData();
        if (onSuccess) onSuccess();
      } else {
        showToast(data.error || 'Thêm dịch vụ thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi yêu cầu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/services?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa dịch vụ', 'success');
        setExistingItems((prev) => prev.filter((i) => i.id !== itemId));
        if (onSuccess) onSuccess();
      } else {
        showToast(data.error || 'Xóa thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi xóa dịch vụ', 'error');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MINIBAR':
        return <Coffee size={16} />;
      case 'LAUNDRY':
        return <Shirt size={16} />;
      case 'FOOD':
        return <Utensils size={16} />;
      case 'TRANSPORT':
        return <Car size={16} />;
      default:
        return <Coffee size={16} />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Sparkles size={32} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Đang tải danh mục dịch vụ...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Category selector pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            backgroundColor: activeCategory === 'ALL' ? 'var(--color-primary)' : 'var(--color-bg)',
            color: activeCategory === 'ALL' ? '#ffffff' : 'var(--color-text)',
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
              onClick={() => setActiveCategory(catKey)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: activeCategory === catKey ? 'var(--color-primary)' : 'var(--color-bg)',
                color: activeCategory === catKey ? '#ffffff' : 'var(--color-text)',
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

      {/* Services Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.875rem',
          maxHeight: '320px',
          overflowY: 'auto',
          paddingRight: '0.25rem',
        }}
      >
        {filteredServices.map((service) => {
          const currentQty = quantities[service.id] || 0;
          return (
            <div
              key={service.id}
              style={{
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: currentQty > 0 ? 'var(--color-primary-light)' : 'var(--color-bg)',
                border: `1px solid ${currentQty > 0 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.875rem' }}>
                  {service.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>
                  {formatVND(service.price)} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {service.unit}</span>
                </div>
              </div>

              {/* Counter Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleQuantityChange(service.id, -1)}
                  disabled={currentQty === 0}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentQty > 0 ? 'pointer' : 'not-allowed',
                    opacity: currentQty > 0 ? 1 : 0.4,
                  }}
                >
                  <Minus size={14} />
                </button>

                <span style={{ fontWeight: 700, fontSize: '0.9375rem', minWidth: '24px', textAlign: 'center' }}>
                  {currentQty}
                </span>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(service.id, 1)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-primary)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note input & Add Button */}
      {selectedCount > 0 && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Đã chọn {selectedCount} mục dịch vụ:
            </span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
              +{formatVND(selectedNewTotal)}
            </strong>
          </div>

          <input
            type="text"
            placeholder="Ghi chú thêm (ví dụ: khách tự lấy tại minibar, giặt lấy ngay...)"
            value={serviceNote}
            onChange={(e) => setServiceNote(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: '0.8125rem',
            }}
          />

          <Button
            variant="primary"
            fullWidth
            onClick={handleAddServices}
            loading={submitting}
            style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}
          >
            <CheckCircle size={16} />
            <span>Ghi nhận vào hóa đơn ({formatVND(selectedNewTotal)})</span>
          </Button>
        </div>
      )}

      {/* Currently Added Services Table */}
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Dịch vụ phòng đã sử dụng ({existingItems.length})
        </div>

        {existingItems.length === 0 ? (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
            Chưa có dịch vụ hay minibar nào được ghi nhận cho phòng này.
          </div>
        ) : (
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '0.35rem 0' }}>Dịch vụ</th>
                  <th style={{ textAlign: 'center', padding: '0.35rem' }}>SL</th>
                  <th style={{ textAlign: 'right', padding: '0.35rem' }}>Đơn giá</th>
                  <th style={{ textAlign: 'right', padding: '0.35rem' }}>Thành tiền</th>
                  <th style={{ textAlign: 'right', padding: '0.35rem 0' }}></th>
                </tr>
              </thead>
              <tbody>
                {existingItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.4rem 0' }}>
                      <div style={{ fontWeight: 600 }}>{item.service.name}</div>
                      {item.note && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.note}</div>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.4rem' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '0.4rem' }}>{formatVND(item.unitPrice)}</td>
                    <td style={{ textAlign: 'right', padding: '0.4rem', fontWeight: 600 }}>{formatVND(item.totalPrice)}</td>
                    <td style={{ textAlign: 'right', padding: '0.4rem 0' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          padding: '0.2rem',
                        }}
                        title="Xóa dịch vụ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelector;
