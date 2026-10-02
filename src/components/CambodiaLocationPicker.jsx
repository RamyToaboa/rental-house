import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown, Check, X, Building2, Home } from 'lucide-react';
import { cambodiaProvinces } from '../data/cambodiaLocations';

/* ============================================================
   Reusable portal dropdown — mobile-friendly, scrollable
   ============================================================ */
const LocationDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  label,
  disabled,
  hint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Viewport-aware menu width calculation
  const getMenuMetrics = () => {
    const padding = 12;
    const isMobile = window.innerWidth < 640;
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const buttonWidth = buttonRect?.width || 280;

    const width = isMobile
      ? Math.min(window.innerWidth - padding * 2, 420)
      : Math.min(Math.max(buttonWidth, 300), 380);

    return { padding, width, isMobile, buttonRect };
  };

  // Position calculation (recalculate on open + resize)
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const compute = () => {
      const { padding, width, buttonRect } = getMenuMetrics();
      if (!buttonRect) return;

      let left = buttonRect.left;
      left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const approxHeight = 360;
      const top = spaceBelow < approxHeight && buttonRect.top > approxHeight
        ? buttonRect.top - 8 - approxHeight
        : buttonRect.bottom + 8;

      setPos({ top, left, width });
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isOpen]);

  // Close on click outside
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
    // Only close on outer page scroll, not inner dropdown scroll
    const handleScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
        {label}
      </label>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(v => !v)}
        className={`
          group flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-all
          ${disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-600'
            : isOpen
            ? 'border-emerald-500 bg-white text-gray-900 ring-2 ring-emerald-500/20 dark:border-emerald-500/60 dark:bg-slate-800 dark:text-white'
            : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600'
          }
        `}
      >
        <Icon className={`h-4 w-4 shrink-0 ${value ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'}`} />
        <span className={`flex-1 truncate ${!value ? 'text-gray-400 dark:text-slate-500' : 'font-medium'}`}>
          {value || placeholder}
        </span>
        {value && !disabled && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
            role="button"
            title="Clear"
          >
            <X className="h-3 w-3" />
          </span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${
          isOpen ? 'rotate-180 text-emerald-500' : 'text-gray-400'
        }`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            width: `${pos.width}px`,
            zIndex: 9999,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
          className="animate-dropdown-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          {/* Header with hint + count */}
          <div className="flex items-center justify-between border-b border-gray-50 px-4 py-2 dark:border-slate-700/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {hint || `Select ${label.toLowerCase()}`}
            </p>
            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500">
              {options.length} {options.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {/* Scrollable list — mobile-friendly touch scrolling */}
          <div className="relative">
            <div
              className="
                max-h-[60vh] sm:max-h-64
                overflow-y-auto
                overscroll-contain
                py-1 pr-1
                [-webkit-overflow-scrolling:touch]
                [touch-action:pan-y]
                [&::-webkit-scrollbar]:w-3
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-track]:my-1
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-400
                [&::-webkit-scrollbar-thumb]:border-2
                [&::-webkit-scrollbar-thumb]:border-gray-100
                [&::-webkit-scrollbar-thumb:hover]:bg-gray-500
                dark:[&::-webkit-scrollbar-track]:bg-slate-700/50
                dark:[&::-webkit-scrollbar-thumb]:bg-slate-400
                dark:[&::-webkit-scrollbar-thumb]:border-slate-700/50
                dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-300
              "
            >
              {options.length === 0 ? (
                <p className="px-4 py-3 text-center text-sm text-gray-400 dark:text-slate-500">
                  No options available
                </p>
              ) : (
                options.map((option) => {
                  const isSelected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { onChange(option); setIsOpen(false); }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:active:bg-slate-700'
                      }`}
                    >
                      <span className="truncate">{option}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom fade to hint more items */}
            {options.length > 5 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-3 h-6 bg-linear-to-t from-white to-transparent dark:from-slate-800" />
            )}
          </div>

          {/* Footer counter (only if list is long) */}
          {options.length > 5 && (
            <div className="border-t border-gray-50 px-4 py-1.5 dark:border-slate-700/60">
              <p className="text-center text-[10px] text-gray-400 dark:text-slate-500">
                Scroll to see all {options.length} options
              </p>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

/* ============================================================
   Main: Cambodia Location Picker
   ============================================================ */
const CambodiaLocationPicker = ({ value, onChange }) => {
  const parseLocation = (str) => {
    if (!str) return { province: '', district: '', street: '' };
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    const provinceMatch = cambodiaProvinces.find(p => 
      parts.some(part => part.toLowerCase() === p.name.toLowerCase())
    );
    if (!provinceMatch) return { province: '', district: '', street: str };
    
    const districtMatch = parts.find(part => 
      provinceMatch.districts.some(d => d.toLowerCase() === part.toLowerCase())
    );
    
    const remaining = parts.filter(p => 
      p.toLowerCase() !== provinceMatch.name.toLowerCase() &&
      (!districtMatch || p.toLowerCase() !== districtMatch.toLowerCase())
    );

    return {
      province: provinceMatch.name,
      district: districtMatch || '',
      street: remaining.join(', '),
    };
  };

  const initial = parseLocation(value);
  const [province, setProvince] = useState(initial.province);
  const [district, setDistrict] = useState(initial.district);
  const [street, setStreet] = useState(initial.street);

  const districts = province
    ? (cambodiaProvinces.find(p => p.name === province)?.districts || [])
    : [];

  useEffect(() => {
    const parts = [street, district, province].filter(Boolean);
    const fullLocation = parts.length > 0 ? parts.join(', ') : '';
    if (fullLocation !== value) {
      onChange(fullLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, district, street]);

  const handleProvinceChange = (newProvince) => {
    setProvince(newProvince);
    setDistrict('');
  };

  return (
    <div className="space-y-4 rounded-xl border border-emerald-200/60 bg-linear-to-br from-emerald-50/40 to-teal-50/20 p-4 dark:border-emerald-500/20 dark:from-emerald-500/5 dark:to-teal-500/5">
      
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Cambodia Location
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LocationDropdown
          label="Province / City *"
          value={province}
          onChange={handleProvinceChange}
          options={cambodiaProvinces.map(p => p.name)}
          placeholder="Select province"
          icon={Building2}
          hint="Cambodia provinces"
        />
        <LocationDropdown
          label="District / Khan"
          value={district}
          onChange={setDistrict}
          options={districts}
          placeholder={province ? 'Select district' : 'Pick a province first'}
          icon={Home}
          disabled={!province}
          hint={province ? `Districts in ${province}` : 'Select a province first'}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
          Street / Additional Details
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. Street 271, Sangkat Toul Tom Poung"
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {value && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200/60 bg-white/60 px-3 py-2 dark:border-emerald-500/20 dark:bg-slate-800/50">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Full location
            </p>
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CambodiaLocationPicker;