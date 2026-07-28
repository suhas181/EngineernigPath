import React from 'react';
import { Sparkles, TrendingUp, Target, Code, BookOpen, Server, Cpu, Layers, Layout, Smartphone } from 'lucide-react';
import { CANONICAL_CAREER_PATHS } from '../../constants/careerPaths';

export type RoadmapTabType =
  | 'personalized'
  // 8 Canonical Career Path Tracks (1-to-1 match with CANONICAL_CAREER_PATHS)
  | 'software-engineer'
  | 'frontend-engineer'
  | 'backend-engineer'
  | 'fullstack-developer'
  | 'ai-ml-engineer'
  | 'data-scientist-analyst'
  | 'devops-engineer'
  | 'mobile-app-developer'
  // Specialized Bonus Tech Tracks
  | 'java-developer'
  | 'python-backend'
  | 'flutter'
  | 'cybersecurity';

interface RoadmapTabsProps {
  activeTab: RoadmapTabType;
  setActiveTab: (tab: RoadmapTabType) => void;
}

export const canonicalTabs: { id: RoadmapTabType; label: string; canonicalName: string; icon: React.ElementType }[] = [
  { id: 'software-engineer', label: 'Software Engineer (SDE) Track', canonicalName: CANONICAL_CAREER_PATHS[0], icon: BookOpen },
  { id: 'frontend-engineer', label: 'Frontend Engineer Track', canonicalName: CANONICAL_CAREER_PATHS[1], icon: Layout },
  { id: 'backend-engineer', label: 'Backend Engineer Track', canonicalName: CANONICAL_CAREER_PATHS[2], icon: Server },
  { id: 'fullstack-developer', label: 'Full Stack Developer Track', canonicalName: CANONICAL_CAREER_PATHS[3], icon: Layers },
  { id: 'ai-ml-engineer', label: 'AI / ML Engineer Track', canonicalName: CANONICAL_CAREER_PATHS[4], icon: Sparkles },
  { id: 'data-scientist-analyst', label: 'Data Scientist / Analyst Track', canonicalName: CANONICAL_CAREER_PATHS[5], icon: TrendingUp },
  { id: 'devops-engineer', label: 'DevOps Engineer Track', canonicalName: CANONICAL_CAREER_PATHS[6], icon: Server },
  { id: 'mobile-app-developer', label: 'Mobile App Developer Track', canonicalName: CANONICAL_CAREER_PATHS[7], icon: Smartphone },
];

export const specializedTabs: { id: RoadmapTabType; label: string; icon: React.ElementType }[] = [
  { id: 'java-developer', label: 'Java Developer Track (5-Month)', icon: Code },
  { id: 'python-backend', label: 'Python Backend Track (5-Month)', icon: Code },
  { id: 'flutter', label: 'Flutter Track (5-Month)', icon: Cpu },
  { id: 'cybersecurity', label: 'Cybersecurity Track (5-Month)', icon: Target },
];

export const RoadmapTabs: React.FC<RoadmapTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="space-y-4 mb-8 text-left">
      {/* Primary Canonical Career Path Tabs */}
      <div>
        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-2">
          Core Career Path Exploration Tracks (6-Month Curricula)
        </span>
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`pb-2.5 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 border-none bg-transparent cursor-pointer ${
              activeTab === 'personalized'
                ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Personalized Pathway</span>
          </button>

          {canonicalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2.5 px-3.5 font-semibold text-xs transition-all relative flex items-center space-x-1.5 border-none bg-transparent cursor-pointer ${
                  isActive
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Specialized Bonus Tech Tracks */}
      <div className="pt-1">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-2">
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
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
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
