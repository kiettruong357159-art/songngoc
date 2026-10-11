'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RefreshCw, 
  AlertCircle,
  Search,
  Plus,
  Layers,
  Trash2
} from 'lucide-react';
import { RoomData } from '@/components/pms/RoomCard';
import FloorSection from '@/components/pms/FloorSection';
import QuickActionModal from '@/components/pms/QuickActionModal';
import FloorModal from '@/components/admin/FloorModal';
import RoomModal from '@/components/admin/RoomModal';
import Modal from '@/components/ui/Modal';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { RoomStatus, ROOM_STATUS_META } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';

interface FloorData {
  id: string;
  name: string;
  floorNumber: number;
  rooms: RoomData[];
}

interface RoomTypeSummary {
  id: string;
  name: string;
  basePrice: number;
}

export default function AdminRoomsPage() {
  const { showToast } = useToast();
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedFloorId, setSelectedFloorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected room for QuickActionModal
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modals for Floor and Room CRUD
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [floorToEdit, setFloorToEdit] = useState<{ id: string; name: string; floorNumber: number } | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<RoomData | null>(null);
  const [activeFloorIdForNewRoom, setActiveFloorIdForNewRoom] = useState<string | undefined>(undefined);

  // Delete Confirmation Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'floor' | 'room';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRooms = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [roomsRes, roomTypesRes] = await Promise.all([
        fetch('/api/admin/rooms'),
        fetch('/api/admin/room-types'),
      ]);

      const roomsData = await roomsRes.json();
      if (roomsData.success && Array.isArray(roomsData.floors)) {
        setFloors(roomsData.floors);
      } else {
        showToast(roomsData.error || 'Không thể tải sơ đồ phòng', 'error');
      }

      const typesData = await roomTypesRes.json();
      if (typesData.success && Array.isArray(typesData.roomTypes)) {
        setRoomTypes(
          typesData.roomTypes.map((rt: any) => ({
            id: rt.id,
            name: rt.name,
            basePrice: rt.basePrice,
          }))
        );
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
    fetchRooms();
  }, [fetchRooms]);

  const handleRoomClick = (room: RoomData) => {
    setActiveRoom(room);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus, note?: string) => {
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });
      const data = await res.json();

      if (data.success && data.room) {
        showToast(`Đã cập nhật phòng ${data.room.roomNumber} sang "${ROOM_STATUS_META[newStatus]?.label || newStatus}"`, 'success');
        
        // Cập nhật state cục bộ ngay lập tức
        setFloors((prevFloors) =>
          prevFloors.map((floor) => ({
            ...floor,
            rooms: floor.rooms.map((r) => (r.id === roomId ? { ...r, ...data.room } : r)),
          }))
        );
      } else {
        showToast(data.error || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi yêu cầu cập nhật', 'error');
    }
  };

  // Floor CRUD handlers
  const handleAddFloor = () => {
    setFloorToEdit(null);
    setIsFloorModalOpen(true);
  };

  const handleEditFloor = (floor: { id: string; name: string; floorNumber: number }) => {
    setFloorToEdit(floor);
    setIsFloorModalOpen(true);
  };

  const handleDeleteFloor = (floor: { id: string; name: string; floorNumber: number; roomCount: number }) => {
    if (floor.roomCount > 0) {
      showToast(
        `Không thể xóa "${floor.name}" vì đang có ${floor.roomCount} phòng. Vui lòng chuyển hoặc xóa các phòng trước.`,
        'error'
      );
      return;
    }
    setDeleteConfirm({
      type: 'floor',
      id: floor.id,
      name: floor.name,
    });
  };

  // Room CRUD handlers
  const handleAddRoom = (floorId?: string) => {
    setRoomToEdit(null);
    setActiveFloorIdForNewRoom(floorId);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: RoomData) => {
    setRoomToEdit(room);
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoom = (room: RoomData) => {
    if (room.status === 'OCCUPIED') {
      showToast(`Không thể xóa phòng ${room.roomNumber} vì đang có khách lưu trú!`, 'error');
      return;
    }
    setDeleteConfirm({
      type: 'room',
      id: room.id,
      name: `Phòng ${room.roomNumber}`,
    });
  };

  // Execute safe deletion
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const url =
        deleteConfirm.type === 'floor'
          ? `/api/admin/floors/${deleteConfirm.id}`
          : `/api/admin/rooms/${deleteConfirm.id}`;

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Đã xóa ${deleteConfirm.name} thành công`, 'success');
        setDeleteConfirm(null);
        fetchRooms(true);
      } else {
        showToast(data.error || 'Xóa thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ khi xóa', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Tính tổng số phòng theo từng trạng thái
  const allRoomsFlat = floors.flatMap((f) => f.rooms);
  const counts = {
    ALL: allRoomsFlat.length,
    AVAILABLE: allRoomsFlat.filter((r) => r.status === 'AVAILABLE').length,
    OCCUPIED: allRoomsFlat.filter((r) => r.status === 'OCCUPIED').length,
    DIRTY: allRoomsFlat.filter((r) => r.status === 'DIRTY').length,
    CLEANING: allRoomsFlat.filter((r) => r.status === 'CLEANING').length,
    MAINTENANCE: allRoomsFlat.filter((r) => r.status === 'MAINTENANCE').length,
  };

  // Lọc theo tầng, trạng thái và từ khóa tìm kiếm số phòng
  const filteredFloors = floors
    .filter((floor) => selectedFloorId === 'ALL' || floor.id === selectedFloorId)
    .map((floor) => {
      const filteredRooms = floor.rooms.filter((room) => {
        const matchStatus = selectedStatus === 'ALL' || room.status === selectedStatus;
        const matchSearch =
          !searchQuery.trim() ||
          room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.roomType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.currentBooking?.guest.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
      });

      return {
        ...floor,
        rooms: filteredRooms,
      };
    })
    .filter((floor) => floor.rooms.length > 0 || selectedFloorId !== 'ALL');

  // Options cho bộ lọc Tầng (hỗ trợ scale tối ưu khi có nhiều tầng)
  const floorOptions: SelectOption[] = useMemo(() => [
    { value: 'ALL', label: `Tất cả các tầng (${allRoomsFlat.length} phòng)` },
    ...floors.map((fl) => ({
      value: fl.id,
      label: `${fl.name} (${fl.rooms.length} phòng)`,
    })),
  ], [floors, allRoomsFlat.length]);

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
            onClick={() => fetchRooms(true)}
            loading={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddFloor}
            leftIcon={<Layers size={15} />}
          >
            Thêm tầng
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleAddRoom()}
            leftIcon={<Plus size={15} />}
          >
            Thêm phòng
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar (Chuẩn hóa chống vỡ layout khi nhiều tầng & data lớn) */}
      <div
        className="admin-filter-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Top Controls: Search and Floor Dropdown */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.875rem',
            width: '100%',
          }}
        >
          {/* Quick Search Input */}
          <div className="admin-search-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm số phòng, tên khách, hạng phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {/* Floor Selection Dropdown (CustomSelect - Chống vỡ khi có 10, 50 hay 100 tầng) */}
          <div className="admin-filter-control" style={{ minWidth: '240px' }}>
            <CustomSelect
              options={floorOptions}
              value={selectedFloorId}
              onChange={(val) => setSelectedFloorId(val)}
              placeholder="Lọc theo tầng..."
            />
          </div>
        </div>

        {/* Status Pills with Counters (Cuộn ngang mượt mà, chống bẻ dòng khi nhiều data) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', flexShrink: 0, marginRight: '0.25rem' }}>
            Trạng thái:
          </span>

          {/* ALL */}
          <button
            onClick={() => setSelectedStatus('ALL')}
            style={{
              flexShrink: 0,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedStatus === 'ALL' ? 'var(--color-primary)' : 'transparent',
              color: selectedStatus === 'ALL' ? '#ffffff' : 'var(--color-text)',
              border: `1px solid ${selectedStatus === 'ALL' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer',
            }}
          >
            Tất cả ({counts.ALL})
          </button>

          {/* AVAILABLE */}
          <button
            onClick={() => setSelectedStatus('AVAILABLE')}
            style={{
              flexShrink: 0,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedStatus === 'AVAILABLE' ? 'var(--color-success)' : 'rgba(16, 185, 129, 0.1)',
              color: selectedStatus === 'AVAILABLE' ? '#ffffff' : 'var(--color-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
            }}
          >
            Đang trống ({counts.AVAILABLE})
          </button>

          {/* OCCUPIED */}
          <button
            onClick={() => setSelectedStatus('OCCUPIED')}
            style={{
              flexShrink: 0,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedStatus === 'OCCUPIED' ? 'var(--color-error)' : 'rgba(239, 68, 68, 0.1)',
              color: selectedStatus === 'OCCUPIED' ? '#ffffff' : 'var(--color-error)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
            }}
          >
            Có khách ({counts.OCCUPIED})
          </button>

          {/* DIRTY */}
          <button
            onClick={() => setSelectedStatus('DIRTY')}
            style={{
              flexShrink: 0,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedStatus === 'DIRTY' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
              color: selectedStatus === 'DIRTY' ? '#ffffff' : '#b45309',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer',
            }}
          >
            Cần dọn ({counts.DIRTY})
          </button>

          {/* CLEANING */}
          <button
            onClick={() => setSelectedStatus('CLEANING')}
            style={{
              flexShrink: 0,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedStatus === 'CLEANING' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
              color: selectedStatus === 'CLEANING' ? '#ffffff' : '#1d4ed8',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
            }}
          >
            Đang dọn ({counts.CLEANING})
          </button>

          {/* MAINTENANCE */}
          <button
            onClick={() => setSelectedStatus('MAINTENANCE')}
            style={{
              flexShrink: 0,
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: selectedStatus === 'MAINTENANCE' ? '#6b7280' : 'rgba(107, 114, 128, 0.1)',
              color: selectedStatus === 'MAINTENANCE' ? '#ffffff' : '#4b5563',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              cursor: 'pointer',
            }}
          >
            Bảo trì ({counts.MAINTENANCE})
          </button>
        </div>
      </div>

      {/* Main Floor Sections Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Đang tải sơ đồ phòng...</p>
        </div>
      ) : filteredFloors.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <AlertCircle size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Không tìm thấy phòng phù hợp
          </h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Vui lòng thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
          </p>
          <div style={{ marginTop: '1.25rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFloorId('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
            >
              Đặt lại tất cả bộ lọc
            </Button>
          </div>
        </div>
      ) : (
        filteredFloors.map((floor) => (
          <FloorSection
            key={floor.id}
            floorId={floor.id}
            floorName={floor.name}
            floorNumber={floor.floorNumber}
            rooms={floor.rooms}
            onRoomClick={handleRoomClick}
            onAddRoom={() => handleAddRoom(floor.id)}
            onEditFloor={handleEditFloor}
            onDeleteFloor={handleDeleteFloor}
          />
        ))
      )}

      {/* Quick Action Modal for selected room */}
      <QuickActionModal
        room={activeRoom}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveRoom(null);
        }}
        onStatusChange={handleStatusChange}
        onEditRoom={handleEditRoom}
        onDeleteRoom={handleDeleteRoom}
      />

      {/* Floor CRUD Modal */}
      <FloorModal
        isOpen={isFloorModalOpen}
        onClose={() => {
          setIsFloorModalOpen(false);
          setFloorToEdit(null);
        }}
        floorToEdit={floorToEdit}
        suggestedFloorNumber={floors.length + 1}
        onSuccess={() => fetchRooms(true)}
      />

      {/* Room CRUD Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setRoomToEdit(null);
          setActiveFloorIdForNewRoom(undefined);
        }}
        roomToEdit={roomToEdit}
        defaultFloorId={activeFloorIdForNewRoom}
        floors={floors.map((f) => ({ id: f.id, name: f.name, floorNumber: f.floorNumber }))}
        roomTypes={roomTypes}
        onSuccess={() => fetchRooms(true)}
      />

      {/* Safe Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => !isDeleting && setDeleteConfirm(null)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-error)' }}>
            <Trash2 size={20} />
            <span>Xác nhận xóa {deleteConfirm?.type === 'floor' ? 'tầng' : 'phòng'}</span>
          </div>
        }
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: 'var(--color-text)', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>
            Bạn có chắc chắn muốn xóa <strong>{deleteConfirm?.name}</strong> khỏi hệ thống không?
            Hành động này sẽ xóa vĩnh viễn dữ liệu.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={executeDelete}
              loading={isDeleting}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
