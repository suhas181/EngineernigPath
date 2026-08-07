import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Code2,
  FolderGit2,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CurriculumCategory,
  CurriculumModule,
  CurriculumTopic,
} from '../../services/curriculumServiceTypes';

interface TopicLearningViewProps {
  role: string;
  language: 'Java' | 'Python' | 'C++';
  category: CurriculumCategory;
  module: CurriculumModule;
  topic: CurriculumTopic;
  onBack: () => void;
}

export const TopicLearningView: React.FC<TopicLearningViewProps> = ({
  role,
  language,
  category,
  module,
  topic,
  onBack,
}) => {
  const completedKey = `topic_completed_${topic.id}`;
  const problemCompletedKeyPrefix = `problem_completed_${topic.id}_`;

  const [isTopicCompleted, setIsTopicCompleted] = useState<boolean>(() => {
    return localStorage.getItem(completedKey) === 'true';
  });

  const [completedProblems, setCompletedProblems] = useState<Record<string, boolean>>(() => {
    const saved: Record<string, boolean> = {};
    (topic.guidedFlow?.step4PracticeProblems || []).forEach((p, idx) => {
      const key = `${problemCompletedKeyPrefix}${p.id || idx}`;
      saved[p.id || idx] = localStorage.getItem(key) === 'true';
    });
    return saved;
  });

  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [topic.id]);

  useEffect(() => {
    localStorage.setItem(completedKey, isTopicCompleted ? 'true' : 'false');
  }, [isTopicCompleted, completedKey]);

  const toggleProblem = (problemId: string | number) => {
    setCompletedProblems((prev) => {
      const updated = !prev[problemId];
      const key = `${problemCompletedKeyPrefix}${problemId}`;
      localStorage.setItem(key, updated ? 'true' : 'false');
      if (updated) {
        toast.success('Problem marked solved!');
      }
      return { ...prev, [problemId]: updated };
    });
  };

  const handleToggleTopicComplete = () => {
    const nextState = !isTopicCompleted;
    setIsTopicCompleted(nextState);
    if (nextState) {
      toast.success(`🎉 Topic "${topic.title}" marked complete!`);
    } else {
      toast('Topic status updated', { icon: 'ℹ️' });
    }
  };

  const guided = topic.guidedFlow;

  return (
    <div className="space-y-8 text-left animate-fadeIn font-sans">
      {/* ─── HIERARCHY BREADCRUMB & BACK ACTION ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-teal-700 transition self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Categories & Modules</span>
        </button>

        {/* Hierarchy Path */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold flex-wrap">
          <span className="text-slate-800 font-bold">{role}</span>
          <span>/</span>
          <span>{category.title}</span>
          <span>/</span>
          <span>{module.title}</span>
          <span>/</span>
          <span className="text-teal-700 font-bold">{topic.title}</span>
        </div>
      </div>

      {/* ─── TOPIC OVERVIEW BANNER ────────────────────────────────────── */}
      <div className="mosaic-card p-6 bg-white border border-[var(--card-border)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  topic.difficulty === 'Beginner'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : topic.difficulty === 'Intermediate'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {topic.difficulty}
              </span>

              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center space-x-1">
                <Code2 className="h-3 w-3" />
                <span>Language: {language}</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-[var(--ink-900)] font-heading">
              {topic.title}
            </h1>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed max-w-3xl">
              {topic.description}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div className="text-right text-xs">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Est. Time</span>
              <span className="font-extrabold text-slate-800 flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>{topic.estimatedTime}</span>
              </span>
            </div>

            <button
              onClick={handleToggleTopicComplete}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition ${
                isTopicCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isTopicCompleted ? 'Topic Completed' : 'Mark Topic Complete'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── RULE #8: CLEAN COMING SOON STATE IF NO RESOURCES YET ──────── */}
      {!guided || !guided.hasResources ? (
        <div className="mosaic-card p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Curated Resources Coming Soon
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our technical team is curating high-quality, language-specific FREE playlists and documentation for{' '}
            <strong className="text-slate-700">{topic.title}</strong> in {language}. Check back soon!
          </p>
        </div>
      ) : (
        /* ─── 8-STEP GUIDED LEARNING FLOW ─────────────────────────────── */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-heading flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Guided Learning Sequence (Follow in Order)</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Step 1 of 8</span>
          </div>

          {/* ── STEP 1: PRIMARY PLAYLIST ────────────────────────────────── */}
          <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <span className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Step 1 — Watch the Recommended Primary Playlist
                </h3>
                <p className="text-[11px] text-slate-500">
                  Single primary video tutorial curated for {language} learners.
                </p>
              </div>
            </div>

            {guided.step1PrimaryPlaylist ? (
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Primary Playlist
                    </span>
                    <span className="text-xs text-slate-500">
                      Provider: <strong>{guided.step1PrimaryPlaylist.provider}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {guided.step1PrimaryPlaylist.title}
                  </h4>
                </div>

                <a
                  href={guided.step1PrimaryPlaylist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mosaic-btn-brand !py-2 !px-4 !text-xs flex items-center space-x-1.5 flex-shrink-0"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Watch Playlist</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No primary playlist attached for this topic.</p>
            )}
          </div>

          {/* ── STEP 2: OFFICIAL DOCUMENTATION ──────────────────────────── */}
          <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <span className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Step 2 — Read Official Documentation & Reference Notes
                </h3>
                <p className="text-[11px] text-slate-500">
                  Authoritative documentation and reference guide for {language}.
                </p>
              </div>
            </div>

            {guided.step2Documentation ? (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Official Reference
                    </span>
                    <span className="text-xs text-slate-500">
                      Provider: <strong>{guided.step2Documentation.provider}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {guided.step2Documentation.title}
                  </h4>
                </div>

                <a
                  href={guided.step2Documentation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mosaic-btn-outline !py-2 !px-4 !text-xs flex items-center space-x-1.5 flex-shrink-0 !border-blue-300 !text-blue-900 hover:!bg-blue-100"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Read Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No official documentation attached for this topic.</p>
            )}
          </div>

          {/* ── STEP 3: RECOMMENDED PRACTICE SHEET ─────────────────────── */}
          <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <span className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Step 3 — Solve the Recommended Practice Sheet
                </h3>
                <p className="text-[11px] text-slate-500">
                  Single curated practice sheet tailored for {language}.
                </p>
              </div>
            </div>

            {guided.step3PracticeSheet ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {guided.step3PracticeSheet.badge || 'Recommended Practice Sheet'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {guided.step3PracticeSheet.title}
                  </h4>
                </div>

                <a
                  href={guided.step3PracticeSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mosaic-btn-primary !py-2 !px-4 !text-xs !bg-emerald-700 hover:!bg-emerald-800 flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Award className="h-4 w-4" />
                  <span>Open Practice Sheet</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No practice sheet specified for this topic.</p>
            )}
          </div>

          {/* ── STEP 4: CURATED PRACTICE PROBLEMS ───────────────────────── */}
          <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <span className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                4
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Step 4 — Solve Curated Practice Problems
                </h3>
                <p className="text-[11px] text-slate-500">
                  Targeted LeetCode and GFG coding exercises with status toggles.
                </p>
              </div>
            </div>

            {guided.step4PracticeProblems && guided.step4PracticeProblems.length > 0 ? (
              <div className="space-y-2.5">
                {guided.step4PracticeProblems.map((prob, idx) => {
                  const probKey = prob.id || idx;
                  const isSolved = !!completedProblems[probKey];
                  return (
                    <div
                      key={probKey}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isSolved
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => toggleProblem(probKey)}
                          className="text-slate-400 hover:text-emerald-600 transition flex-shrink-0"
                        >
                          {isSolved ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <h5
                            className={`text-xs font-bold truncate ${
                              isSolved ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {prob.title}
                          </h5>
                          <span className="text-[10px] text-slate-400">{prob.provider}</span>
                        </div>
                      </div>

                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-teal-700 hover:underline flex items-center space-x-1 flex-shrink-0"
                      >
                        <span>Solve</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No practice problems attached for this topic.</p>
            )}
          </div>

          {/* ── STEP 5: RECOMMENDED PROJECTS ────────────────────────────── */}
          {guided.step5Projects && guided.step5Projects.length > 0 && (
            <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  5
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Step 5 — Build the Recommended Project
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hands-on portfolio projects implementing concepts learned in this topic.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {guided.step5Projects.map((proj) => (
                  <div
                    key={proj.id || proj.title}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-teal-700">
                        <span className="uppercase">{proj.level} Project</span>
                        <span>{proj.estimatedHours} Hours</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{proj.title}</h4>
                    </div>

                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-teal-700 hover:underline flex items-center space-x-1 pt-2"
                    >
                      <FolderGit2 className="h-3.5 w-3.5" />
                      <span>View Project Spec</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 6: INTERVIEW QUESTIONS ─────────────────────────────── */}
          {guided.step6InterviewQuestions && guided.step6InterviewQuestions.length > 0 && (
            <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="h-7 w-7 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  6
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Step 6 — Review Top Technical Interview Questions
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Common conceptual questions asked by SDE interviewers.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {guided.step6InterviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start space-x-3"
                  >
                    <HelpCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 7: REVISION NOTES ──────────────────────────────────── */}
          {guided.step7RevisionNotes && guided.step7RevisionNotes.length > 0 && (
            <div className="mosaic-card p-6 bg-white border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  7
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Step 7 — Read Revision Notes & Summary
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Quick summary cards highlighting complexity rules & takeaways.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {guided.step7RevisionNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-1.5"
                  >
                    <h4 className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{note.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 8: MARK TOPIC COMPLETE ────────────────────────────── */}
          <div className="mosaic-card p-6 bg-slate-900 text-white space-y-4 text-center">
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold font-heading">
                Step 8 — Complete Topic & Unlock Progress
              </h3>
              <p className="text-xs text-slate-300">
                Finished all 7 learning steps for <strong className="text-white">{topic.title}</strong>? Mark complete to update your profile progress.
              </p>
            </div>

            <button
              onClick={handleToggleTopicComplete}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold transition shadow-md mx-auto flex items-center space-x-2 ${
                isTopicCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold'
              }`}
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>{isTopicCompleted ? '✓ Topic Completed' : 'Mark Topic Complete'}</span>
            </button>
          </div>

          {/* ── COLLAPSIBLE ALTERNATIVE RESOURCES ─────────────────────── */}
          {guided.alternativeResources &&
            (guided.alternativeResources.videos.length > 0 ||
              guided.alternativeResources.notes.length > 0) && (
              <div className="mosaic-card p-5 bg-slate-50 border border-slate-200 space-y-3">
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    <span>
                      Alternative Resources (Optional Tutorials & References -{' '}
                      {guided.alternativeResources.videos.length +
                        guided.alternativeResources.notes.length}{' '}
                      Available)
                    </span>
                  </div>
                  {showAlternatives ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>

                {showAlternatives && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {guided.alternativeResources.videos.map((v) => (
                        <a
                          key={v.url}
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-800 truncate pr-2">
                            {v.title} ({v.provider})
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        </a>
                      ))}
                      {guided.alternativeResources.notes.map((n) => (
                        <a
                          key={n.url}
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-800 truncate pr-2">
                            {n.title} ({n.provider})
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TopicLearningView;
