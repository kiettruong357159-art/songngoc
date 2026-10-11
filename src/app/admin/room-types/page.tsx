'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bed, 
  Edit, 
  Users, 
  Layers, 
  RefreshCw,
  Maximize2,
  Search
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';

interface RoomTypeData {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  weekendPrice?: number | null;
  hourlyPrice?: number | null;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  roomArea: number;
  amenities: string;
  description: string;
  isActive: boolean;
  _count?: {
    rooms: number;
  };
}

export default function AdminRoomTypesPage() {
  const { showToast } = useToast();

  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeData | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [weekendPrice, setWeekendPrice] = useState(0);
  const [hourlyPrice, setHourlyPrice] = useState(0);
  const [maxAdults, setMaxAdults] = useState(2);
  const [maxChildren, setMaxChildren] = useState(1);
  const [bedType, setBedType] = useState('');
  const [roomArea, setRoomArea] = useState(25);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRoomTypes = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/room-types');
      const data = await res.json();
      if (data.success) {
        setRoomTypes(data.roomTypes);
      } else {
        showToast(data.error || 'Không thể tải danh sách hạng phòng', 'error');
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
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  const handleOpenEdit = (rt: RoomTypeData) => {
    setSelectedRoomType(rt);
    setName(rt.name);
    setBasePrice(rt.basePrice);
    setWeekendPrice(rt.weekendPrice || 0);
    setHourlyPrice(rt.hourlyPrice || 0);
    setMaxAdults(rt.maxAdults);
    setMaxChildren(rt.maxChildren);
    setBedType(rt.bedType);
    setRoomArea(rt.roomArea);
    setDescription(rt.description);
    setIsActive(rt.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomType) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/room-types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRoomType.id,
          name,
          basePrice: Number(basePrice),
          weekendPrice: Number(weekendPrice) || null,
          hourlyPrice: Number(hourlyPrice) || null,
          maxAdults: Number(maxAdults),
          maxChildren: Number(maxChildren),
          bedType,
          roomArea: Number(roomArea),
          description,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Đã cập nhật bảng giá hạng phòng ${name}!`, 'success');
        setIsModalOpen(false);
        fetchRoomTypes(true);
      } else {
        showToast(data.error || 'Cập nhật thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi yêu cầu cập nhật', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusFilterOptions: SelectOption[] = [
    { value: 'ALL', label: `Tất cả trạng thái (${roomTypes.length})` },
    { value: 'ACTIVE', label: `Đang kinh doanh (${roomTypes.filter((r) => r.isActive).length})` },
    { value: 'INACTIVE', label: `Tạm ngưng (${roomTypes.filter((r) => !r.isActive).length})` },
  ];

  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter((rt) => {
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' ? rt.isActive : !rt.isActive);

      if (!matchStatus) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return rt.name.toLowerCase().includes(q) || rt.slug.toLowerCase().includes(q);
    });
  }, [roomTypes, statusFilter, search]);

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
            onClick={() => fetchRoomTypes(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Standard Filter Card */}
      <div className="admin-filter-card">
        {/* Search Input */}
        <div className="admin-search-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên hạng phòng, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Status Filter */}
        <div className="admin-filter-control" style={{ width: '220px' }}>
          <CustomSelect
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Lọc trạng thái..."
          />
        </div>
      </div>

      {/* Room Types Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
          <div>Đang tải cấu hình hạng phòng...</div>
        </div>
      ) : filteredRoomTypes.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          Không có hạng phòng nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredRoomTypes.map((rt) => (
            <div
              key={rt.id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {rt.name}
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      Slug: {rt.slug}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: rt.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: rt.isActive ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}
                  >
                    {rt.isActive ? 'Đang kinh doanh' : 'Tạm ngưng'}
                  </span>
                </div>

                {/* Specs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.625rem',
                    margin: '1rem 0',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bed size={15} style={{ color: 'var(--color-text-muted)' }} />
                    <span>{rt.bedType}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Maximize2 size={15} style={{ color: 'var(--color-text-muted)' }} />
                    <span>{rt.roomArea} m²</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={15} style={{ color: 'var(--color-text-muted)' }} />
                    <span>{rt.maxAdults} Lớn, {rt.maxChildren} Trẻ</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={15} style={{ color: 'var(--color-text-muted)' }} />
                    <span>{rt._count?.rooms || 0} phòng thực tế</span>
                  </div>
                </div>

                {/* Pricing Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Giá ngày thường:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{formatVND(rt.basePrice)} / đêm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Giá cuối tuần (T6-T7):</span>
                    <span>{rt.weekendPrice ? `${formatVND(rt.weekendPrice)} / đêm` : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Nghỉ theo giờ:</span>
                    <span>{rt.hourlyPrice ? `${formatVND(rt.hourlyPrice)} / 2h đầu` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleOpenEdit(rt)}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit size={14} />
                <span>Chỉnh sửa giá & Cấu hình</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Cấu Hình Bảng Giá - ${selectedRoomType?.name}`}
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tên hạng phòng <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Giá thường (VNĐ) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="number"
                required
                min={50000}
                step={10000}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontWeight: 700,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Giá cuối tuần (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Nghỉ giờ (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Max Lớn
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxAdults}
                onChange={(e) => setMaxAdults(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Max Trẻ
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={maxChildren}
                onChange={(e) => setMaxChildren(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Diện tích (m²)
              </label>
              <input
                type="number"
                step={0.5}
                value={roomArea}
                onChange={(e) => setRoomArea(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Loại giường
              </label>
              <input
                type="text"
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="roomTypeActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="roomTypeActiveCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
              Mở bán hạng phòng này trên website & quầy
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
