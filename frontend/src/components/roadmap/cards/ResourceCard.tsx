import React from 'react';
import { ExternalLink, Video, Book, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { Resource } from '../roadmap.types';

interface ResourceCardProps {
  topicId: string;
  resource: Resource;
  onToggle: (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: any,
    isCompletedMonth?: boolean
  ) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  topicId,
  resource,
  onToggle,
}) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-3.5 w-3.5 text-blue-600" />;
      case 'book':
        return <Book className="h-3.5 w-3.5 text-emerald-600" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-amber-600" />;
    }
  };

  const getPlatformFromUrl = (url: string): string => {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
      if (hostname.includes('takeuforward.org')) return 'takeUforward';
      if (hostname.includes('neetcode.io')) return 'NeetCode';
      if (hostname.includes('leetcode.com')) return 'LeetCode';
      if (hostname.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
      if (hostname.includes('github.com')) return 'GitHub';
      return hostname.split('.')[0] || 'Official Docs';
    } catch (e) {
      return 'Official Guide';
    }
  };

  return (
    <div className="bg-white border border-[var(--card-border)] rounded-xl p-3.5 hover:shadow-sm transition flex flex-col justify-between h-full space-y-3 text-left">
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {getPlatformFromUrl(resource.url)}
          </span>
          <button
            onClick={() => onToggle(topicId, resource.id, undefined, undefined)}
            className="text-slate-400 hover:text-slate-700 transition bg-transparent border-none p-0 focus:outline-none cursor-pointer"
          >
            {resource.isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Circle className="h-4 w-4 text-slate-300" />
            )}
          </button>
        </div>
        <h6
          className={`text-xs font-bold leading-snug line-clamp-2 ${
            resource.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {resource.title}
        </h6>
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
        <span className="flex items-center space-x-1 text-[10px] font-semibold text-slate-500 capitalize">
          {getResourceIcon(resource.type)}
          <span>{resource.type}</span>
        </span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal-600 hover:text-teal-800 transition flex items-center space-x-1 font-bold"
        >
          <span>Study</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
