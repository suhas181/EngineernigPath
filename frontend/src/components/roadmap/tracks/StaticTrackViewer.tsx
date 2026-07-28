import React, { useState, useEffect } from 'react';
import {
  Cpu,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronUp,
  ChevronDown,
  Code,
  Wrench,
  Youtube,
  FolderGit2,
  ExternalLink,
} from 'lucide-react';
import { StaticTrackMonth } from '../roadmap.types';

interface StaticTrackViewerProps {
  track: string;
  roadmapData: StaticTrackMonth[];
  trackTitle?: string;
  trackDescription?: string;
}

export const StaticTrackViewer: React.FC<StaticTrackViewerProps> = ({
  track,
  roadmapData,
  trackTitle,
  trackDescription,
}) => {
  const completedTopicsKey = `${track}_completed_topics`;
  const completedProjectsKey = `${track}_completed_projects`;

  // Local storage state
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [completedProjects, setCompletedProjects] = useState<Record<number, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  // Sync state when track changes (using useEffect since state needs to match localStorage)
  useEffect(() => {
    const savedTopics = localStorage.getItem(completedTopicsKey);
    setCompletedTopics(savedTopics ? JSON.parse(savedTopics) : {});

    const savedProjects = localStorage.getItem(completedProjectsKey);
    setCompletedProjects(savedProjects ? JSON.parse(savedProjects) : {});

    setExpandedMonths({ 1: true });
  }, [track, completedTopicsKey, completedProjectsKey]);

  // Update localStorage when state changes
  useEffect(() => {
    if (Object.keys(completedTopics).length > 0 || localStorage.getItem(completedTopicsKey)) {
      localStorage.setItem(completedTopicsKey, JSON.stringify(completedTopics));
    }
  }, [completedTopics, completedTopicsKey]);

  useEffect(() => {
    if (Object.keys(completedProjects).length > 0 || localStorage.getItem(completedProjectsKey)) {
      localStorage.setItem(completedProjectsKey, JSON.stringify(completedProjects));
    }
  }, [completedProjects, completedProjectsKey]);

  const toggleTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setCompletedTopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleProject = (monthNum: number) => {
    setCompletedProjects((prev) => ({
      ...prev,
      [monthNum]: !prev[monthNum],
    }));
  };

  const toggleMonthExpand = (monthNum: number) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthNum]: !prev[monthNum],
    }));
  };

  // Progress Calculations
  const totalTopics = roadmapData.reduce((sum, month) => sum + month.topics.length, 0);
  const totalProjects = roadmapData.length;
  const totalItems = totalTopics + totalProjects;

  const completedTopicsCount = Object.values(completedTopics).filter(Boolean).length;
  const completedProjectsCount = Object.values(completedProjects).filter(Boolean).length;
  const totalCompletedItems = completedTopicsCount + completedProjectsCount;

  const progress = totalItems > 0 ? Math.round((totalCompletedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn text-left font-sans">
      {/* Overall Progress Widget */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
            {track === 'ai-engineer' ? (
              <Cpu className="h-6 w-6 text-purple-400" />
            ) : (
              <TrendingUp className="h-6 w-6 text-blue-400" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">
              {trackTitle ||
                (track === 'ai-engineer'
                  ? 'AI Engineer Curriculum'
                  : track === 'data-scientist'
                  ? 'Data Scientist Curriculum'
                  : `${track.replace(/-/g, ' ').toUpperCase()} Curriculum`)}
            </h3>
            <p className="text-xs text-slate-400">
              {trackDescription ||
                (track === 'ai-engineer'
                  ? 'Practical, project-first path to production LLM apps'
                  : 'Comprehensive, tool-by-tool path to job readiness')}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-white/90">
            <span>{progress}% Completed</span>
            <span className="text-slate-400">
              {totalCompletedItems} / {totalItems} Milestones
            </span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                track === 'ai-engineer'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline detailing months */}
      <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
        {roadmapData.map((month) => {
          const isExpanded = !!expandedMonths[month.number];
          const completedProjectsInMonth = completedProjects[month.number] ? 1 : 0;

          // Calculate completed topics in this month
          const completedTopicsInMonth = month.topics.filter(
            (_, idx) => !!completedTopics[`m${month.number}-t${idx}`]
          ).length;

          const totalMonthItems = month.topics.length + 1;
          const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
          const isMonthCompleted = monthProgress === totalMonthItems;

          return (
            <div key={month.number} className="relative group">
              {/* Timeline Node Icon */}
              <button
                onClick={() => {
                  const targetState = !isMonthCompleted;

                  // Toggle project
                  setCompletedProjects((prev) => ({
                    ...prev,
                    [month.number]: targetState,
                  }));

                  // Toggle all topics
                  setCompletedTopics((prev) => {
                    const updated = { ...prev };
                    month.topics.forEach((_, idx) => {
                      updated[`m${month.number}-t${idx}`] = targetState;
                    });
                    return updated;
                  });
                }}
                className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-slate-950 z-10 cursor-pointer focus:outline-none ${
                  isMonthCompleted
                    ? 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'border-white/15 text-slate-400 group-hover:border-white/30'
                }`}
                title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
              >
                {isMonthCompleted ? (
                  <CheckCircle2 className="h-5 w-5 fill-purple-500/10" />
                ) : (
                  <span className="text-xs font-bold font-heading">{month.number}</span>
                )}
              </button>

              {/* Month Content Card */}
              <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10 bg-slate-900/15">
                {/* Header Summary */}
                <div
                  onClick={() => toggleMonthExpand(month.number)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                >
                  <div className="space-y-1 pr-4 text-left">
                    <h3
                      className={`text-lg font-bold font-heading transition ${
                        isMonthCompleted ? 'text-white/60 line-through' : 'text-white'
                      }`}
                    >
                      Month {month.number}: {month.title}
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> •{' '}
                      {monthProgress} / {totalMonthItems} completed
                    </p>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5 bg-transparent border-none focus:outline-none">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                    {/* Topics List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code className="h-4 w-4 text-indigo-400" />
                        <span>Core Concepts to Master</span>
                      </h4>

                      <div className="grid md:grid-cols-2 gap-3">
                        {month.topics.map((topic, idx) => {
                          const isTopicCompleted = !!completedTopics[`m${month.number}-t${idx}`];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleTopic(month.number, idx)}
                              className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                            >
                              <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-white transition bg-transparent border-none p-0 focus:outline-none">
                                {isTopicCompleted ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 fill-purple-500/10" />
                                ) : (
                                  <Circle className="h-4.5 w-4.5 text-white/20" />
                                )}
                              </button>
                              <span
                                className={`text-xs leading-relaxed ${
                                  isTopicCompleted ? 'text-white/40 line-through' : 'text-white/85'
                                }`}
                              >
                                {topic}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tools list */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-cyan-400" />
                        <span>Recommended Tools & Tech Stack</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {month.tools.map((tool, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* YouTube Channels */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Youtube className="h-4 w-4 text-rose-500" />
                        <span>Curated YouTube Channels</span>
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {month.youtube.map((yt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {yt.bestFor}
                              </p>
                            </div>
                            <a
                              href={yt.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                              title={`Search ${yt.channel}`}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Month Project Card */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FolderGit2 className="h-4 w-4 text-emerald-400" />
                        <span>Monthly Build Challenge</span>
                      </h4>

                      <div
                        onClick={() => toggleProject(month.number)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                          completedProjects[month.number]
                            ? 'border-purple-500/40 bg-purple-500/[0.02]'
                            : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                        }`}
                      >
                        {/* Light background glow effect */}
                        <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-indigo-500/5 rounded-full blur-2xl" />

                        <div className="flex items-start space-x-4">
                          <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-white transition bg-transparent border-none p-0 focus:outline-none">
                            {completedProjects[month.number] ? (
                              <CheckCircle2 className="h-5 w-5 text-purple-400 fill-purple-500/10" />
                            ) : (
                              <Circle className="h-5 w-5 text-white/20" />
                            )}
                          </button>
                          <div className="text-left space-y-1">
                            <h5
                              className={`text-sm font-bold ${
                                completedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'
                              }`}
                            >
                              {month.project.title}
                            </h5>
                            <p
                              className={`text-xs leading-relaxed ${
                                completedProjects[month.number]
                                  ? 'text-slate-400/50'
                                  : 'text-slate-400'
                              }`}
                            >
                              {month.project.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaticTrackViewer;
