import React from 'react';
import clsx from 'clsx';

// Object mapping to avoid complex and messy if/else statements
const STATUS_CONFIG = {
  available: {
    bg: 'bg-success bg-opacity-10',
    text: 'text-success',
    label: 'Available'
  },
  full: {
    bg: 'bg-danger bg-opacity-10',
    text: 'text-danger',
    label: 'Full'
  },
  almost_full: {
    bg: 'bg-warning bg-opacity-10',
    text: 'text-warning',
    label: 'Almost Full'
  }
};

/**
 * Real-time parking availability badge
 * @param {string} status - available | full | almost_full
 */
export const AvailabilityBadge = ({ status = 'available' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;

  return (
    <div className={clsx(
      "px-3 py-1 rounded-full text-xs font-bold font-label inline-flex items-center gap-1.5",
      config.bg,
      config.text
    )}>
      {/* Small live pulsing dot indicator */}
      <span className={clsx("w-2 h-2 rounded-full", status === 'available' ? "bg-success animate-pulse" : status === 'full' ? "bg-danger" : "bg-warning")} />
      {config.label}
    </div>
  );
};