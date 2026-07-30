import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '../../mosaic/Badge';

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
    <div className="mosaic-card p-5 bg-white text-left space-y-3">
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
        Priority Learning Queue
      </span>

      <div className="space-y-2">
        {todayPath.map((task, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Badge tone={task.type === 'Project' ? 'purple' : task.type === 'Problem' ? 'warning' : 'info'}>
                {task.type}
              </Badge>
              <span className="text-slate-800 font-semibold truncate block">{task.title}</span>
            </div>

            {task.url && (
              <a
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-800 transition p-1"
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
