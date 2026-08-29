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
import { Badge } from '../../mosaic/Badge';
import { recordResourceOpened } from '../../../services/recentResourceService';

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

  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [completedProjects, setCompletedProjects] = useState<Record<number, boolean>>({});
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    const savedTopics = localStorage.getItem(completedTopicsKey);
    setCompletedTopics(savedTopics ? JSON.parse(savedTopics) : {});

    const savedProjects = localStorage.getItem(completedProjectsKey);
    setCompletedProjects(savedProjects ? JSON.parse(savedProjects) : {});

    setExpandedMonths({ 1: true });
  }, [track, completedTopicsKey, completedProjectsKey]);

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
      <div className="mosaic-card p-6 flex flex-col sm:flex-row items-center justify-between border border-[var(--card-border)] bg-white gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
            {track === 'ai-engineer' ? (
              <Cpu className="h-6 w-6 text-teal-600" />
            ) : (
              <TrendingUp className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-[var(--ink-900)] font-heading">
              {trackTitle ||
                (track === 'ai-engineer'
                  ? 'AI Engineer Curriculum'
                  : track === 'data-scientist'
                  ? 'Data Scientist Curriculum'
                  : `${track.replace(/-/g, ' ').toUpperCase()} Curriculum`)}
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              {trackDescription ||
                (track === 'ai-engineer'
                  ? 'Practical, project-first path to production LLM apps'
                  : 'Comprehensive, tool-by-tool path to job readiness')}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[var(--ink-900)]">
            <span>{progress}% Completed</span>
            <span className="text-[var(--ink-muted)]">
              {totalCompletedItems} / {totalItems} Milestones
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline detailing months */}
      <div className="relative border-l border-slate-200 ml-4 pl-8 space-y-8 text-left">
        {roadmapData.map((month) => {
          const isExpanded = !!expandedMonths[month.number];
          const completedProjectsInMonth = completedProjects[month.number] ? 1 : 0;

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

                  setCompletedProjects((prev) => ({
                    ...prev,
                    [month.number]: targetState,
                  }));

                  setCompletedTopics((prev) => {
                    const updated = { ...prev };
                    month.topics.forEach((_, idx) => {
                      updated[`m${month.number}-t${idx}`] = targetState;
                    });
                    return updated;
                  });
                }}
                className={`absolute -left-[45px] top-4 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all z-10 cursor-pointer focus:outline-none ${
                  isMonthCompleted
                    ? 'bg-teal-600 border-teal-700 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-teal-600'
                }`}
                title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
              >
                {isMonthCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-bold font-heading">{month.number}</span>
                )}
              </button>

              {/* Month Content Card */}
              <div className="mosaic-card p-0 bg-white border border-[var(--card-border)] overflow-hidden transition-all duration-200">
                {/* Header Summary */}
                <div
                  onClick={() => toggleMonthExpand(month.number)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 select-none"
                >
                  <div className="space-y-1 pr-4 text-left">
                    <h3
                      className={`text-base font-extrabold font-heading transition ${
                        isMonthCompleted ? 'text-slate-400 line-through' : 'text-[var(--ink-900)]'
                      }`}
                    >
                      Month {month.number}: {month.title}
                    </h3>
                    <p className="text-[var(--ink-muted)] text-xs">
                      Focus: <span className="text-teal-700 font-bold">{month.focus}</span> •{' '}
                      {monthProgress} / {totalMonthItems} completed
                    </p>
                  </div>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-full hover:bg-slate-100 bg-transparent border-none focus:outline-none">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-6">
                    {/* Topics List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                        <Code className="h-4 w-4 text-teal-600" />
                        <span>Core Concepts to Master</span>
                      </h4>

                      <div className="grid md:grid-cols-2 gap-3">
                        {month.topics.map((topic, idx) => {
                          const isTopicCompleted = !!completedTopics[`m${month.number}-t${idx}`];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleTopic(month.number, idx)}
                              className="flex items-start space-x-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition cursor-pointer select-none"
                            >
                              <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-slate-700 transition bg-transparent border-none p-0 focus:outline-none">
                                {isTopicCompleted ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                                ) : (
                                  <Circle className="h-4.5 w-4.5 text-slate-300" />
                                )}
                              </button>
                              <span
                                className={`text-xs leading-relaxed ${
                                  isTopicCompleted ? 'text-slate-400 line-through' : 'text-slate-900 font-medium'
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
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                        <Wrench className="h-4 w-4 text-blue-600" />
                        <span>Recommended Tools & Tech Stack</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {month.tools.map((tool, idx) => (
                          <Badge key={idx} tone="info">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* YouTube Channels */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                        <Youtube className="h-4 w-4 text-rose-600" />
                        <span>Curated YouTube Channels</span>
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {month.youtube.map((yt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition gap-4"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900">{yt.channel}</h5>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {yt.bestFor}
                              </p>
                            </div>
                            <a
                              href={yt.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                recordResourceOpened({
                                  id: `yt-channel-${yt.channel}`,
                                  title: `${yt.channel} (${yt.bestFor})`,
                                  provider: 'YouTube',
                                  type: 'video',
                                  url: yt.searchUrl,
                                });
                              }}
                              className="flex-shrink-0 text-teal-600 hover:text-teal-800 transition bg-slate-50 hover:bg-slate-100 p-2 rounded-lg"
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
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                        <FolderGit2 className="h-4 w-4 text-emerald-600" />
                        <span>Monthly Build Challenge</span>
                      </h4>

                      <div
                        onClick={() => toggleProject(month.number)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer select-none bg-white ${
                          completedProjects[month.number]
                            ? 'border-emerald-300 bg-emerald-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-slate-700 transition bg-transparent border-none p-0 focus:outline-none">
                            {completedProjects[month.number] ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300" />
                            )}
                          </button>
                          <div className="text-left space-y-1">
                            <h5
                              className={`text-xs font-bold ${
                                completedProjects[month.number] ? 'text-slate-400 line-through' : 'text-slate-900'
                              }`}
                            >
                              {month.project.title}
                            </h5>
                            <p
                              className={`text-[11px] leading-relaxed ${
                                completedProjects[month.number]
                                  ? 'text-slate-400'
                                  : 'text-slate-600'
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
