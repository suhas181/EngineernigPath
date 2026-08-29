import React from 'react';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { PracticeProblem } from '../roadmap.types';
import { Badge } from '../../mosaic/Badge';
import { recordResourceOpened } from '../../../services/recentResourceService';

interface PracticeProblemsProps {
  topicId: string;
  problems: PracticeProblem[];
  onToggle: (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: any,
    isCompletedMonth?: boolean
  ) => void;
}

export const PracticeProblems: React.FC<PracticeProblemsProps> = ({
  topicId,
  problems,
  onToggle,
}) => {
  const getDifficultyTone = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'advanced':
      case 'hard':
        return 'danger';
      case 'intermediate':
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <div className="space-y-2 text-left">
      <span className="text-[10px] text-[var(--ink-muted)] uppercase font-bold tracking-wider block">
        Target Practice Problems
      </span>
      <div className="space-y-1.5 font-sans">
        {problems.map((prob) => (
          <div
            key={prob.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition text-xs"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <button
                onClick={() => onToggle(topicId, undefined, prob.id, undefined)}
                className="text-slate-400 hover:text-slate-700 transition flex-shrink-0 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
              >
                {prob.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
              </button>
              <span
                className={`font-semibold truncate block ${
                  prob.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                }`}
              >
                {prob.title}
              </span>
              <Badge tone={getDifficultyTone(prob.difficulty) as any}>
                {prob.difficulty}
              </Badge>
            </div>

            <a
              href={prob.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                recordResourceOpened({
                  id: prob.id,
                  resourceId: prob.id,
                  title: prob.title,
                  type: 'practice',
                  url: prob.url,
                });
              }}
              className="text-teal-600 hover:text-teal-800 transition p-1 rounded"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeProblems;
