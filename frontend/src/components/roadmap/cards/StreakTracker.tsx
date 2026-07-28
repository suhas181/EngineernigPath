import React from 'react';
import { Flame } from 'lucide-react';

export const StreakTracker: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40 flex flex-col justify-between space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500 animate-pulse" /> SDE Streak
        </h3>
        <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
          Active
        </span>
      </div>

      <div className="flex items-center justify-around py-1">
        <div className="text-center">
          <span className="text-3xl font-extrabold text-white block">5</span>
          <span className="text-[9px] text-slate-400 uppercase font-semibold">Current Streak</span>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-center">
          <span className="text-3xl font-extrabold text-white block">12</span>
          <span className="text-[9px] text-slate-400 uppercase font-semibold">Longest Streak</span>
        </div>
      </div>

      {/* 7-day consistency calendar */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <span className="text-[9px] text-slate-400 uppercase font-semibold block text-left">
          Weekly consistency:
        </span>
        <div className="flex justify-between items-center gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <div key={idx} className="text-center flex-1">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto border transition duration-200 ${
                  idx < 5
                    ? 'bg-orange-500/10 border-orange-500/25 text-orange-400 shadow-md shadow-orange-500/5'
                    : 'bg-white/5 border-white/5 text-slate-500'
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
