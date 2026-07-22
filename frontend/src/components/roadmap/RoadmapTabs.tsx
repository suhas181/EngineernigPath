import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface RoadmapTabsProps {
  activeTab: 'personalized' | 'ai-engineer' | 'data-scientist';
  setActiveTab: (tab: 'personalized' | 'ai-engineer' | 'data-scientist') => void;
}

export const RoadmapTabs: React.FC<RoadmapTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-px mb-8 text-left">
      <button
        onClick={() => setActiveTab('personalized')}
        className={`pb-4 px-4 font-semibold text-sm transition-all relative ${
          activeTab === 'personalized'
            ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        Personalized Pathway
      </button>
      <button
        onClick={() => setActiveTab('ai-engineer')}
        className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
          activeTab === 'ai-engineer'
            ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Sparkles
          className={`h-4 w-4 ${
            activeTab === 'ai-engineer' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        />
        <span>AI Engineer Track (6-Month)</span>
      </button>
      <button
        onClick={() => setActiveTab('data-scientist')}
        className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
          activeTab === 'data-scientist'
            ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <TrendingUp
          className={`h-4 w-4 ${
            activeTab === 'data-scientist' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        />
        <span>Data Scientist Track (6-Month)</span>
      </button>
    </div>
  );
};

export default RoadmapTabs;
