import React from 'react';
import { Zap } from 'lucide-react';
import { Topic } from '../roadmap.types';

interface TodayFocusCardProps {
  activeMonth: Topic | null;
  totalItems: number;
  completedItems: number;
  nextTaskType: 'resource' | 'problem' | 'project' | 'none';
  nextTaskTitle: string;
  nextTaskAction: () => void;
  remainingProblems: number;
}

export const TodayFocusCard: React.FC<TodayFocusCardProps> = ({
  activeMonth,
  totalItems,
  completedItems,
  nextTaskType,
  nextTaskTitle,
  nextTaskAction,
  remainingProblems,
}) => {
  const getEstimatedHoursLeft = () => {
    if (!activeMonth || totalItems === 0) return 0;
    const hours = activeMonth.estimatedStudyHours || 40;
    const remainingRatio = (totalItems - completedItems) / totalItems;
    return Math.max(1, Math.round(remainingRatio * hours));
  };

  return (
    <div className="mosaic-card p-6 bg-white space-y-4 text-left">
      <h3 className="text-xs font-bold text-teal-700 uppercase tracking-widest flex items-center gap-1.5 font-heading">
        <Zap className="h-4 w-4 text-teal-600" /> Today's Priority Focus
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">
            Active Month Goal
          </span>
          <span
            className="text-xs font-bold text-slate-900 truncate block"
            title={activeMonth?.monthlyGoal || 'Learn core concepts'}
          >
            {activeMonth?.monthlyGoal || 'Learn core concepts'}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">
            Next Task
          </span>
          {nextTaskType !== 'none' ? (
            <button
              onClick={nextTaskAction}
              className="text-xs font-bold text-teal-600 hover:underline truncate block w-full text-left bg-transparent border-none p-0 focus:outline-none"
            >
              {nextTaskTitle.split(': ')[1] || 'Next Item'}
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-600 block">Completed</span>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">
            Remaining Problems
          </span>
          <span className="text-xs font-bold text-slate-900 block">
            {remainingProblems} Problems
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">
            Est. Study Time
          </span>
          <span className="text-xs font-bold text-slate-900 block">
            {getEstimatedHoursLeft()} Hours Left
          </span>
        </div>
      </div>
    </div>
  );
};

export default TodayFocusCard;
