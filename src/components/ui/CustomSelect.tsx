'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  disabled = false,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  className = '',
  id,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Lọc options theo từ khóa tìm kiếm (search debounce / filter)
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Đóng khi click bên ngoài hoặc nhấn phím Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus ô tìm kiếm khi mở menu
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      id={selectId}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
      }}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 0.875rem',
          backgroundColor: disabled ? 'var(--color-bg)' : 'var(--color-surface)',
          border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary-light)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        }}
      >
        <span
          style={{
            color: selectedOption ? 'var(--color-text)' : 'var(--color-text-muted)',
            fontSize: '0.925rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              style={{
                padding: '2px',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Xóa lựa chọn"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            style={{
              color: 'var(--color-text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="glass-panel animate-slide-down"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 999,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Ô tìm kiếm tích hợp */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Danh sách options */}
          <div style={{ overflowY: 'auto', padding: '0.25rem 0' }}>
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                Không tìm thấy kết quả phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected
                        ? 'var(--color-primary-light)'
                        : 'transparent',
                      color: isSelected
                        ? 'var(--color-primary)'
                        : opt.disabled
                        ? 'var(--color-text-light)'
                        : 'var(--color-text)',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.125rem',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!opt.disabled && !isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
