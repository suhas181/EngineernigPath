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
        return <Video className="h-4 w-4 text-blue-400" />;
      case 'book':
        return <Book className="h-4 w-4 text-emerald-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-amber-400" />;
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
    <div className="glass-card rounded-xl p-3 border border-white/5 bg-slate-900/40 hover:border-white/10 transition flex flex-col justify-between h-full space-y-3 text-left">
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {getPlatformFromUrl(resource.url)}
          </span>
          <button
            onClick={() => onToggle(topicId, resource.id, undefined, undefined)}
            className="text-slate-400 hover:text-white transition bg-transparent border-none p-0 focus:outline-none"
          >
            {resource.isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/10" />
            ) : (
              <Circle className="h-4 w-4 text-white/30" />
            )}
          </button>
        </div>
        <h6
          className={`text-xs font-bold leading-snug line-clamp-2 ${
            resource.isCompleted ? 'text-slate-500 line-through' : 'text-white'
          }`}
        >
          {resource.title}
        </h6>
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="flex items-center space-x-1 text-[9px] text-slate-400 capitalize">
          {getResourceIcon(resource.type)}
          <span>{resource.type}</span>
        </span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-white transition flex items-center space-x-1 font-semibold"
        >
          <span>Study</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
