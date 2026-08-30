import React from 'react';
import { Search, Plus } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function TopHeader({
  title,
  subtitle,
  searchPlaceholder = 'Search workspace...',
  onSearchChange,
  searchValue = '',
  primaryActionLabel,
  onPrimaryAction,
  primaryActionIcon = <Plus className="h-4 w-4" />,
  children,
}: TopHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 md:px-8 bg-[var(--page-bg)] border-b border-[var(--card-border)] sticky top-0 z-30 transition-colors duration-200">
      {/* Title & Metadata Subtitle */}
      <div className="text-left space-y-0.5">
        <h1 className="text-2xl font-extrabold text-[var(--ink-900)] tracking-tight font-heading">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--ink-muted)] font-medium">{subtitle}</p>
        )}
      </div>

      {/* Right Controls: Search, Filters, ThemeToggle & Action Button */}
      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange && (
          <div className="relative min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/80 border border-[var(--card-border)] rounded-full pl-9 pr-10 py-1.5 text-xs text-[var(--ink-900)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-teal-500 transition shadow-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.2 bg-slate-50 dark:bg-slate-800">
              ⌘K
            </span>
          </div>
        )}

        {children}

        <ThemeToggle />

        {primaryActionLabel && onPrimaryAction && (
          <button onClick={onPrimaryAction} className="mosaic-btn-primary cursor-pointer">
            {primaryActionIcon}
            <span>{primaryActionLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default TopHeader;
