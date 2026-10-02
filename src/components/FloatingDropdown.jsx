import React, { useState, useLayoutEffect } from 'react';
import { Check } from 'lucide-react';

/**
 * Floating dropdown that renders via portal into document.body.
 * Bypasses CSS containing-block traps (backdrop-filter, transform, filter, etc.)
 */
export function FloatingDropdown({ buttonRef, alignRight = false, width = 176, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useLayoutEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const left = alignRight ? rect.right - width : rect.left;

    // Auto-flip if it would overflow bottom of screen
    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 200;
    const top = spaceBelow < approxHeight && rect.top > approxHeight
      ? rect.top - 8 - approxHeight
      : rect.bottom + 8;

    setPos({
      top,
      left,
      width: alignRight ? width : rect.width,
    });
  }, [buttonRef, alignRight, width]);

  return (
    <div
      style={{
        position: 'fixed',
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: `${pos.width}px`,
        zIndex: 9999,
      }}
      className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      {children}
    </div>
  );
}

/**
 * Single row inside a floating dropdown.
 */
export function DropdownItem({ children, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
    >
      <span className="flex items-center gap-2">{children}</span>
      {selected && <Check className="h-4 w-4 text-emerald-500" />}
    </button>
  );
}