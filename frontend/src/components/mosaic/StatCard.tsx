import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export type StatCardVariant = 'dark' | 'alert' | 'white';

interface StatCardProps {
  variant?: StatCardVariant;
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
  subtitle?: string;
  trend?: {
    text: string;
    direction?: 'up' | 'down';
  };
  alertBullets?: string[];
  alertLinkText?: string;
  onAlertLinkClick?: () => void;
  progressPercent?: number;
  progressColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({
  variant = 'white',
  icon,
  label,
  value,
  valueColor,
  subtitle,
  trend,
  alertBullets,
  alertLinkText,
  onAlertLinkClick,
  progressPercent,
  progressColor = 'var(--brand)',
  className = '',
  children,
}: StatCardProps) {
  // Variant A: Dark Hero Card (#101826 navy bg, white text, green trend pill)
  if (variant === 'dark') {
    return (
      <div className={`mosaic-card-dark p-6 relative overflow-hidden flex flex-col justify-between ${className}`}>
        {/* Soft decorative background glow wave */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon && <span className="p-2 rounded-xl bg-white/10 text-teal-300">{icon}</span>}
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {label}
              </span>
            </div>

            {trend && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{trend.text}</span>
              </span>
            )}
          </div>

          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {value}
            </h3>
            {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>

        {children && <div className="mt-4 relative z-10">{children}</div>}
      </div>
    );
  }

  // Variant B: Tinted Alert Card (Soft tinted bg matching danger/warning, 2-line bullets)
  if (variant === 'alert') {
    return (
      <div className={`p-6 rounded-[14px] border border-amber-200/80 bg-amber-50/80 flex flex-col justify-between ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon && <span className="p-1.5 rounded-lg bg-amber-200/80 text-amber-800">{icon}</span>}
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {label}
              </span>
            </div>
          </div>

          <div>
            <span className="text-3xl font-extrabold text-amber-950" style={valueColor ? { color: valueColor } : undefined}>
              {value}
            </span>
            {subtitle && <p className="text-xs text-amber-800 font-medium mt-0.5">{subtitle}</p>}
          </div>

          {alertBullets && alertBullets.length > 0 && (
            <ul className="space-y-1.5 pt-2 text-xs text-amber-900">
              {alertBullets.map((b, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {alertLinkText && (
          <div className="pt-4 mt-2 border-t border-amber-200/60">
            <button
              onClick={onAlertLinkClick}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center space-x-1 transition"
            >
              <span>{alertLinkText}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Variant C: White Card with Mini Visual (Progress bar / Sparkline)
  return (
    <div className={`mosaic-card p-5 flex flex-col justify-between space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && (
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              {icon}
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            {label}
          </span>
        </div>

        {trend && (
          <span className="text-xs font-bold text-emerald-600 flex items-center space-x-0.5">
            <span>{trend.text}</span>
          </span>
        )}
      </div>

      <div>
        <div className="text-3xl font-extrabold tracking-tight text-[var(--ink-900)]" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-[var(--ink-muted)] font-medium mt-1">{subtitle}</p>}
      </div>

      {progressPercent !== undefined && (
        <div className="space-y-1 pt-1">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
            />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

export default StatCard;
