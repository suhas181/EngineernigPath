import React from 'react';
import { RoadmapData } from '../roadmap.types';

interface ProgressSummaryProps {
  roadmap: RoadmapData;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ roadmap }) => {
  const getResourceProgress = () => {
    let total = 0;
    let done = 0;
    roadmap.topics.forEach((t) => {
      total += t.resources.length;
      done += t.resources.filter((r) => r.isCompleted).length;
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getPracticeProgress = () => {
    let total = 0;
    let done = 0;
    roadmap.topics.forEach((t) => {
      total += t.practiceProblems?.length || 0;
      done += t.practiceProblems?.filter((p) => p.isCompleted).length || 0;
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getProjectProgress = () => {
    let total = 0;
    let done = 0;
    roadmap.topics.forEach((t) => {
      if (t.project) {
        total += 1;
        if (t.project.isCompleted) done += 1;
      }
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const resProgress = getResourceProgress();
  const pracProgress = getPracticeProgress();
  const projProgress = getProjectProgress();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
      {/* Overall Progress */}
      <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Roadmap Progress
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-white">{roadmap.progress}%</span>
          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
            Overall
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${roadmap.progress}%` }}
          />
        </div>
      </div>

      {/* Resources Progress */}
      <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Resource Progress
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-white">{resProgress}%</span>
          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
            Lessons
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
          <div className="h-full bg-blue-500" style={{ width: `${resProgress}%` }} />
        </div>
      </div>

      {/* Problems Progress */}
      <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Practice Progress
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-white">{pracProgress}%</span>
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
            Leetcode
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
          <div className="h-full bg-purple-500" style={{ width: `${pracProgress}%` }} />
        </div>
      </div>

      {/* Project Progress */}
      <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Project Progress
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-white">{projProgress}%</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
            Builds
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
          <div className="h-full bg-emerald-500" style={{ width: `${projProgress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
