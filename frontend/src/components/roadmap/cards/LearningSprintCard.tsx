import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Code2,
  HelpCircle,
  FolderGit2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { LearningSprint } from '../roadmap.types';
import { recordResourceOpened } from '../../../services/recentResourceService';

interface LearningSprintCardProps {
  sprint: LearningSprint;
  monthNumber?: number;
  onToggleProblem?: (problemId: string) => void;
  onToggleResource?: (resourceId: string) => void;
}

export const LearningSprintCard: React.FC<LearningSprintCardProps> = ({
  sprint,
  onToggleProblem
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const totalTasks =
    (sprint.learnResources?.length || 0) +
    (sprint.notesResources?.length || 0) +
    (sprint.practice?.length || 0) +
    (sprint.interviewQuestions?.length || 0) +
    (sprint.miniProject ? 1 : 0);

  const completedTasks =
    (sprint.learnResources?.filter((r) => r.isCompleted).length || 0) +
    (sprint.notesResources?.filter((r) => r.isCompleted).length || 0) +
    (sprint.practice?.filter((p) => p.isCompleted).length || 0) +
    (sprint.miniProject?.isCompleted ? 1 : 0);

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden mb-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-700/80">
      {/* Sprint Header Banner */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-xs rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Sprint {sprint.sprintNumber}
            </span>
            <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {sprint.sprintGoal}
            </h4>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{sprint.estimatedHours} hrs</span>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Today's Focus Highlight */}
        {sprint.todaysFocus && (
          <div className="mt-3.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-indigo-300 block uppercase tracking-wider">Today's Focus</span>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{sprint.todaysFocus}</p>
            </div>
          </div>
        )}

        {/* Sprint Progress Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-300 shrink-0">{progressPercent}% Sprint Completed</span>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 space-y-6 bg-slate-900/40 text-left">
          {/* Topics Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-center mr-1">Topics:</span>
            {sprint.topics.map((t, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700/60 font-medium">
                {t}
              </span>
            ))}
          </div>

          {/* Section 1: Learn Resources */}
          {sprint.learnResources && sprint.learnResources.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                Learn Resources ({sprint.learnResources.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sprint.learnResources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordResourceOpened({
                        id: res.id,
                        title: res.title,
                        type: 'video',
                        url: res.url,
                      });
                    }}
                    className="p-3 bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Notes & Documentation */}
          {sprint.notesResources && sprint.notesResources.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Notes & Documentation ({sprint.notesResources.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sprint.notesResources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordResourceOpened({
                        id: res.id,
                        title: res.title,
                        type: 'documentation',
                        url: res.url,
                      });
                    }}
                    className="p-3 bg-slate-800/40 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                        {res.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Practice Problems */}
          {sprint.practice && sprint.practice.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Practice Problems ({sprint.practice.length})
              </h5>
              <div className="space-y-2">
                {sprint.practice.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleProblem && onToggleProblem(prob.id)}
                        className={`p-1 rounded-md transition-colors ${
                          prob.isCompleted
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-slate-500 hover:text-slate-300 bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          recordResourceOpened({
                            id: prob.id,
                            title: prob.title,
                            type: 'practice',
                            url: prob.url,
                          });
                        }}
                        className="text-xs font-medium text-slate-200 hover:text-emerald-400 truncate flex items-center gap-1.5"
                      >
                        {prob.title}
                        <ExternalLink className="w-3 h-3 text-slate-500 inline shrink-0" />
                      </a>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        prob.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : prob.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Interview Questions */}
          {sprint.interviewQuestions && sprint.interviewQuestions.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Interview Questions
              </h5>
              <ul className="space-y-1.5 pl-2">
                {sprint.interviewQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 5: Mini Project */}
          {sprint.miniProject && (
            <div className="p-4 bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                Mini Project: {sprint.miniProject.title}
              </div>
              <p className="text-xs text-slate-300">{sprint.miniProject.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sprint.miniProject.technologies.map((tech, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-[10px] rounded font-medium border border-purple-500/20">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Revision */}
          {sprint.revision && sprint.revision.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                Revision & Cheat Sheets
              </h5>
              <div className="flex flex-wrap gap-2">
                {sprint.revision.map((rev) => (
                  <a
                    key={rev.id}
                    href={rev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      recordResourceOpened({
                        id: rev.id,
                        title: rev.title,
                        type: 'article',
                        url: rev.url,
                      });
                    }}
                    className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700/60 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{rev.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Expected Outcome */}
          <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300 block">Expected Outcome:</span>
              <span>{sprint.expectedOutcomes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
