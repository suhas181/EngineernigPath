import React, { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { RoadmapData } from './roadmap.types';
import { RoadmapTabType } from './RoadmapTabs';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface RoadmapHeaderProps {
  activeTab: RoadmapTabType;
  roadmap: RoadmapData | null;
  onGenerate: (regenerate: boolean) => void;
}

const TIMELINE_OPTIONS = ['3 Months', '4 Months', '5 Months', '6 Months', '8 Months'] as const;

export const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({
  activeTab,
  roadmap,
  onGenerate,
}) => {
  const { user, updateUser } = useAuthStore();
  const [isUpdatingTimeline, setIsUpdatingTimeline] = useState(false);

  const handleRegenerateClick = () => {
    if (
      window.confirm(
        'Are you sure you want to regenerate? Completed months are saved, but future months will be recalculated.'
      )
    ) {
      onGenerate(true);
    }
  };

  const handleTimelineChange = async (newTimeline: string) => {
    if (newTimeline === user?.placementTimeline) return;
    try {
      setIsUpdatingTimeline(true);
      await api.patch('/users/profile', { placementTimeline: newTimeline });
      updateUser({ placementTimeline: newTimeline as any });
      toast.success(`Preparation timeline updated to ${newTimeline}. Recalculating roadmap...`);
      onGenerate(true);
    } catch (err) {
      console.error('Failed to update placement timeline:', err);
      toast.error('Failed to update timeline settings');
    } finally {
      setIsUpdatingTimeline(false);
    }
  };

  const getBadgeText = () => {
    if (activeTab === 'personalized') {
      return `${user?.preferredCareer || 'Career'} Prep (${user?.placementTimeline || '6 Months'})`;
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
    }
    const titleMap: Record<string, string> = {
      'software-engineer': 'Software Engineer (SDE) Track — 6-Month Plan',
      'frontend-engineer': 'Frontend Engineer Track — 6-Month Plan',
      'backend-engineer': 'Backend Engineer Track — 6-Month Plan',
      'fullstack-developer': 'Full Stack Developer Track — 6-Month Plan',
      'ai-ml-engineer': 'AI / ML Engineer Track — 6-Month Plan',
      'data-scientist-analyst': 'Data Scientist / Analyst Track — 6-Month Plan',
      'devops-engineer': 'DevOps Engineer Track — 6-Month Plan',
      'mobile-app-developer': 'Mobile App Developer Track — 6-Month Plan',
      'java-developer': 'Java Developer Track — 5-Month Plan',
      'python-backend': 'Python Backend Track — 5-Month Plan',
      'flutter': 'Flutter Mobile Track — 5-Month Plan',
      'cybersecurity': 'Cybersecurity Analyst Track — 5-Month Plan',
    };
    return titleMap[activeTab] || 'Featured Exploration Track';
  };

  const getDescriptionText = () => {
    if (activeTab === 'personalized') {
      return roadmap
        ? roadmap.description
        : 'Unlock a step-by-step career path specifically curated for you. We analyze your profile information to construct standard topics, resource lists, and progress checkers.';
    }
    return 'A structured, month-by-month curriculum designed to take you from foundational concepts to job-ready engineering placement.';
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 text-left">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {getBadgeText()}
          </span>
          {activeTab === 'personalized' && roadmap?.source && (
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
              roadmap.source === 'gemini'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 glow-primary'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {roadmap.source === 'gemini' ? '✨ GEMINI AI' : '⚡ INTELLIGENT FALLBACK'}
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">{getSubTagText()}</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">{getTitleText()}</h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{getDescriptionText()}</p>
      </div>

      {activeTab === 'personalized' && roadmap && (
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 space-x-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Timeline:</span>
            <select
              value={user?.placementTimeline || '6 Months'}
              disabled={isUpdatingTimeline}
              onChange={(e) => handleTimelineChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
            >
              {TIMELINE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRegenerateClick}
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RoadmapHeader;
