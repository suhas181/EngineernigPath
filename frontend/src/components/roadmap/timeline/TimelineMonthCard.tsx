import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronUp,
  ChevronDown,
  Clock,
  ExternalLink,
  Video,
  FileText,
  Code2,
  HelpCircle,
  FolderGit2,
  RotateCcw,
  Sparkles,
  Layers,
  Star
} from 'lucide-react';
import { Topic, RoadmapData, Resource, PracticeProblem } from '../roadmap.types';
import { Badge } from '../../mosaic/Badge';

interface ProjectState {
  github: string;
  demo: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface TimelineMonthCardProps {
  topic: Topic;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (topicId: string) => void;
  roadmap?: RoadmapData;
  onToggle: (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: any,
    isCompletedMonth?: boolean
  ) => void;
  projectSubmissions?: Record<string, ProjectState>;
  setProjectSubmissions?: React.Dispatch<
    React.SetStateAction<Record<string, ProjectState>>
  >;
  onSubmitProjectDetails?: (topicId: string) => void;
}

export const TimelineMonthCard: React.FC<TimelineMonthCardProps> = ({
  topic,
  index,
  isExpanded,
  onToggleExpand,
  onToggle
}) => {
  const monthNum = index + 1;

  // Accordions for alternatives (collapsed by default)
  const [showAltVideos, setShowAltVideos] = useState(false);
  const [showAltNotes, setShowAltNotes] = useState(false);
  const [showAltSheets, setShowAltSheets] = useState(false);

  // Monthly Checklist Local State
  const [checklist, setChecklist] = useState({
    videos: false,
    practice: false,
    project: false,
    revision: false,
    readyForNextMonth: false,
  });

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper for Resource Platform Tag
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
    } catch {
      return 'Official Guide';
    }
  };

  // Resources Categorization
  const allResources = topic.resources || [];
  const videos = allResources.filter((r) => r.type === 'video' || r.stage === 'learn');
  const notes = allResources.filter((r) => r.type === 'documentation' || r.type === 'article' || r.stage === 'notes');
  const practiceProbs = (topic.practiceProblems || []).slice(0, 8); // Cap at 5-10 max
  const revisionRes = topic.revisionResources?.length ? topic.revisionResources : allResources.filter((r) => r.stage === 'revision');

  // Mentor Selection
  const primaryVideo: Resource | undefined = topic.primaryVideo || videos[0];
  const alternativeVideos: Resource[] = topic.alternativeVideos || videos.slice(1);

  const primaryNote: Resource | undefined = topic.primaryNote || notes[0];
  const alternativeNotes: Resource[] = topic.alternativeNotes || notes.slice(1);

  const primaryDsaSheet = topic.primaryDsaSheet || {
    name: '⭐ Striver A2Z Sheet',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    badge: 'Recommended'
  };

  const alternativeDsaSheets = topic.alternativeDsaSheets || [
    { name: 'NeetCode 150', url: 'https://neetcode.io/practice' },
    { name: 'Blind 75', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions' },
    { name: 'LeetCode Explore', url: 'https://leetcode.com/explore/' },
    { name: 'GFG Practice', url: 'https://www.geeksforgeeks.org/explore' }
  ];

  // Calculate Progress
  const totalCount = allResources.length + (topic.practiceProblems?.length || 0) + (topic.project ? 1 : 0);
  const completedCount =
    allResources.filter((r) => r.isCompleted).length +
    (topic.practiceProblems || []).filter((p) => p.isCompleted).length +
    (topic.project?.isCompleted ? 1 : 0);

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : topic.isCompleted ? 100 : 0;

  const difficultyTone =
    topic.difficulty?.toLowerCase() === 'advanced'
      ? 'danger'
      : topic.difficulty?.toLowerCase() === 'intermediate'
      ? 'warning'
      : 'success';

  return (
    <div className="relative pl-6 md:pl-10 pb-8 border-l-2 border-slate-200 last:border-l-0 text-left">
      {/* Month Marker Circle */}
      <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-xs font-bold text-teal-700 shadow-sm font-heading">
        {monthNum}
      </div>

      {/* Main Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow transition-all duration-200 overflow-hidden">
        {/* Month Header Banner */}
        <div className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 bg-white border-b border-slate-100">
          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest font-heading">
                Month {monthNum}
              </span>
              <span className="text-slate-300">•</span>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 font-heading">
                {topic.title.replace(/^Month \d+:\s*/, '')}
              </h3>
              <Badge tone={difficultyTone as any}>{topic.difficulty || 'Beginner'}</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{topic.description}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Estimated Hours */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{topic.estimatedStudyHours || 35} hrs</span>
            </div>

            {/* Progress Percentage */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{progressPercent}%</span>
            </div>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => onToggleExpand(topic.id)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle Expand Month"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Inside Expanded Month */}
        {isExpanded && (
          <div className="p-5 md:p-6 space-y-8 bg-white">
            {/* 1. Learning Objectives */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                1. Learning Objectives
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                {(topic.topics || topic.learningObjectives || ['Arrays', 'Strings', 'Sorting', 'Binary Search']).map(
                  (item, idx) => (
                    <li key={idx} className="text-xs font-medium text-slate-700 flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* 2. Primary Study Resources (Mentor Guided) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-600" />
                2. Recommended Primary Video Playlist
              </h4>

              {/* 🎥 Primary Video Card */}
              {primaryVideo ? (
                <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggle(topic.id, primaryVideo.id)}
                      className="text-slate-400 hover:text-teal-600 transition shrink-0 bg-transparent border-none p-0 cursor-pointer mt-0.5"
                    >
                      {primaryVideo.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          PRIMARY PLAYLIST
                        </span>
                        <span className="text-[10px] font-bold text-teal-800 uppercase">
                          {primaryVideo.provider} • {getPlatformFromUrl(primaryVideo.url)}
                        </span>
                      </div>
                      <h5 className={`text-sm font-bold mt-1 ${primaryVideo.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {primaryVideo.title}
                      </h5>
                    </div>
                  </div>

                  <a
                    href={primaryVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Watch Playlist</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No video playlist attached.</p>
              )}

              {/* Alternative Playlists Drawer (Collapsed by Default) */}
              {alternativeVideos.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowAltVideos(!showAltVideos)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                  >
                    <span>{showAltVideos ? 'Hide Alternative Playlists' : `+ Show ${alternativeVideos.length} Alternative Playlists`}</span>
                    {showAltVideos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showAltVideos && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {alternativeVideos.map((res: Resource) => (
                        <div key={res.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-800 truncate">{res.title}</span>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold hover:underline shrink-0">
                            Open →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 📖 Primary Documentation & Notes */}
              <div className="pt-3 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Primary Documentation & Notes
                </h5>

                {primaryNote ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggle(topic.id, primaryNote.id)}
                        className="text-slate-400 hover:text-teal-600 transition shrink-0 bg-transparent border-none p-0 cursor-pointer"
                      >
                        {primaryNote.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <span className={`font-bold truncate ${primaryNote.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {primaryNote.title}
                      </span>
                    </div>

                    <a href={primaryNote.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold hover:underline shrink-0">
                      Read Docs →
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No notes attached.</p>
                )}

                {/* Alternative Notes Drawer */}
                {alternativeNotes.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowAltNotes(!showAltNotes)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                    >
                      <span>{showAltNotes ? 'Hide Optional Notes' : `+ Show ${alternativeNotes.length} Optional Notes & Cheat Sheets`}</span>
                      {showAltNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showAltNotes && (
                      <div className="space-y-2 mt-2">
                        {alternativeNotes.map((res: Resource) => (
                          <div key={res.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 truncate">{res.title}</span>
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold hover:underline shrink-0">
                              Open →
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Practice Problems (Curated 5-10 Capped Count) */}
            {practiceProbs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  3. Curated Practice Problems ({practiceProbs.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {practiceProbs.map((prob: PracticeProblem) => (
                    <div
                      key={prob.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => onToggle(topic.id, undefined, prob.id)}
                          className="text-slate-400 hover:text-teal-600 transition shrink-0 bg-transparent border-none p-0 cursor-pointer"
                        >
                          {prob.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <span className={`font-bold truncate ${prob.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {prob.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {getPlatformFromUrl(prob.url)}
                        </span>
                        <Badge tone={prob.difficulty === 'easy' ? 'success' : prob.difficulty === 'medium' ? 'warning' : 'danger'}>
                          {prob.difficulty}
                        </Badge>
                        <a href={prob.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 font-bold">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Recommended DSA Sheet */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                4. Recommended DSA Sheet
              </h4>
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-indigo-600 fill-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-800 uppercase block">{primaryDsaSheet.badge}</span>
                    <span className="text-xs font-bold text-slate-900">{primaryDsaSheet.name}</span>
                  </div>
                </div>

                <a
                  href={primaryDsaSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Other Options Dropdown */}
              <div className="pt-1">
                <button
                  onClick={() => setShowAltSheets(!showAltSheets)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                >
                  <span>{showAltSheets ? 'Hide Other Sheet Options' : '+ View Other Sheet Options (Blind 75, LeetCode Explore, GFG)'}</span>
                  {showAltSheets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showAltSheets && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {alternativeDsaSheets.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition"
                      >
                        <span>{s.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Interview Questions */}
            {topic.interviewPrep && topic.interviewPrep.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  5. Topic Interview Questions
                </h4>
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                  {topic.interviewPrep.map((q, idx) => (
                    <div key={idx} className="text-xs text-amber-950 font-medium flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Mini Project */}
            {topic.project && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-purple-600" />
                  6. Mini Project
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900">{topic.project.title}</h5>
                    <Badge tone="purple">{topic.project.difficulty || 'Intermediate'}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{topic.project.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">Tech Stack:</span>
                    {topic.project.technologies?.map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-200">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold hover:underline flex items-center gap-1">
                      <span>GitHub Reference Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-semibold">Recommended Deployment: Vercel / Render</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Revision */}
            {revisionRes.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  7. Revision Notes & Cheat Sheets
                </h4>
                <div className="flex flex-wrap gap-2">
                  {revisionRes.map((rev: Resource) => (
                    <a
                      key={rev.id}
                      href={rev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition"
                    >
                      <span>{rev.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Monthly Checklist */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                8. Monthly Progress Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <button
                  onClick={() => toggleChecklistItem('videos')}
                  className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200 text-left hover:border-slate-300 cursor-pointer"
                >
                  {checklist.videos ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={checklist.videos ? 'line-through text-slate-400' : ''}>Finish Study Videos</span>
                </button>

                <button
                  onClick={() => toggleChecklistItem('practice')}
                  className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200 text-left hover:border-slate-300 cursor-pointer"
                >
                  {checklist.practice ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={checklist.practice ? 'line-through text-slate-400' : ''}>Finish Practice Problems</span>
                </button>

                <button
                  onClick={() => toggleChecklistItem('project')}
                  className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200 text-left hover:border-slate-300 cursor-pointer"
                >
                  {checklist.project ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={checklist.project ? 'line-through text-slate-400' : ''}>Complete Mini Project</span>
                </button>

                <button
                  onClick={() => toggleChecklistItem('revision')}
                  className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200 text-left hover:border-slate-300 cursor-pointer"
                >
                  {checklist.revision ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={checklist.revision ? 'line-through text-slate-400' : ''}>Finish Revision Notes</span>
                </button>

                <button
                  onClick={() => toggleChecklistItem('readyForNextMonth')}
                  className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200 text-left hover:border-slate-300 cursor-pointer sm:col-span-2 lg:col-span-1"
                >
                  {checklist.readyForNextMonth ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={checklist.readyForNextMonth ? 'line-through text-slate-400 font-bold' : 'font-bold text-teal-800'}>
                    Ready for Next Month 🚀
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineMonthCard;
