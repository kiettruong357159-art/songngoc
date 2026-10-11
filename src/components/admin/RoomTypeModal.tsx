'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  Star, 
  Plus, 
  Sparkles, 
  Link as LinkIcon,
  Check,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SafeImage, { isValidImageSrc } from '@/components/ui/SafeImage';
import { useToast } from '@/context/ToastContext';
import { AmenityIcon } from '@/components/admin/AmenityIcon';

export interface RoomTypeFormData {
  id?: string;
  name: string;
  slug?: string;
  basePrice: number;
  weekendPrice?: number | null;
  hourlyPrice?: number | null;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  roomArea: number;
  amenities: string; // JSON string or parsed
  images: string; // JSON string or parsed
  description: string;
  policies?: string | null;
  isActive: boolean;
}

export const DEFAULT_HOTEL_POLICIES = [
  'Nhận phòng từ 14:00 - Trả phòng trước 12:00 trưa hôm sau.',
  'Quý khách vui lòng xuất trình CCCD/Hộ chiếu khi làm thủ tục nhận phòng tại quầy lễ tân.',
  'Không hút thuốc lá trong phòng nghỉ; khu vực ban công và ngoài trời có gạt tàn riêng.',
  'Không mang thú cưng, chất dễ cháy nổ hoặc các chất cấm vào khuôn viên Homestay.',
  'Giữ yên lặng sau 22:00 để đảm bảo không gian nghỉ ngơi thư thái cho mọi khách lưu trú.',
  'Phụ thu nhận phòng sớm hoặc trả phòng trễ tùy thuộc vào tình trạng phòng thực tế của Homestay.',
].join('\n');

interface RoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomType?: RoomTypeFormData | null;
}

const POPULAR_AMENITIES = [
  { key: 'wifi', label: 'Wifi tốc độ cao' },
  { key: 'air_con', label: 'Máy lạnh / Điều hòa' },
  { key: 'tv_smart', label: 'Smart TV' },
  { key: 'hot_water', label: 'Bình nước nóng' },
  { key: 'balcony', label: 'Ban công thoáng mát' },
  { key: 'window', label: 'Cửa sổ lớn đón gió' },
  { key: 'bathtub', label: 'Bồn tắm thư giãn' },
  { key: 'fridge', label: 'Tủ lạnh mini' },
  { key: 'hairdryer', label: 'Máy sấy tóc' },
  { key: 'kettle', label: 'Ấm đun siêu tốc' },
  { key: 'desk', label: 'Bàn làm việc' },
  { key: 'safe_box', label: 'Két sắt an toàn' },
  { key: 'city_view', label: 'Tầm nhìn hướng phố' },
  { key: 'garden_view', label: 'Tầm nhìn hướng vườn' },
  { key: 'kitchen', label: 'Khu vực bếp nấu' },
  { key: 'iron', label: 'Bàn ủi / Bàn là' },
  { key: 'bathrobe', label: 'Áo choàng tắm' },
  { key: 'slippers', label: 'Dép đi trong phòng' },
  { key: 'soundproof', label: 'Cách âm cao cấp' },
  { key: 'blackout_curtains', label: 'Rèm cản sáng' },
];

