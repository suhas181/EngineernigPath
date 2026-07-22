import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface PathTask {
  title: string;
  type: 'Resource' | 'Problem' | 'Project';
  url?: string;
}

interface LearningPathCardProps {
  todayPath: PathTask[];
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({ todayPath }) => {
  return (
    <div className="pt-3 border-t border-white/5 text-left">
      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">
        Priority Learning Queue:
      </span>
      <div className="space-y-2">
        {todayPath.map((task, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <span className="bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded text-[10px]">
                {task.type}
              </span>
              <span className="text-white/80 font-medium truncate block">{task.title}</span>
            </div>
            {task.url && (
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-white transition p-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ))}
        {!todayPath.length && (
          <div className="text-xs text-slate-400 italic text-center py-2">
            No pending tasks for today. Month fully completed!
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathCard;
