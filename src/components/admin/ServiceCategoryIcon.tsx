import React from 'react';
import { Coffee, Shirt, Utensils, Car, BedDouble, Sparkles, Tag, Gift } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  coffee: Coffee,
  shirt: Shirt,
  utensils: Utensils,
  car: Car,
  bed: BedDouble,
  sparkles: Sparkles,
  tag: Tag,
  gift: Gift,
};

interface ServiceCategoryIconProps {
  /** Khoá icon của danh mục (coffee, shirt, utensils, car, bed, sparkles, tag, gift) */
  icon?: string;
  size?: number;
}

/**
 * Hiển thị icon của danh mục dịch vụ theo khoá icon, mặc định là icon Tag
 */
export const ServiceCategoryIcon: React.FC<ServiceCategoryIconProps> = ({ icon, size = 15 }) => {
  const Icon = (icon && ICON_MAP[icon]) || Tag;
  return <Icon size={size} />;
};

export default ServiceCategoryIcon;
