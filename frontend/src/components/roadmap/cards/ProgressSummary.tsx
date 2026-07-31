import React from 'react';
import { RoadmapData } from '../roadmap.types';
import { Badge } from '../../mosaic/Badge';

interface ProgressSummaryProps {
  roadmap: RoadmapData;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ roadmap }) => {
  const getResourceProgress = () => {
    let total = 0;
    let done = 0;
    if (roadmap && roadmap.topics) {
      roadmap.topics.forEach((t) => {
        total += t.resources?.length || 0;
        done += t.resources?.filter((r) => r.isCompleted).length || 0;
      });
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getPracticeProgress = () => {
    let total = 0;
    let done = 0;
    if (roadmap && roadmap.topics) {
      roadmap.topics.forEach((t) => {
        total += t.practiceProblems?.length || 0;
        done += t.practiceProblems?.filter((p) => p.isCompleted).length || 0;
      });
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getProjectProgress = () => {
    let total = 0;
    let done = 0;
    if (roadmap && roadmap.topics) {
      roadmap.topics.forEach((t) => {
        if (t.project) {
          total += 1;
          if (t.project.isCompleted) done += 1;
        }
      });
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const resProgress = getResourceProgress();
  const pracProgress = getPracticeProgress();
  const projProgress = getProjectProgress();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
      {/* Overall Progress */}
      <div className="mosaic-card p-4 bg-white text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
          Overall Progress
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-[var(--ink-900)]">{roadmap.progress || 0}%</span>
          <Badge tone="brand">Overall</Badge>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3 border border-slate-200">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${roadmap.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Resources Progress */}
      <div className="mosaic-card p-4 bg-white text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
          Resource Lessons
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-[var(--ink-900)]">{resProgress}%</span>
          <Badge tone="info">Lessons</Badge>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3 border border-slate-200">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${resProgress}%` }} />
        </div>
      </div>

      {/* Practice Problems Progress */}
      <div className="mosaic-card p-4 bg-white text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
          LeetCode Practice
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-[var(--ink-900)]">{pracProgress}%</span>
          <Badge tone="purple">LeetCode</Badge>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3 border border-slate-200">
          <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${pracProgress}%` }} />
        </div>
      </div>

      {/* Project Progress */}
      <div className="mosaic-card p-4 bg-white text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
          Capstone Builds
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-black text-[var(--ink-900)]">{projProgress}%</span>
          <Badge tone="success">Builds</Badge>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3 border border-slate-200">
          <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${projProgress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
