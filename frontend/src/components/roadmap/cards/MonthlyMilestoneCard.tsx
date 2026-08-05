import React from 'react';
import { Trophy, CheckCircle2, FolderGit2, TrendingUp, Compass, ArrowRight, Lightbulb } from 'lucide-react';
import { MonthlyMilestoneSummary } from '../roadmap.types';

interface MonthlyMilestoneCardProps {
  summary: MonthlyMilestoneSummary;
  monthNumber: number;
  monthTitle?: string;
}

export const MonthlyMilestoneCard: React.FC<MonthlyMilestoneCardProps> = ({
  summary,
  monthNumber,
  monthTitle
}) => {
  const { currentReadinessPercent, expectedReadinessPercent, improvementPercent } = summary.readinessImprovement;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 mt-8 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">
              Month {monthNumber} Milestone Summary {monthTitle ? `(${monthTitle})` : ''}
            </h4>
            <p className="text-xs text-slate-400">Review your progress before continuing to Month {monthNumber + 1}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Month Accessible
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Topics Completed</span>
          <div className="text-lg font-bold text-white mt-1">
            {summary.topicsCompleted} <span className="text-xs font-normal text-slate-500">/ {summary.totalTopics}</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Problems Solved</span>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {summary.problemsSolved} <span className="text-xs font-normal text-slate-500">/ {summary.totalProblems}</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
            Project Status
          </span>
          <div className="text-sm font-bold text-purple-300 capitalize mt-1.5">
            {summary.projectStatus.replace('_', ' ')}
          </div>
        </div>

        <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            Readiness Boost
          </span>
          <div className="text-base font-bold text-indigo-300 mt-1 flex items-center gap-1">
            <span>{currentReadinessPercent}%</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400">{expectedReadinessPercent}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              +{improvementPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-indigo-400" />
          Recommended Next Steps
        </h5>
        <ul className="space-y-2">
          {summary.recommendedNextSteps.map((step, idx) => (
            <li key={idx} className="p-2.5 bg-slate-800/30 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation Banner (Accessible Month N+1) */}
      <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block">Recommendation:</span>
          <span>
            Month {monthNumber + 1} is open and ready. For best retention, make sure to complete all practice problems in Month {monthNumber} before diving into new topics.
          </span>
        </div>
      </div>
    </div>
  );
};
