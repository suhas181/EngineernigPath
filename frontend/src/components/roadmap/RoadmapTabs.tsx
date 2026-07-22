import React from 'react';
import { Sparkles, TrendingUp, Target, Code, BookOpen, Server, Cpu } from 'lucide-react';

export type RoadmapTabType =
  | 'personalized'
  | 'ai-engineer'
  | 'data-scientist'
  | 'data-analyst'
  | 'cybersecurity'
  | 'java-developer'
  | 'software-engineer'
  | 'devops'
  | 'flutter'
  | 'python-backend';

interface RoadmapTabsProps {
  activeTab: RoadmapTabType;
  setActiveTab: (tab: RoadmapTabType) => void;
}

const tabs: { id: RoadmapTabType; label: string; icon?: React.ElementType }[] = [
  { id: 'personalized', label: 'Personalized Pathway' },
  { id: 'ai-engineer', label: 'AI Engineer Track (6-Month)', icon: Sparkles },
  { id: 'data-scientist', label: 'Data Scientist Track (6-Month)', icon: TrendingUp },
  { id: 'data-analyst', label: 'Data Analyst Track (5-Month)', icon: TrendingUp },
  { id: 'cybersecurity', label: 'Cybersecurity Track (5-Month)', icon: Target },
  { id: 'java-developer', label: 'Java Developer Track (5-Month)', icon: Code },
  { id: 'software-engineer', label: 'Software Engineer Track (5-Month)', icon: BookOpen },
  { id: 'devops', label: 'DevOps Track (5-Month)', icon: Server },
  { id: 'flutter', label: 'Flutter Track (5-Month)', icon: Cpu },
  { id: 'python-backend', label: 'Python Backend Track (5-Month)', icon: Code },
];

export const RoadmapTabs: React.FC<RoadmapTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-px mb-8 text-left">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 border-none bg-transparent cursor-pointer ${
              isActive
                ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {Icon && (
              <Icon
                className={`h-4 w-4 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400'
                }`}
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoadmapTabs;
