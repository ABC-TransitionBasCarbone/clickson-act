"use client";

import React, { useId, useState } from "react";
import { Info } from "lucide-react";

type TooltipProps = {
  /** Accessible label for the info trigger */
  label: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Hover/focus tooltip for field help (supports multi-line content).
 */
const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="btn btn-ghost btn-circle btn-xs text-gray-500 hover:text-gray-800"
        aria-label={label}
        aria-describedby={open ? panelId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info className="h-4 w-4" strokeWidth={1.75} />
      </button>
      {open && (
        <span
          id={panelId}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border border-gray-200 bg-white p-3 text-left text-xs leading-relaxed text-gray-700 shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
