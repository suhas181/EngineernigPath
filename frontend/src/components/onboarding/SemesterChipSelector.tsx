import React from 'react';
import { GraduationCap } from 'lucide-react';

interface SemesterChipSelectorProps {
  value: number;
  onChange: (sem: number) => void;
  error?: string;
}

export const SemesterChipSelector: React.FC<SemesterChipSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const semesters = [
    { num: 1, symbol: '①' },
    { num: 2, symbol: '②' },
    { num: 3, symbol: '③' },
    { num: 4, symbol: '④' },
    { num: 5, symbol: '⑤' },
    { num: 6, symbol: '⑥' },
    { num: 7, symbol: '⑦' },
    { num: 8, symbol: '⑧' },
  ];

  return (
    <div className="space-y-2 text-left w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
          <span>Current Semester</span>
        </label>
        <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
          Semester {value} Selected
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
        {semesters.map(({ num, symbol }) => {
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600 to-indigo-600 border-blue-400 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/40 font-bold scale-[1.03]'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80 hover:text-white font-medium'
              }`}
            >
              <span className="text-lg leading-none mb-1 opacity-90">{symbol}</span>
              <span className="text-[11px] font-semibold tracking-tight">Sem {num}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400 font-medium pt-0.5 animate-fadeIn">{error}</p>}
    </div>
  );
};
