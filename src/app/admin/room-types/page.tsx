'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bed, 
  Edit, 
  Users, 
  Layers, 
  RefreshCw,
  Maximize2,
  Search,
  Plus,
  Trash2,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import SafeImage from '@/components/ui/SafeImage';
import RoomTypeModal, { RoomTypeFormData } from '@/components/admin/RoomTypeModal';
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
  images: string;
  description: string;
  policies?: string | null;
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

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeFormData | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; roomCount: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedRoomType(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rt: RoomTypeData) => {
    setSelectedRoomType(rt);
    setIsModalOpen(true);
  };

  // Open Delete Confirmation
  const handlePromptDelete = (rt: RoomTypeData) => {
    const roomCount = rt._count?.rooms || 0;
    if (roomCount > 0) {
      showToast(
        `Hạng phòng "${rt.name}" đang có ${roomCount} phòng thực tế. Bạn nên chuyển các phòng trước hoặc chuyển sang Tạm ngưng kinh doanh.`,
        'error'
      );
    }
    setDeleteConfirm({
      id: rt.id,
      name: rt.name,
      roomCount,
    });
  };

  // Execute Deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/room-types/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message || `Đã xóa hạng phòng "${deleteConfirm.name}" thành công!`, 'success');
        setDeleteConfirm(null);
        fetchRoomTypes(true);
      } else {
        showToast(data.error || 'Xóa hạng phòng thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối khi xóa hạng phòng', 'error');
    } finally {
      setDeleting(false);
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

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus size={16} />}
          >
            Thêm hạng phòng
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
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--color-primary)' }} />
          <div>Đang tải cấu hình hạng phòng...</div>
        </div>
      ) : filteredRoomTypes.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredRoomTypes.map((rt) => {
            // Parse images
            let imageList: string[] = [];
            try {
              imageList = typeof rt.images === 'string' ? JSON.parse(rt.images) : rt.images;
              if (!Array.isArray(imageList)) imageList = [];
            } catch {
              imageList = [];
            }
            const coverImage = imageList[0] || '';

            // Parse amenities
            let amenityList: string[] = [];
            try {
              amenityList = typeof rt.amenities === 'string' ? JSON.parse(rt.amenities) : rt.amenities;
              if (!Array.isArray(amenityList)) amenityList = [];
            } catch {
              amenityList = [];
            }

            return (
              <div
                key={rt.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <div>
                  {/* Image Cover Preview */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '180px',
                      backgroundColor: 'var(--color-bg)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <SafeImage
                      src={coverImage}
                      alt={rt.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Camera size={13} />
                      <span>{imageList.length} ảnh</span>
                    </div>

                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: rt.isActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(107, 114, 128, 0.9)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {rt.isActive ? 'Đang kinh doanh' : 'Tạm ngưng'}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    {/* Header info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {rt.name}
                        </h3>
                        <div style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          Slug: <code>{rt.slug}</code>
                        </div>
                      </div>
                    </div>

                    {/* Specs Grid */}
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

                    {/* Amenities Badges Preview */}
                    {amenityList.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                        {amenityList.slice(0, 4).map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(15, 76, 58, 0.08)',
                              color: 'var(--color-primary)',
                              fontWeight: 600,
                            }}
                          >
                            {item.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {amenityList.length > 4 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                            +{amenityList.length - 4} tiện nghi khác
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pricing Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Giá thường:</span>
                        <strong style={{ color: 'var(--color-primary)' }}>{formatVND(rt.basePrice)} / đêm</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Giá cuối tuần (T6-T7):</span>
                        <span>{rt.weekendPrice ? `${formatVND(rt.weekendPrice)} / đêm` : '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Nghỉ theo giờ:</span>
                        <span>{rt.hourlyPrice ? `${formatVND(rt.hourlyPrice)} / 2h` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '1rem 1.25rem',
                    borderTop: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleOpenEdit(rt)}
                    leftIcon={<Edit size={14} />}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptDelete(rt)}
                    style={{
                      color: 'var(--color-error)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                    title="Xóa hạng phòng này"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Type Create / Edit Modal */}
      <RoomTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchRoomTypes(true)}
        roomType={selectedRoomType}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Xác Nhận Xóa Hạng Phòng"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-error)' }}>
            <AlertTriangle size={24} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              Bạn có chắc chắn muốn xóa hạng phòng này?
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
            Hạng phòng: <strong>{deleteConfirm?.name}</strong>
          </p>

          {deleteConfirm && deleteConfirm.roomCount > 0 ? (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '0.8125rem',
                color: 'var(--color-error)',
                lineHeight: 1.4,
              }}
            >
              ⚠️ Cảnh báo: Hiện có <strong>{deleteConfirm.roomCount} phòng thực tế</strong> đang thuộc hạng phòng này. Hệ thống sẽ từ chối xóa vì ràng buộc an toàn dữ liệu. Bạn hãy chọn &quot;Tạm ngưng kinh doanh&quot; thay vì xóa.
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Lưu ý: Hành động này không thể hoàn tác sau khi đã xóa khỏi cơ sở dữ liệu.
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={deleting}
              onClick={handleConfirmDelete}
              style={{
                backgroundColor: 'var(--color-error)',
                borderColor: 'var(--color-error)',
                color: '#ffffff',
              }}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
