import React from 'react';
import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import { PracticeProblem } from '../roadmap.types';

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
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced':
      case 'hard':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'intermediate':
      case 'medium':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  return (
    <div className="space-y-2 text-left">
      <span className="text-[10px] text-slate-400 uppercase font-bold block">
        Target Practice Problems:
      </span>
      <div className="space-y-1.5 font-sans">
        {problems.map((prob) => (
          <div
            key={prob.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition text-xs"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <button
                onClick={() => onToggle(topicId, undefined, prob.id, undefined)}
                className="text-slate-400 hover:text-white transition flex-shrink-0 bg-transparent border-none p-0 focus:outline-none"
              >
                {prob.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/10" />
                ) : (
                  <Circle className="h-4 w-4 text-white/30" />
                )}
              </button>
              <span
                className={`font-semibold truncate block ${
                  prob.isCompleted ? 'text-slate-500 line-through' : 'text-white'
                }`}
              >
                {prob.title}
              </span>
              <span
                className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyStyles(
                  prob.difficulty
                )}`}
              >
                {prob.difficulty}
              </span>
            </div>

            <a
              href={prob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition p-1 bg-white/5 hover:bg-white/10 rounded"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeProblems;
