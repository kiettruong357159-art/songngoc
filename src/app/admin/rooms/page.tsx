'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Filter, 
  Layers, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Wrench,
  Search
} from 'lucide-react';
import { RoomData } from '@/components/pms/RoomCard';
import FloorSection from '@/components/pms/FloorSection';
import QuickActionModal from '@/components/pms/QuickActionModal';
import { RoomStatus, ROOM_STATUS_META } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';

interface FloorData {
  id: string;
  name: string;
  floorNumber: number;
  rooms: RoomData[];
}

export default function AdminRoomsPage() {
  const { showToast } = useToast();
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedFloorId, setSelectedFloorId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected room for QuickActionModal
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRooms = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      if (data.success && Array.isArray(data.floors)) {
        setFloors(data.floors);
      } else {
        showToast(data.error || 'Không thể tải sơ đồ phòng', 'error');
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
            Sơ Đồ Buồng Phòng (Room Rack)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Hiển thị trực quan trạng thái vận hành của toàn bộ phòng homestay theo từng tầng.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Top Controls: Search and Floor Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Floor selection tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '0.25rem' }}>
              Tầng:
            </span>
            <button
              onClick={() => setSelectedFloorId('ALL')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: selectedFloorId === 'ALL' ? 'var(--color-primary)' : 'var(--color-bg)',
                color: selectedFloorId === 'ALL' ? '#ffffff' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              Tất cả các tầng
            </button>
            {floors.map((fl) => (
              <button
                key={fl.id}
                onClick={() => setSelectedFloorId(fl.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: selectedFloorId === fl.id ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: selectedFloorId === fl.id ? '#ffffff' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {fl.name}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div style={{ position: 'relative', minWidth: '240px', maxWidth: '320px', flex: 1 }}>
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
              placeholder="Tìm số phòng, tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
              }}
            />
          </div>
        </div>

        {/* Status Pills with Counters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '0.25rem' }}>
            Trạng thái:
          </span>

          {/* ALL */}
          <button
            onClick={() => setSelectedStatus('ALL')}
            style={{
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
            floorName={floor.name}
            floorNumber={floor.floorNumber}
            rooms={floor.rooms}
            onRoomClick={handleRoomClick}
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
      />
    </div>
  );
}