export default function RoomTypeModal({
  isOpen,
  onClose,
  onSuccess,
  roomType,
}: RoomTypeModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(roomType?.id);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [basePrice, setBasePrice] = useState(450000);
  const [weekendPrice, setWeekendPrice] = useState<number | string>('');
  const [hourlyPrice, setHourlyPrice] = useState<number | string>('');
  const [maxAdults, setMaxAdults] = useState(2);
  const [maxChildren, setMaxChildren] = useState(1);
  const [bedType, setBedType] = useState('1 Giường đôi King');
  const [roomArea, setRoomArea] = useState(28);
  const [description, setDescription] = useState('');
  const [policies, setPolicies] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Amenities state
  const [amenities, setAmenities] = useState<string[]>(['wifi', 'air_con', 'hot_water']);
  const [availableAmenities, setAvailableAmenities] = useState<Array<{ code: string; name: string; icon: string; category: string }>>([]);
  const [customAmenity, setCustomAmenity] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Nạp danh mục tiện nghi động từ CSDL khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/admin/amenities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.amenities) && data.amenities.length > 0) {
          setAvailableAmenities(data.amenities);
        }
      })
      .catch((err) => {
        console.error('Error fetching amenities for modal:', err);
      });
  }, [isOpen]);

  // Reset or fill form on open
  useEffect(() => {
    if (!isOpen) return;

    if (roomType) {
      setName(roomType.name || '');
      setSlug(roomType.slug || '');
      setBasePrice(roomType.basePrice || 0);
      setWeekendPrice(roomType.weekendPrice ?? '');
      setHourlyPrice(roomType.hourlyPrice ?? '');
      setMaxAdults(roomType.maxAdults ?? 2);
      setMaxChildren(roomType.maxChildren ?? 1);
      setBedType(roomType.bedType || '1 Giường đôi');
      setRoomArea(roomType.roomArea || 25);
      setDescription(roomType.description || '');
      setPolicies(roomType.policies || '');
      setIsActive(roomType.isActive ?? true);

      // Parse images (chỉ nạp ảnh có đường dẫn hợp lệ)
      try {
        const parsedImgs = typeof roomType.images === 'string' ? JSON.parse(roomType.images) : roomType.images;
        const validImgs = Array.isArray(parsedImgs) ? parsedImgs.filter((img) => isValidImageSrc(img)) : [];
        setImages(validImgs);
      } catch {
        setImages([]);
      }

      // Parse amenities
      try {
        const parsedAms = typeof roomType.amenities === 'string' ? JSON.parse(roomType.amenities) : roomType.amenities;
        setAmenities(Array.isArray(parsedAms) ? parsedAms : ['wifi', 'air_con', 'hot_water']);
      } catch {
        setAmenities(['wifi', 'air_con', 'hot_water']);
      }
    } else {
      // Create defaults
      setName('');
      setSlug('');
      setBasePrice(450000);
      setWeekendPrice('');
      setHourlyPrice('');
      setMaxAdults(2);
      setMaxChildren(1);
      setBedType('1 Giường đôi King');
      setRoomArea(28);
      setDescription('');
      setPolicies('');
      setIsActive(true);
      setImages([]);
      setAmenities(['wifi', 'air_con', 'hot_water']);
    }
    setCustomImageUrl('');
    setCustomAmenity('');
  }, [isOpen, roomType]);

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setImages((prev) => [...prev, data.url]);
        showToast('Tải ảnh phòng lên thành công!', 'success');
      } else {
        showToast(data.error || 'Tải ảnh thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải tệp hình ảnh lên máy chủ', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add custom URL image
  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập đường dẫn URL hình ảnh', 'error');
      return;
    }
    if (!isValidImageSrc(trimmed)) {
      showToast('Đường dẫn ảnh không hợp lệ. Vui lòng nhập URL bắt đầu bằng https://, http:// hoặc /', 'error');
      return;
    }
    if (images.includes(trimmed)) {
      showToast('Hình ảnh này đã có trong danh sách', 'error');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setCustomImageUrl('');
    showToast('Đã thêm đường dẫn ảnh vào danh sách', 'success');
  };

  // Remove image
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((item, idx) => item !== undefined && idx !== indexToRemove));
  };

  // Set as primary/cover image (move to index 0)
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((item, i) => item !== undefined && i !== index);
      return [target, ...rest];
    });
    showToast('Đã đặt làm ảnh đại diện chính!', 'success');
  };

  // Toggle amenity
  const handleToggleAmenity = (key: string) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Add custom amenity
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên tiện nghi', 'error');
      return;
    }
    const exists = amenities.some(
      (a) => a.toLowerCase() === trimmed.toLowerCase() || a.toLowerCase() === trimmed.toLowerCase().replace(/\s+/g, '_')
    );
    if (exists) {
      showToast('Tiện nghi này đã có trong danh sách', 'error');
      return;
    }
    setAmenities((prev) => [...prev, trimmed]);
    setCustomAmenity('');
    showToast(`Đã thêm tiện nghi "${trimmed}"!`, 'success');
  };

  const handleRemoveCustomAmenity = (keyToRemove: string) => {
    setAmenities((prev) => prev.filter((item) => item !== keyToRemove));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên hạng phòng', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...(isEditing ? { id: roomType?.id } : {}),
        name: name.trim(),
        slug: slug.trim() || undefined,
        basePrice: Number(basePrice),
        weekendPrice: weekendPrice ? Number(weekendPrice) : null,
        hourlyPrice: hourlyPrice ? Number(hourlyPrice) : null,
        maxAdults: Number(maxAdults),
        maxChildren: Number(maxChildren),
        bedType: bedType.trim(),
        roomArea: Number(roomArea),
        amenities,
        images,
        description: description.trim(),
        policies: policies.trim() || null,
        isActive,
      };

      const res = await fetch('/api/admin/room-types', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          isEditing ? `Đã cập nhật hạng phòng "${name}"!` : `Đã tạo mới hạng phòng "${name}" thành công!`,
          'success'
        );
        onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Thao tác không thành công', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối khi lưu hạng phòng', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Chỉnh Sửa Hạng Phòng - ${roomType?.name}` : 'Thêm Hạng Phòng Mới'}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Thông tin cơ bản */}
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            1. Thông Tin Nhận Diện
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tên hạng phòng <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Phòng Đôi Deluxe Ban Công"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Slug định danh URL (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Tự động sinh nếu để trống..."
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Quản lý Hình Ảnh Phòng */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={17} />
                <span>2. Quản Lý Hình Ảnh Phòng ({images.length})</span>
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                Ảnh đầu tiên sẽ là ảnh đại diện chính hiển thị trên website.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<UploadCloud size={15} />}
              >
                Tải ảnh từ máy tính
              </Button>
            </div>
          </div>

          {/* Input dán URL */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <LinkIcon size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="url"
                placeholder="Hoặc dán liên kết ảnh trực tuyến (https://images.unsplash.com/...)"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddImageUrl}
              leftIcon={<Plus size={14} />}
            >
              Thêm link
            </Button>
          </div>

          {/* Lưới ảnh Thumbnails */}
          {images.length === 0 ? (
            <div
              style={{
                padding: '1.75rem 1rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.8125rem',
              }}
            >
              <UploadCloud size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <div>Chưa có hình ảnh nào cho hạng phòng này.</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Bấm nút <strong>&quot;Tải ảnh từ máy tính&quot;</strong> hoặc dán link online để thêm ảnh.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.75rem',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '0.25rem',
              }}
            >
              {images.map((imgUrl, index) => {
                const isCover = index === 0;
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: isCover ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      aspectRatio: '4/3',
                      backgroundColor: 'var(--color-bg)',
                    }}
                  >
                    <SafeImage
                      src={imgUrl}
                      alt={`Ảnh ${index + 1}`}
                      fill
                      sizes="150px"
                      style={{ objectFit: 'cover' }}
                    />

                    {/* Badge Cover */}
                    {isCover && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          backgroundColor: 'var(--color-primary)',
                          color: '#ffffff',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          zIndex: 2,
                        }}
                      >
                        <Star size={10} fill="#ffffff" />
                        Ảnh bìa
                      </span>
                    )}

                    {/* Controls overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        opacity: 0,
                        transition: 'opacity var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        zIndex: 3,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(index)}
                          title="Đặt làm ảnh đại diện"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#ffffff',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        title="Xóa ảnh này"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#ffffff',
                          color: 'var(--color-error)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Cấu hình Bảng giá */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            3. Cấu Hình Bảng Giá
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Giá ngày thường (VNĐ) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="number"
                required
                min={0}
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
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Giá cuối tuần T6-T7 (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                placeholder="Mặc định theo giá thường"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value ? Number(e.target.value) : '')}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Nghỉ theo giờ (2h đầu)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                placeholder="Để trống nếu không áp dụng"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value ? Number(e.target.value) : '')}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Thông số phòng & Tiện nghi */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            4. Thông Số & Tiện Nghi
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tối đa Người lớn
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={maxAdults}
                onChange={(e) => setMaxAdults(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tối đa Trẻ em
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={maxChildren}
                onChange={(e) => setMaxChildren(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
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
                min={10}
                value={roomArea}
                onChange={(e) => setRoomArea(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Loại giường
              </label>
              <input
                type="text"
                placeholder="1 Giường King, 2 Giường đơn..."
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Badges Tiện nghi */}
          <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Trang thiết bị & Tiện nghi phòng:</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                Đã chọn: {amenities.length} tiện nghi
              </span>
            </div>

            {/* Hiển thị tiện nghi nhóm theo danh mục nếu có availableAmenities, nếu không fallback về POPULAR_AMENITIES */}
            {availableAmenities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {[
                  { key: 'GENERAL', label: 'Tiện nghi chung' },
                  { key: 'BEDROOM', label: 'Phòng ngủ & Nghỉ ngơi' },
                  { key: 'BATHROOM', label: 'Phòng tắm & Vệ sinh' },
                  { key: 'MEDIA', label: 'Công nghệ & Giải trí' },
                ].map((group) => {
                  const groupAmenities = availableAmenities.filter((a) => a.category === group.key);
                  if (groupAmenities.length === 0) return null;
                  return (
                    <div key={group.key}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        {group.label}:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {groupAmenities.map((item) => {
                          const isSelected = amenities.includes(item.code);
                          return (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => handleToggleAmenity(item.code)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.7rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg)',
                                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                              }}
                            >
                              {isSelected ? <Check size={12} /> : <AmenityIcon icon={item.icon} size={13} />}
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                {POPULAR_AMENITIES.map((item) => {
                  const isSelected = amenities.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleAmenity(item.key)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.7rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom Amenities Added by User */}
            {amenities.filter((a) => {
              const inAvailable = availableAmenities.some((p) => p.code === a);
              const inPopular = POPULAR_AMENITIES.some((p) => p.key === a);
              return !inAvailable && !inPopular;
            }).length > 0 && (
              <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Tiện nghi tự thêm:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {amenities
                    .filter((a) => {
                      const inAvailable = availableAmenities.some((p) => p.code === a);
                      const inPopular = POPULAR_AMENITIES.some((p) => p.key === a);
                      return !inAvailable && !inPopular;
                    })
                    .map((customItem) => (
                      <span
                        key={customItem}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                        }}
                      >
                        <Check size={12} />
                        <span>{customItem.replace(/_/g, ' ')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomAmenity(customItem)}
                          title="Xóa tiện nghi này"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-error)',
                            cursor: 'pointer',
                            padding: '0 0.15rem',
                            marginLeft: '0.2rem',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Thêm tiện nghi tùy chọn */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Nhập tên tiện nghi khác (vd: Bồn tắm đứng, View núi, Máy pha cà phê...)"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomAmenity();
                }
              }}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '0.8125rem',
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomAmenity}
              leftIcon={<Plus size={14} />}
            >
              Thêm tiện nghi
            </Button>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Mô tả chi tiết phòng
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả không gian, tầm nhìn, ánh sáng và trải nghiệm lưu trú..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        {/* Section 5: Chính Sách Khách Sạn & Nhận Phòng */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
              5. Chính Sách Khách Sạn & Nhận Phòng
            </h4>
            <button
              type="button"
              onClick={() => setPolicies(DEFAULT_HOTEL_POLICIES)}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Nạp chính sách mặc định
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            Nhập các điều khoản quy định cho hạng phòng này (mỗi dòng là một gạch đầu dòng hiển thị ngoài trang chi tiết phòng). Nếu để trống, hệ thống sẽ tự động hiển thị chính sách tiêu chuẩn của Homestay.
          </p>
          <textarea
            rows={5}
            placeholder="Nhận phòng từ 14:00 - Trả phòng trước 12:00 trưa hôm sau&#10;Xuất trình CCCD/Hộ chiếu khi nhận phòng&#10;Không hút thuốc lá trong phòng nghỉ..."
            value={policies}
            onChange={(e) => setPolicies(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical',
            }}
          />
        </div>

        {/* Trạng thái mở bán */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <input
            type="checkbox"
            id="roomTypeModalActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="roomTypeModalActive" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Mở bán hạng phòng này trên website & quầy lễ tân
          </label>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            leftIcon={<Sparkles size={16} />}
          >
            {isEditing ? 'Lưu Thay Đổi' : 'Tạo Hạng Phòng Mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
