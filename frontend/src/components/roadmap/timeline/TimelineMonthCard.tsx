import React from 'react';
import {
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Zap,
  Lock,
  Award,
} from 'lucide-react';
import { Topic, RoadmapData } from '../roadmap.types';
import ResourceCard from '../cards/ResourceCard';
import PracticeProblems from '../cards/PracticeProblems';
import MiniProjectCard from '../cards/MiniProjectCard';

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
  roadmap: RoadmapData;
  onToggle: (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: any,
    isCompletedMonth?: boolean
  ) => void;
  projectSubmissions: Record<string, ProjectState>;
  setProjectSubmissions: React.Dispatch<
    React.SetStateAction<Record<string, ProjectState>>
  >;
  onSubmitProjectDetails: (topicId: string) => void;
}

export const TimelineMonthCard: React.FC<TimelineMonthCardProps> = ({
  topic,
  index,
  isExpanded,
  onToggleExpand,
  roadmap,
  onToggle,
  projectSubmissions,
  setProjectSubmissions,
  onSubmitProjectDetails,
}) => {
  // Distribute Resources and Problems evenly across 4 weeks
  const getItemsForWeek = (month: Topic, weekIndex: number) => {
    const resources = month.resources || [];
    const problems = month.practiceProblems || [];

    const resPerWeek = Math.max(1, Math.ceil(resources.length / 4));
    const probPerWeek = Math.max(1, Math.ceil(problems.length / 4));

    const weekResources = resources.slice(
      weekIndex * resPerWeek,
      (weekIndex + 1) * resPerWeek
    );
    const weekProblems = problems.slice(
      weekIndex * probPerWeek,
      (weekIndex + 1) * probPerWeek
    );

    // Project goes in the final week (Week 4, index 3)
    const weekProject = weekIndex === 3 ? month.project : null;

    return {
      resources: weekResources,
      problems: weekProblems,
      project: weekProject,
    };
  };

  // Progressive unlock check: Week N is unlocked only if all items in Week N-1 are completed
  const isWeekUnlocked = (month: Topic, weekIndex: number): boolean => {
    if (weekIndex === 0) return true; // Week 1 is always unlocked

    // Check all previous weeks
    for (let w = 0; w < weekIndex; w++) {
      const prevItems = getItemsForWeek(month, w);
      const prevResDone = prevItems.resources.every((r) => r.isCompleted);
      const prevProbsDone = prevItems.problems.every((p) => p.isCompleted);
      const prevProjDone = !prevItems.project || prevItems.project.isCompleted;

      if (!prevResDone || !prevProbsDone || !prevProjDone) {
        return false;
      }
    }
    return true;
  };

  // Calculate progress within this specific month
  const monthResources = topic.resources.length;
  const monthResDone = topic.resources.filter((r) => r.isCompleted).length;
  const monthProblems = topic.practiceProblems?.length || 0;
  const monthProbsDone = topic.practiceProblems?.filter((p) => p.isCompleted).length || 0;
  const monthProj = topic.project ? 1 : 0;
  const monthProjDone = topic.project?.isCompleted ? 1 : 0;

  const monthTotalItems = monthResources + monthProblems + monthProj;
  const monthCompletedItems = monthResDone + monthProbsDone + monthProjDone;
  const monthProgress =
    monthTotalItems > 0 ? Math.round((monthCompletedItems / monthTotalItems) * 100) : 0;

  // Project local state references
  const projState = projectSubmissions[topic.id] || {
    github: '',
    demo: '',
    status: 'not-started',
  };

  return (
    <div className="relative group text-left">
      {/* Circle Node Indicator */}
      <button
        onClick={() => onToggle(topic.id, undefined, undefined, undefined, !topic.isCompleted)}
        className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-slate-950 z-10 focus:outline-none cursor-pointer ${
          topic.isCompleted
            ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
            : 'border-white/15 text-slate-400 group-hover:border-white/30 hover:border-indigo-500/50 hover:text-indigo-400'
        }`}
        title={topic.isCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
      >
        {topic.isCompleted ? (
          <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
        ) : (
          <span className="text-xs font-bold font-heading">{index + 1}</span>
        )}
      </button>

      {/* Collapsible Month Card */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden transition duration-300 hover:border-white/10 bg-slate-900/15">
        {/* Collapsible Month Title bar */}
        <div
          onClick={() => onToggleExpand(topic.id)}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
        >
          <div className="space-y-1.5 pr-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-lg font-bold font-heading transition ${
                  topic.isCompleted ? 'text-slate-500 line-through' : 'text-white'
                }`}
              >
                {topic.title}
              </h3>
              {monthProgress > 0 && (
                <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
                  {monthProgress}% Complete
                </span>
              )}
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              {topic.whyThisMonth || topic.description}
            </p>
          </div>

          <button className="p-1.5 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5 bg-transparent border-none focus:outline-none">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Expanded Section Details */}
        {isExpanded && (
          <div className="px-6 pb-8 pt-2 border-t border-white/5 bg-slate-900/5 space-y-6">
            {/* SDE Placement Readiness breakdown */}
            <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Current Readiness
                </span>
                <span className="text-sm font-extrabold text-white block">
                  {roadmap.summary?.currentPlacementReadiness || 15}%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Expected After Month
                </span>
                <span className="text-sm font-extrabold text-indigo-400 block">
                  {Math.min(
                    100,
                    (roadmap.summary?.currentPlacementReadiness || 15) +
                      (topic.placementReadinessImprovement || 15)
                  )}
                  %
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Improvement Delta
                </span>
                <span className="text-sm font-extrabold text-emerald-400 block">
                  +{topic.placementReadinessImprovement || 15}%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Target Readiness
                </span>
                <span className="text-sm font-extrabold text-white block">
                  {roadmap.summary?.estimatedFinalReadiness || 85}%
                </span>
              </div>
            </div>

            {/* Month summary guidelines: objectives & milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Learning Objectives
                </h4>
                <ul className="space-y-1 text-slate-300 text-xs leading-relaxed">
                  {topic.learningObjectives?.map((obj, oIdx) => (
                    <li key={oIdx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold mt-0.5">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                  {!topic.learningObjectives?.length && (
                    <li className="text-slate-500 italic">No specific objectives declared.</li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Expected Outcome
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {topic.expectedOutcome || 'Build production-ready code with clean complexity limits.'}
                </p>
                <div className="mt-2 text-[10px] text-slate-400">
                  ⏱️ Estimated Study Time:{' '}
                  <strong className="text-white">{topic.estimatedStudyHours || 60} hours</strong>
                </div>
              </div>
            </div>

            {/* Progressive Unlock Weekly Schedule */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-left">
                Weekly Curriculum & Progressive Unlock
              </h4>

              <div className="space-y-4">
                {[1, 2, 3, 4].map((weekNum) => {
                  const weekIndex = weekNum - 1;
                  const unlocked = isWeekUnlocked(topic, weekIndex);
                  const weekItems = getItemsForWeek(topic, weekIndex);
                  const totalWeekCount =
                    weekItems.resources.length +
                    weekItems.problems.length +
                    (weekItems.project ? 1 : 0);

                  if (totalWeekCount === 0) return null; // Skip rendering if empty

                  return (
                    <div
                      key={weekNum}
                      className={`border rounded-2xl p-4 transition duration-300 text-left ${
                        unlocked
                          ? 'bg-slate-900/30 border-white/5 hover:border-white/10'
                          : 'bg-slate-950 border-white/5 opacity-50 select-none'
                      }`}
                    >
                      {/* Week Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {unlocked ? (
                            <Zap className="h-4 w-4 text-indigo-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-slate-500" />
                          )}
                          <h5 className="font-bold text-xs text-white">
                            Week {weekNum}:{' '}
                            {topic.weeklyStudyPlan?.[weekIndex] ||
                              `Prepare week ${weekNum} topics`}
                          </h5>
                        </div>
                        {!unlocked && (
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                            Locked (Complete previous week)
                          </span>
                        )}
                      </div>

                      {/* Week Content Items (exposes only if unlocked) */}
                      {unlocked ? (
                        <div className="space-y-4">
                          {/* Learning Resources List */}
                          {weekItems.resources.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                Curated Resources:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {weekItems.resources.map((resource) => (
                                  <ResourceCard
                                    key={resource.id}
                                    topicId={topic.id}
                                    resource={resource}
                                    onToggle={onToggle}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practice Problems List */}
                          {weekItems.problems.length > 0 && (
                            <PracticeProblems
                              topicId={topic.id}
                              problems={weekItems.problems}
                              onToggle={onToggle}
                            />
                          )}

                          {/* Capstone Project Card */}
                          {weekItems.project && (
                            <MiniProjectCard
                              topicId={topic.id}
                              project={weekItems.project}
                              projState={projState}
                              setProjectSubmissions={setProjectSubmissions}
                              onToggle={onToggle}
                              onSubmitProjectDetails={onSubmitProjectDetails}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 italic py-2">
                          <Lock className="h-3 w-3" />
                          <span>Exposes once all items from previous weeks are completed.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Month Footer Prep checklist */}
            <div className="pt-4 border-t border-white/5 grid sm:grid-cols-2 gap-4 text-left text-xs">
              <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase">
                  Interview Prep Checklist
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside mt-1 leading-relaxed">
                  {topic.interviewPrep?.map((prep, pIdx) => (
                    <li key={pIdx}>{prep}</li>
                  ))}
                  {!topic.interviewPrep?.length && (
                    <li className="text-slate-500 italic">No specific interview checks defined.</li>
                  )}
                </ul>
              </div>

              <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase">
                  Monthly Milestone
                </span>
                <div className="flex items-center space-x-2 text-slate-300 mt-1 leading-relaxed">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span>{topic.weeklyMilestones?.join(', ') || 'Complete all lessons'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineMonthCard;
