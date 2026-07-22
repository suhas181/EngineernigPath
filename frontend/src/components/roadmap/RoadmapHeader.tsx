import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RoadmapData } from './roadmap.types';
import { useAuthStore } from '../../store/useAuthStore';

interface RoadmapHeaderProps {
  activeTab: 'personalized' | 'ai-engineer' | 'data-scientist';
  roadmap: RoadmapData | null;
  onGenerate: (regenerate: boolean) => void;
}

export const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({
  activeTab,
  roadmap,
  onGenerate,
}) => {
  const { user } = useAuthStore();

  const handleRegenerateClick = () => {
    if (
      window.confirm(
        'Are you sure you want to regenerate? Completed months are saved, but future months will be recalculated.'
      )
    ) {
      onGenerate(true);
    }
  };

  const getBadgeText = () => {
    if (activeTab === 'personalized') {
      return `SDE Prep Timelines (v${roadmap?.version || '2.0.0'})`;
    }
    return 'Featured Track';
  };

  const getSubTagText = () => {
    if (activeTab === 'personalized') {
      return `Targeting ${user?.targetCompanyType || 'Product-Based'} recruitment`;
    }
    return '6-Month Curriculum';
  };

  const getTitleText = () => {
    if (activeTab === 'personalized') {
      return roadmap ? roadmap.title : 'Generate Your AI Career Roadmap';
    } else if (activeTab === 'ai-engineer') {
      return 'AI Engineer Roadmap — 6 Month Plan';
    }
    return 'Data Scientist Roadmap — 6 Month Plan';
  };

  const getDescriptionText = () => {
    if (activeTab === 'personalized') {
      return roadmap
        ? roadmap.description
        : 'Unlock a step-by-step career path specifically curated for you. We will analyze your profile information to construct standard topics, resource lists, and progress checkers.';
    } else if (activeTab === 'ai-engineer') {
      return 'A practical, project-first path from Python basics to building and deploying production AI/LLM applications.';
    }
    return 'A structured, tool-by-tool, month-by-month plan to go from beginner to job-ready data scientist in 6 months.';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 text-left">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {getBadgeText()}
          </span>
          {activeTab === 'personalized' && roadmap?.source && (
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
              roadmap.source === 'gemini'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {roadmap.source}
            </span>
          )}
          <span className="text-xs text-slate-400">{getSubTagText()}</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-white">{getTitleText()}</h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{getDescriptionText()}</p>
      </div>

      {activeTab === 'personalized' && roadmap && (
        <div className="flex-shrink-0">
          <button
            onClick={handleRegenerateClick}
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Regenerate Roadmap</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RoadmapHeader;
