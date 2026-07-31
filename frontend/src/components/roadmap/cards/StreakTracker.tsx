import React from 'react';
import { Flame } from 'lucide-react';
import { Badge } from '../../mosaic/Badge';

export const StreakTracker: React.FC = () => {
  return (
    <div className="mosaic-card p-5 bg-white space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[var(--ink-900)] uppercase tracking-widest flex items-center gap-1.5 font-heading">
          <Flame className="h-4 w-4 text-amber-500 animate-pulse" /> SDE Activity Streak
        </h3>
        <Badge tone="warning">Active</Badge>
      </div>

      <div className="flex items-center justify-around py-1">
        <div className="text-center">
          <span className="text-2xl font-black text-[var(--ink-900)] block">5</span>
          <span className="text-[10px] text-[var(--ink-muted)] uppercase font-bold">Current Streak</span>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="text-center">
          <span className="text-2xl font-black text-[var(--ink-900)] block">12</span>
          <span className="text-[10px] text-[var(--ink-muted)] uppercase font-bold">Longest Streak</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[var(--card-border)]">
        <span className="text-[10px] text-[var(--ink-muted)] uppercase font-bold block text-left">
          Weekly Consistency
        </span>
        <div className="flex justify-between items-center gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <div key={idx} className="text-center flex-1">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto border transition duration-200 ${
                  idx < 5
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                {day}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;
