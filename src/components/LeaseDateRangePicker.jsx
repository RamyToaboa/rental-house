import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, ChevronLeft, ChevronRight, Check, Sparkles, 
  Clock
} from 'lucide-react';

/* ============================================================
   Helpers
   ============================================================ */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const toISODate = (d) => {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const fromISO = (iso) => {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
};

const formatDisplay = (iso) => {
  const d = fromISO(iso);
  if (!d) return '';
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const isSameDay = (a, b) => 
  a && b && a.getFullYear() === b.getFullYear() && 
  a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const daysBetween = (startIso, endIso) => {
  const s = fromISO(startIso);
  const e = fromISO(endIso);
  if (!s || !e) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const formatDuration = (days) => {
  if (!days || days <= 0) return null;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
  const years = (days / 365).toFixed(1).replace(/\.0$/, '');
  return `${years} year${years !== '1' ? 's' : ''}`;
};

/* ============================================================
   Calendar Popover (with year scroll picker)
   ============================================================ */
const CalendarPopover = ({ value, minDate, onSelect, onClose, onQuickPreset }) => {
  const initialDate = fromISO(value) || new Date();
  const [viewMonth, setViewMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [pickerMode, setPickerMode] = useState('days'); // 'days' | 'months' | 'years'
  const today = new Date();
  const yearListRef = useRef(null);
  const currentYearRef = useRef(null);

  // Range of years: current - 50 to current + 50 (100 years to scroll through)
  const currentYear = today.getFullYear();
  const yearRange = [];
  for (let y = currentYear - 50; y <= currentYear + 50; y++) yearRange.push(y);

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i));
  }

  const selectedDate = fromISO(value);
  const minDateObj = fromISO(minDate);

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  const goToday = () => setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  // Auto-scroll to the currently selected year when opening the year picker
  useEffect(() => {
    if (pickerMode === 'years' && currentYearRef.current && yearListRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const container = yearListRef.current;
        const target = currentYearRef.current;
        if (container && target) {
          const targetTop = target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
          container.scrollTop = Math.max(0, targetTop);
        }
      });
    }
  }, [pickerMode]);

  const selectYear = (year) => {
    setViewMonth(new Date(year, viewMonth.getMonth(), 1));
    setPickerMode('months');
  };

  const selectMonth = (monthIndex) => {
    setViewMonth(new Date(viewMonth.getFullYear(), monthIndex, 1));
    setPickerMode('days');
  };

  return (
    <div className="w-[320px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/30">
      
      {/* Quick presets */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-linear-to-b from-emerald-50/60 to-transparent px-3 py-2.5 dark:border-slate-700 dark:from-emerald-500/5">
        <Sparkles className="h-3 w-3 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Quick set
        </span>
        <div className="ml-auto flex items-center gap-1">
          {[
            { label: '6m', months: 6 },
            { label: '1y', months: 12 },
            { label: '2y', months: 24 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onQuickPreset(preset.months)}
              className="rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700 transition-colors hover:bg-emerald-500 hover:text-white dark:border-emerald-500/30 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============ Header with clickable Month + Year ============ */}
      <div className="flex items-center justify-between px-3 py-3">
        <button
          type="button"
          onClick={() => {
            if (pickerMode === 'days') prevMonth();
            else if (pickerMode === 'months') setViewMonth(new Date(viewMonth.getFullYear() - 1, viewMonth.getMonth(), 1));
            else setViewMonth(new Date(viewMonth.getFullYear() - 1, viewMonth.getMonth(), 1));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {/* Month button */}
          <button
            type="button"
            onClick={() => {
              if (pickerMode === 'months') { setPickerMode('days'); return; }
              setPickerMode('months');
            }}
            className={`rounded-lg px-2.5 py-1 text-sm font-bold transition-colors ${
              pickerMode === 'months'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-700'
            }`}
          >
            {MONTHS[viewMonth.getMonth()]}
          </button>

          {/* Year button — opens scrollable year picker */}
          <button
            type="button"
            onClick={() => {
              if (pickerMode === 'years') { setPickerMode('days'); return; }
              setPickerMode('years');
            }}
            className={`rounded-lg px-2.5 py-1 text-sm font-bold transition-colors ${
              pickerMode === 'years'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-700'
            }`}
          >
            {viewMonth.getFullYear()}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (pickerMode === 'days') nextMonth();
            else setViewMonth(new Date(viewMonth.getFullYear() + 1, viewMonth.getMonth(), 1));
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ============ YEARS VIEW (scrollable) ============ */}
      {pickerMode === 'years' && (
        <div className="px-3 pb-3">
          <div className="mb-2 flex items-center justify-between border-b border-gray-100 px-1 pb-2 dark:border-slate-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Scroll to select year
            </p>
            <button
              type="button"
              onClick={goToday}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              Today
            </button>
          </div>

          <div
            ref={yearListRef}
            className="
              relative max-h-60 overflow-y-auto rounded-lg
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-emerald-400
              [&::-webkit-scrollbar-thumb:hover]:bg-emerald-500
              dark:[&::-webkit-scrollbar-track]:bg-slate-700
            "
          >
            <div className="space-y-0.5 p-1">
              {yearRange.map((year) => {
                const isSelected = viewMonth.getFullYear() === year;
                const isThisYear = today.getFullYear() === year;
                return (
                  <button
                    key={year}
                    ref={isSelected ? currentYearRef : null}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`
                      flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium
                      transition-all duration-100
                      ${isSelected
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : isThisYear
                        ? 'bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{year}</span>
                    {isThisYear && !isSelected && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        This year
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ MONTHS VIEW ============ */}
      {pickerMode === 'months' && (
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
          {MONTHS_SHORT.map((month, idx) => {
            const isSelected = viewMonth.getMonth() === idx;
            const isThisMonth = today.getMonth() === idx && today.getFullYear() === viewMonth.getFullYear();
            return (
              <button
                key={month}
                type="button"
                onClick={() => selectMonth(idx)}
                className={`
                  relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-100
                  ${isSelected
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : isThisMonth
                    ? 'bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }
                `}
              >
                {month}
                {isThisMonth && !isSelected && (
                  <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ============ DAYS VIEW ============ */}
      {pickerMode === 'days' && (
        <>
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-1">
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {days.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;

              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const isDisabled = minDateObj && date < minDateObj;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => { onSelect(toISODate(date)); onClose(); }}
                  className={`
                    relative flex h-9 items-center justify-center rounded-lg text-sm font-medium
                    transition-all duration-100
                    ${isDisabled
                      ? 'cursor-not-allowed text-gray-300 dark:text-slate-600'
                      : isSelected
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                      : isToday
                      ? 'bg-emerald-50 font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {date.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

/* ============================================================
   LeaseDateRangePicker — main exported component
   ============================================================ */
const LeaseDateRangePicker = ({ start, end, onChange }) => {
  const [openField, setOpenField] = useState(null); // 'start' | 'end' | null
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  
  const startButtonRef = useRef(null);
  const endButtonRef = useRef(null);
  const popoverRef = useRef(null);

  const startDate = fromISO(start);
  const endDate = fromISO(end);
  const durationDays = daysBetween(start, end);
  const durationLabel = formatDuration(durationDays);

  useLayoutEffect(() => {
    if (!openField) return;
    const button = openField === 'start' ? startButtonRef.current : endButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const popoverWidth = 320;
    const popoverHeight = 400;
    const padding = 12;

    let left = rect.left;
    left = Math.max(padding, Math.min(left, window.innerWidth - popoverWidth - padding));

    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < popoverHeight && rect.top > popoverHeight
      ? rect.top - 8 - popoverHeight
      : rect.bottom + 8;

    setPopoverPos({ top, left });
  }, [openField]);

  useEffect(() => {
    if (!openField) return;
    const handleClickOutside = (e) => {
      const button = openField === 'start' ? startButtonRef.current : endButtonRef.current;
      if (
        button && !button.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) {
        setOpenField(null);
      }
    };
    const close = () => setOpenField(null);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openField]);

  const applyPreset = (months) => {
    const base = startDate || new Date();
    const newEnd = addMonths(base, months);
    onChange({
      start: start || toISODate(base),
      end: toISODate(newEnd),
    });
    setOpenField(null);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
          Lease Period
        </span>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        
        {/* Start */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
            Lease Start
          </label>
          <button
            ref={startButtonRef}
            type="button"
            onClick={() => setOpenField(openField === 'start' ? null : 'start')}
            className={`
              group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all
              ${openField === 'start'
                ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10 dark:border-emerald-500/60 dark:bg-slate-800'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
              }
            `}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              start ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500'
            }`}>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                From
              </p>
              <p className={`truncate text-sm font-semibold ${
                start ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'
              }`}>
                {start ? formatDisplay(start) : 'Select start date'}
              </p>
            </div>
          </button>
        </div>

        {/* End */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
            Lease End
          </label>
          <button
            ref={endButtonRef}
            type="button"
            onClick={() => setOpenField(openField === 'end' ? null : 'end')}
            className={`
              group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all
              ${openField === 'end'
                ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10 dark:border-emerald-500/60 dark:bg-slate-800'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
              }
            `}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              end ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500'
            }`}>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                To
              </p>
              <p className={`truncate text-sm font-semibold ${
                end ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'
              }`}>
                {end ? formatDisplay(end) : 'Select end date'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Duration badge */}
      {durationLabel && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-emerald-50/50 to-transparent px-3 py-2 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:via-emerald-500/5 dark:to-transparent">
          <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-slate-300">Duration:</span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {durationLabel}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            ({durationDays} days)
          </span>
        </div>
      )}

      {/* Calendar popover */}
      {openField && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            zIndex: 9999,
          }}
          className="animate-dropdown-in"
        >
          <CalendarPopover
            value={openField === 'start' ? start : end}
            minDate={openField === 'end' ? start : ''}
            onClose={() => setOpenField(null)}
            onSelect={(iso) => {
              if (openField === 'start') {
                const newEnd = end && fromISO(end) < fromISO(iso) ? toISODate(addMonths(fromISO(iso), 12)) : end;
                onChange({ start: iso, end: newEnd });
              } else {
                onChange({ start, end: iso });
              }
            }}
            onQuickPreset={applyPreset}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeaseDateRangePicker;