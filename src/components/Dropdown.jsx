import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

/**
 * A polished, reusable dropdown component.
 *
 * @example
 * <Dropdown
 *   value={period}
 *   onChange={setPeriod}
 *   options={['This Month', 'Last Month', 'This Year']}
 *   label="Select period"
 * />
 */
const Dropdown = ({
  value,
  onChange,
  options,
  label,
  align = 'right',        // 'left' | 'right' | 'center'
  width = 180,             // menu width in px
  variant = 'default',     // 'default' | 'ghost' | 'minimal'
  size = 'md',             // 'sm' | 'md' | 'lg'
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Calculate menu position on open
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    let left = rect.left;
    if (align === 'right')  left = rect.right - width;
    if (align === 'center') left = rect.left + rect.width / 2 - width / 2;

    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < 220 && rect.top > 220
      ? rect.top - 8 - 220
      : rect.bottom + 8;

    setMenuPos({ top, left });
  }, [isOpen, align, width]);

  // Close on outside click / scroll / resize
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const close = () => setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2',
  };

  // Button variant styles
  const buttonVariants = {
    default: isOpen
      ? 'border-emerald-500 bg-white text-gray-900 shadow-sm ring-4 ring-emerald-500/10 dark:border-emerald-500/60 dark:bg-slate-800 dark:text-white'
      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
    ghost: isOpen
      ? 'border-transparent bg-gray-100 text-gray-900 dark:bg-slate-700 dark:text-white'
      : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/60',
    minimal: 'border-transparent bg-transparent text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white px-0 py-0 shadow-none',
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className={`
          group flex items-center justify-between rounded-lg border font-medium
          transition-all duration-150
          ${sizeStyles[size]}
          ${buttonVariants[variant]}
          ${fullWidth ? 'w-full' : ''}
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {value || 'Select...'}
        </span>
        <ChevronDown
          className={`
            h-4 w-4 shrink-0 transition-all duration-200
            ${isOpen
              ? 'rotate-180 text-emerald-500'
              : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-300'
            }
          `}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            width: `${width}px`,
            zIndex: 9999,
          }}
          className="
            animate-dropdown-in
            overflow-hidden rounded-xl border border-gray-100 bg-white
            shadow-xl ring-1 ring-black/5
            dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20
          "
        >
          {/* Optional label header */}
          {label && (
            <div className="border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {label}
              </p>
            </div>
          )}

          {/* Options */}
          <div className="max-h-72 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => { onChange(option); setIsOpen(false); }}
                  className={`
                    flex w-full items-center justify-between px-4 py-2.5
                    text-left text-sm transition-colors
                    ${isSelected
                      ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                    }
                  `}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Dropdown;