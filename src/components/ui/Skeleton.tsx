import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius,
  variant = 'rectangular',
  className = '',
  style,
  ...props
}) => {
  const getRadius = () => {
    if (borderRadius) return borderRadius;
    if (variant === 'circular') return 'var(--radius-full)';
    if (variant === 'text') return 'var(--radius-sm)';
    return 'var(--radius-md)';
  };

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: getRadius(),
        backgroundColor: 'rgba(15, 91, 102, 0.08)',
        backgroundImage: 'linear-gradient(90deg, rgba(15, 91, 102, 0.06) 0%, rgba(15, 91, 102, 0.14) 50%, rgba(15, 91, 102, 0.06) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.6s ease-in-out infinite',
        ...style,
      }}
      {...props}
    >
      <style jsx>{`
        @keyframes skeleton-pulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Skeleton;
