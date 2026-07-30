import React from 'react';

export type BadgeTone = 'success' | 'info' | 'purple' | 'warning' | 'danger' | 'brand';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const TONE_MAP: Record<BadgeTone, { bg: string; fg: string; border?: string }> = {
  success: { bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  info: { bg: 'var(--status-info-bg)', fg: 'var(--status-info)' },
  purple: { bg: 'var(--status-purple-bg)', fg: 'var(--status-purple)' },
  warning: { bg: 'var(--status-warning-bg)', fg: 'var(--status-warning)' },
  danger: { bg: 'var(--status-danger-bg)', fg: 'var(--status-danger)' },
  brand: { bg: 'var(--brand-bg-soft)', fg: 'var(--brand-text-on-soft)' },
};

export function Badge({ tone = 'info', icon, children, className = '' }: BadgeProps) {
  const styleConfig = TONE_MAP[tone] || TONE_MAP.info;

  return (
    <span
      className={`mosaic-badge ${className}`}
      style={{
        backgroundColor: styleConfig.bg,
        color: styleConfig.fg,
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
