import React from 'react';
import {
  Wifi,
  Snowflake,
  Tv,
  Bath,
  Flame,
  Sun,
  Wind,
  Refrigerator,
  Coffee,
  Laptop,
  Shield,
  Building,
  Trees,
  Utensils,
  Shirt,
  Sparkles,
  Footprints,
  VolumeX,
  Moon,
  Bell,
  Music,
  Lock,
  Car,
  Eye,
  Heart,
  BedDouble,
  Key,
} from 'lucide-react';

export const AMENITY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  wifi: Wifi,
  snowflake: Snowflake,
  tv: Tv,
  bath: Bath,
  flame: Flame,
  sun: Sun,
  wind: Wind,
  refrigerator: Refrigerator,
  fridge: Refrigerator,
  coffee: Coffee,
  laptop: Laptop,
  desk: Laptop,
  shield: Shield,
  safe: Shield,
  building: Building,
  trees: Trees,
  garden: Trees,
  utensils: Utensils,
  kitchen: Utensils,
  shirt: Shirt,
  iron: Shirt,
  sparkles: Sparkles,
  footprints: Footprints,
  slippers: Footprints,
  'volume-x': VolumeX,
  soundproof: VolumeX,
  moon: Moon,
  curtain: Moon,
  bell: Bell,
  music: Music,
  lock: Lock,
  car: Car,
  parking: Car,
  eye: Eye,
  view: Eye,
  heart: Heart,
  bed: BedDouble,
  key: Key,
};

export const AVAILABLE_AMENITY_ICONS = [
  { key: 'wifi', label: 'Wifi', Icon: Wifi },
  { key: 'snowflake', label: 'Máy lạnh', Icon: Snowflake },
  { key: 'tv', label: 'Tivi / Màn hình', Icon: Tv },
  { key: 'bath', label: 'Bồn tắm', Icon: Bath },
  { key: 'flame', label: 'Nước nóng', Icon: Flame },
  { key: 'sun', label: 'Ban công / Nắng', Icon: Sun },
  { key: 'wind', label: 'Cửa sổ / Máy sấy', Icon: Wind },
  { key: 'refrigerator', label: 'Tủ lạnh', Icon: Refrigerator },
  { key: 'coffee', label: 'Ấm đun / Cà phê', Icon: Coffee },
  { key: 'laptop', label: 'Bàn làm việc', Icon: Laptop },
  { key: 'shield', label: 'Két sắt', Icon: Shield },
  { key: 'building', label: 'Hướng phố', Icon: Building },
  { key: 'trees', label: 'Hướng vườn', Icon: Trees },
  { key: 'utensils', label: 'Bếp / Đồ ăn', Icon: Utensils },
  { key: 'shirt', label: 'Bàn ủi / Quần áo', Icon: Shirt },
  { key: 'sparkles', label: 'Áo choàng / Cao cấp', Icon: Sparkles },
  { key: 'footprints', label: 'Dép đi trong phòng', Icon: Footprints },
  { key: 'volume-x', label: 'Cách âm', Icon: VolumeX },
  { key: 'moon', label: 'Rèm cản sáng', Icon: Moon },
  { key: 'bed', label: 'Giường êm', Icon: BedDouble },
  { key: 'car', label: 'Bãi đỗ xe', Icon: Car },
  { key: 'lock', label: 'Khóa an toàn', Icon: Lock },
  { key: 'music', label: 'Loa / Âm thanh', Icon: Music },
  { key: 'bell', label: 'Dịch vụ chuông', Icon: Bell },
];

interface AmenityIconProps {
  icon?: string;
  size?: number;
  className?: string;
}

export const AmenityIcon: React.FC<AmenityIconProps> = ({ icon, size = 16, className }) => {
  const IconComponent = (icon && AMENITY_ICON_MAP[icon.toLowerCase()]) || Sparkles;
  return <IconComponent size={size} className={className} />;
};

export default AmenityIcon;
