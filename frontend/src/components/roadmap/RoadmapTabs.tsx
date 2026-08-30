import React from 'react';
import { Sparkles, TrendingUp, Target, Code, BookOpen, Server, Cpu, Layers, Layout, Smartphone } from 'lucide-react';
import { CANONICAL_CAREER_PATHS } from '../../constants/careerPaths';

export type RoadmapTabType =
  | 'personalized'
  | 'software-engineer'
  | 'frontend-engineer'
  | 'backend-engineer'
  | 'fullstack-developer'
  | 'ai-ml-engineer'
  | 'data-scientist-analyst'
  | 'devops-engineer'
  | 'mobile-app-developer'
  | 'java-developer'
  | 'python-backend'
  | 'flutter'
  | 'cybersecurity';

interface RoadmapTabsProps {
  activeTab: RoadmapTabType;
  setActiveTab: (tab: RoadmapTabType) => void;
}

export const canonicalTabs: { id: RoadmapTabType; label: string; canonicalName: string; icon: React.ElementType }[] = [
  { id: 'software-engineer', label: 'Software Engineer (SDE)', canonicalName: CANONICAL_CAREER_PATHS[0], icon: BookOpen },
  { id: 'frontend-engineer', label: 'Frontend Engineer', canonicalName: CANONICAL_CAREER_PATHS[1], icon: Layout },
  { id: 'backend-engineer', label: 'Backend Engineer', canonicalName: CANONICAL_CAREER_PATHS[2], icon: Server },
  { id: 'fullstack-developer', label: 'Full Stack Developer', canonicalName: CANONICAL_CAREER_PATHS[3], icon: Layers },
  { id: 'ai-ml-engineer', label: 'AI / ML Engineer', canonicalName: CANONICAL_CAREER_PATHS[4], icon: Sparkles },
  { id: 'data-scientist-analyst', label: 'Data Scientist', canonicalName: CANONICAL_CAREER_PATHS[5], icon: TrendingUp },
  { id: 'devops-engineer', label: 'DevOps Engineer', canonicalName: CANONICAL_CAREER_PATHS[6], icon: Server },
  { id: 'mobile-app-developer', label: 'Mobile App Developer', canonicalName: CANONICAL_CAREER_PATHS[7], icon: Smartphone },
];

export const specializedTabs: { id: RoadmapTabType; label: string; icon: React.ElementType }[] = [
  { id: 'java-developer', label: 'Java Track (5-Mo)', icon: Code },
  { id: 'python-backend', label: 'Python Track (5-Mo)', icon: Code },
  { id: 'flutter', label: 'Flutter Track (5-Mo)', icon: Cpu },
  { id: 'cybersecurity', label: 'Cybersecurity Track (5-Mo)', icon: Target },
];

export const RoadmapTabs: React.FC<RoadmapTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="space-y-4 mb-6 text-left">
      {/* Primary Canonical Career Path Tabs */}
      <div>
        <span className="text-[10px] uppercase font-extrabold text-[var(--ink-muted)] tracking-wider block mb-2">
          Career Path Exploration Tracks
        </span>
        <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-2">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`pb-2.5 px-4 font-bold text-xs transition-all relative flex items-center space-x-2 border-none bg-transparent cursor-pointer ${
              activeTab === 'personalized'
                ? 'text-teal-700 dark:text-teal-400 font-extrabold border-b-2 border-teal-600 dark:border-teal-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Personalized Pathway</span>
          </button>

          {canonicalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-3 font-semibold text-xs transition-all relative flex items-center space-x-1.5 border-none bg-transparent cursor-pointer ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400 font-extrabold border-b-2 border-teal-600 dark:border-teal-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Specialized Tech Tracks */}
      <div className="pt-1">
        <span className="text-[10px] uppercase font-extrabold text-[var(--ink-muted)] tracking-wider block mb-2">
          Specialized Technology Tracks
        </span>
        <div className="flex flex-wrap gap-2">
          {specializedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-300 font-extrabold'
                    : 'bg-white dark:bg-slate-900 border border-[var(--card-border)] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapTabs;
