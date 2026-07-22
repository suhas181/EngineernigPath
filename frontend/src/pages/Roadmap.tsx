import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { aiEngineerRoadmap } from '../utils/aiEngineerData';
import { dataScientistRoadmap } from '../utils/dataScientistData';
import { AlertOctagon, Sparkles, Map, ArrowRight, Target } from 'lucide-react';

import * as roadmapService from '../services/roadmapService';
import { RoadmapData, Topic } from '../components/roadmap/roadmap.types';

import RoadmapHeader from '../components/roadmap/RoadmapHeader';
import RoadmapTabs from '../components/roadmap/RoadmapTabs';
import TodayFocusCard from '../components/roadmap/cards/TodayFocusCard';
import LearningPathCard, { PathTask } from '../components/roadmap/cards/LearningPathCard';
import StreakTracker from '../components/roadmap/cards/StreakTracker';
import ProgressSummary from '../components/roadmap/cards/ProgressSummary';
import TimelineMonthCard from '../components/roadmap/timeline/TimelineMonthCard';
import WeeklyReviewModal from '../components/roadmap/modals/WeeklyReviewModal';
import StaticTrackViewer from '../components/roadmap/tracks/StaticTrackViewer';

interface ProjectSubmissionState {
  github: string;
  demo: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export function Roadmap() {
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuthStore();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'personalized' | 'ai-engineer' | 'data-scientist'>(
    'personalized'
  );

  // Project submission form states per month
  const [projectSubmissions, setProjectSubmissions] = useState<
    Record<string, ProjectSubmissionState>
  >({});

  // Weekly review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ─── Fetching / Generating Roadmap ──────────────────────────────────────────
  const fetchRoadmap = async () => {
    setIsError(false);
    try {
      const debugReview = searchParams.get('debugWeeklyReview') === 'true';
      const data = await roadmapService.getRoadmap(debugReview);

      if (data) {
        setProfileChanged(!!data.profileChanged);
        if (data.roadmap) {
          setRoadmap(data.roadmap);
          if (!!data.pendingWeeklyReview || debugReview) {
            setShowReviewModal(true);
          }

          // Initialize projects local states
          const projectStates: Record<string, ProjectSubmissionState> = {};
          data.roadmap.topics.forEach((topic: Topic) => {
            if (topic.project) {
              let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
              if (topic.project.isCompleted) {
                status = 'completed';
              } else if (topic.project.githubSubmission || topic.project.liveDemoSubmission) {
                status = 'in-progress';
              }
              projectStates[topic.id] = {
                github: topic.project.githubSubmission || '',
                demo: topic.project.liveDemoSubmission || '',
                status,
              };
            }
          });
          setProjectSubmissions(projectStates);

          // Expand first topic by default
          if (data.roadmap.topics?.length > 0) {
            const firstTopicId = data.roadmap.topics[0].id;
            setExpandedTopics({ [firstTopicId]: true });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (regenerate: boolean = false) => {
    setIsGenerating(true);
    setIsError(false);
    try {
      const data = await roadmapService.generateRoadmap(regenerate);
      if (data && data.roadmap) {
        setRoadmap(data.roadmap);
        setProfileChanged(false);
        toast.success(
          regenerate ? 'Roadmap regenerated successfully!' : 'Your AI SDE roadmap is ready!'
        );
        if (data.roadmap.topics?.length > 0) {
          const firstTopicId = data.roadmap.topics[0].id;
          setExpandedTopics({ [firstTopicId]: true });
        }
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast.error(error.response?.data?.message || 'Failed to generate SDE roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [searchParams]);

  // ─── Toggles & Project Actions ─────────────────────────────────────────────
  const handleToggle = async (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: { isCompleted?: boolean; githubSubmission?: string; liveDemoSubmission?: string },
    isCompletedMonth?: boolean
  ) => {
    // Optimistic UI updates locally
    setRoadmap((prev) => {
      if (!prev) return null;
      const updatedTopics = prev.topics.map((topic) => {
        if (topic.id !== topicId) return topic;

        if (resourceId) {
          const updatedResources = topic.resources.map((r) => {
            if (r.id !== resourceId) return r;
            return { ...r, isCompleted: !r.isCompleted };
          });
          return { ...topic, resources: updatedResources };
        }

        if (problemId) {
          const updatedProblems = topic.practiceProblems?.map((p) => {
            if (p.id !== problemId) return p;
            return { ...p, isCompleted: !p.isCompleted };
          });
          return { ...topic, practiceProblems: updatedProblems };
        }

        if (projectPayload) {
          const updatedProj = topic.project
            ? {
                ...topic.project,
                ...projectPayload,
                isCompleted:
                  projectPayload.isCompleted !== undefined
                    ? projectPayload.isCompleted
                    : topic.project.isCompleted,
              }
            : undefined;
          return { ...topic, project: updatedProj as any };
        }

        if (isCompletedMonth !== undefined) {
          const updatedResources = topic.resources.map((r) => ({
            ...r,
            isCompleted: isCompletedMonth,
          }));
          const updatedProblems = topic.practiceProblems?.map((p) => ({
            ...p,
            isCompleted: isCompletedMonth,
          }));
          const updatedProj = topic.project
            ? { ...topic.project, isCompleted: isCompletedMonth }
            : undefined;
          return {
            ...topic,
            isCompleted: isCompletedMonth,
            resources: updatedResources,
            practiceProblems: updatedProblems,
            project: updatedProj as any,
          };
        }

        return topic;
      });

      return { ...prev, topics: updatedTopics };
    });

    try {
      await roadmapService.toggleRoadmapItem({
        topicId,
        resourceId,
        problemId,
        project: projectPayload,
        isCompleted: isCompletedMonth,
      });
      // Refresh to ensure server state matches client state
      const freshData = await roadmapService.getRoadmap();
      if (freshData && freshData.roadmap) {
        setRoadmap(freshData.roadmap);
      }
    } catch (error) {
      console.error('Error toggling element:', error);
      toast.error('Failed to sync progress.');
      fetchRoadmap();
    }
  };

  const submitProjectDetails = async (topicId: string) => {
    const projState = projectSubmissions[topicId];
    if (!projState) return;

    try {
      await roadmapService.submitProjectLinks(
        topicId,
        projState.github,
        projState.demo,
        projState.status === 'completed'
      );
      toast.success('Project details saved!');
    } catch (error) {
      toast.error('Failed to save project link');
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // ─── Weekly Review Handler ─────────────────────────────────────────────────
  const handleWeeklyReviewSubmit = async (reviewData: {
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    difficultTopics: string[];
    projectCompletedCheck: boolean;
    adaptRoadmap: boolean;
  }) => {
    setIsSubmittingReview(true);
    try {
      const res = await roadmapService.submitWeeklyReview({
        easySolved: reviewData.easySolved,
        mediumSolved: reviewData.mediumSolved,
        hardSolved: reviewData.hardSolved,
        completedTopicIds: [],
        difficultTopics: reviewData.difficultTopics,
        projectCompleted: reviewData.projectCompletedCheck,
        adaptRoadmap: reviewData.adaptRoadmap,
      });

      toast.success('Weekly review submitted!');
      setShowReviewModal(false);

      // Update local profile stats for LeetCode
      if (user) {
        updateUser({
          ...user,
          leetcodeEasyCount: (user.leetcodeEasyCount || 0) + reviewData.easySolved,
          leetcodeMediumCount: (user.leetcodeMediumCount || 0) + reviewData.mediumSolved,
          leetcodeHardCount: (user.leetcodeHardCount || 0) + reviewData.hardSolved,
        });
      }

      if (res.adaptRequired) {
        toast.loading('Adapting SDE roadmap schedule structure...');
        await handleGenerate(true);
      } else {
        await fetchRoadmap();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to save review details.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ─── SDE Metrics helper ──────────────────────────────────────────────────
  const getActiveSdeState = () => {
    if (!roadmap || !roadmap.topics.length) return null;

    // Find the first uncompleted month
    const activeMonth =
      roadmap.topics.find((t) => !t.isCompleted) || roadmap.topics[roadmap.topics.length - 1];

    // Calculate total & completed items in active month
    const totalResources = activeMonth.resources.length;
    const completedResources = activeMonth.resources.filter((r) => r.isCompleted).length;

    const totalProblems = activeMonth.practiceProblems?.length || 0;
    const completedProblems = activeMonth.practiceProblems?.filter((p) => p.isCompleted).length || 0;

    const totalProj = activeMonth.project ? 1 : 0;
    const completedProj = activeMonth.project?.isCompleted ? 1 : 0;

    const totalItems = totalResources + totalProblems + totalProj;
    const completedItems = completedResources + completedProblems + completedProj;

    // Calculate remaining problems across the active month
    const remainingProblems = totalProblems - completedProblems;

    // Calculate next uncompleted task
    let nextTaskTitle = 'All tasks completed!';
    let nextTaskType: 'resource' | 'problem' | 'project' | 'none' = 'none';
    let nextTaskUrl = '#';
    let nextTaskAction = () => {};

    const nextUncompletedResource = activeMonth.resources.find((r) => !r.isCompleted);
    const nextUncompletedProblem = activeMonth.practiceProblems?.find((p) => !p.isCompleted);
    const nextUncompletedProject =
      activeMonth.project && !activeMonth.project.isCompleted ? activeMonth.project : null;

    if (nextUncompletedResource) {
      nextTaskTitle = `Resource: ${nextUncompletedResource.title}`;
      nextTaskType = 'resource';
      nextTaskUrl = nextUncompletedResource.url;
      nextTaskAction = () =>
        handleToggle(activeMonth.id, nextUncompletedResource.id, undefined, undefined);
    } else if (nextUncompletedProblem) {
      nextTaskTitle = `Problem: ${nextUncompletedProblem.title}`;
      nextTaskType = 'problem';
      nextTaskUrl = nextUncompletedProblem.url;
      nextTaskAction = () =>
        handleToggle(activeMonth.id, undefined, nextUncompletedProblem.id, undefined);
    } else if (nextUncompletedProject) {
      nextTaskTitle = `Project: ${nextUncompletedProject.title}`;
      nextTaskType = 'project';
      nextTaskAction = () => {
        setProjectSubmissions((prev) => ({
          ...prev,
          [activeMonth.id]: { ...prev[activeMonth.id], status: 'in-progress' },
        }));
        toast('Project marked as In-Progress! Submit your links below.');
      };
    }

    // Determine today's path (exact order of next 3 tasks)
    const todayPath: PathTask[] = [];
    activeMonth.resources
      .filter((r) => !r.isCompleted)
      .slice(0, 3)
      .forEach((r) => {
        todayPath.push({ title: r.title, type: 'Resource', url: r.url });
      });
    if (todayPath.length < 3 && activeMonth.practiceProblems) {
      activeMonth.practiceProblems
        .filter((p) => !p.isCompleted)
        .slice(0, 3 - todayPath.length)
        .forEach((p) => {
          todayPath.push({ title: p.title, type: 'Problem', url: p.url });
        });
    }
    if (todayPath.length < 3 && activeMonth.project && !activeMonth.project.isCompleted) {
      todayPath.push({ title: activeMonth.project.title, type: 'Project' });
    }

    // Lag Detection: if elapsed days are high but progress is low
    const createdAt = new Date(roadmap.createdAt).getTime();
    const elapsedDays = Math.max(1, Math.round((Date.now() - createdAt) / (24 * 60 * 60 * 1000)));
    const expectedProgress = Math.min(
      100,
      Math.round((elapsedDays / (roadmap.topics.length * 30)) * 100)
    );
    const isLagging = expectedProgress - roadmap.progress > 20;

    return {
      activeMonth,
      totalResources,
      completedResources,
      totalProblems,
      completedProblems,
      totalProj,
      completedProj,
      totalItems,
      completedItems,
      remainingProblems,
      nextTaskTitle,
      nextTaskType,
      nextTaskUrl,
      nextTaskAction,
      todayPath: todayPath.slice(0, 3),
      isLagging,
      elapsedDays,
    };
  };

  const sdeState = getActiveSdeState();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading your SDE timeline tracks...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full px-6 py-10">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center space-y-6 border border-white/10 bg-slate-900/50">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertOctagon className="h-6 w-6 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Failed to Load Roadmap</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We encountered a connection or server error while loading your roadmap. Please check
                your network or try again.
              </p>
            </div>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchRoadmap();
              }}
              className="bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold px-6 py-2.5 rounded-lg text-sm w-full cursor-pointer border-none"
            >
              Retry Connection
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {isGenerating ? (
          <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] border border-white/10 bg-slate-900/20">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Consulting the AI Career Mentor</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Analyzing SDE company target filters, languages, and LeetCode stats to assemble a custom
                multi-stage roadmap.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Unified Page Header */}
            <RoadmapHeader
              activeTab={activeTab}
              roadmap={roadmap}
              onGenerate={handleGenerate}
            />

            {/* Tab Switcher */}
            <RoadmapTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'personalized' ? (
              !roadmap ? (
                /* Empty Onboarding State */
                <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden border border-white/10 bg-slate-900/40">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl" />

                  <div className="space-y-4 max-w-xl mx-auto">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                      <Map className="h-7 w-7 text-indigo-400 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-white">
                      Generate Your AI Career Roadmap
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Unlock a step-by-step career path specifically curated for you. We will analyze
                      your profile information to construct standard topics, resource lists, and
                      progress checkers.
                    </p>
                  </div>

                  {/* Profile Overview Card */}
                  <div className="glass-card rounded-2xl p-6 text-left max-w-lg mx-auto border border-white/5 space-y-4 bg-white/[0.01]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Target className="h-4 w-4" /> Based on your Profile:
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div>
                        <span className="text-slate-400 text-xs block">Target Role</span>
                        <span className="font-semibold text-white/90">
                          {user?.preferredCareer || 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Academic Timeline</span>
                        <span className="font-semibold text-white/90">
                          Semester {user?.currentSemester || 1} (Grad {user?.graduationYear})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">SDE Company Target</span>
                        <span className="font-semibold text-white/90">
                          {user?.targetCompanyType || 'Product-Based'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Preferred Lang (DSA)</span>
                        <span className="font-semibold text-white/90">
                          {user?.preferredProgrammingLanguage || 'Java'} (
                          {user?.preferredDsaLanguage || 'Java'})
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-xs block">Interests & Core Skills</span>
                        <span className="font-semibold text-white/90">
                          {user?.skills?.length ? user.skills.join(', ') : 'No skills input'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerate(false)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 transition text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/20 inline-flex items-center space-x-2.5 border-none cursor-pointer"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Roadmap</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                /* Redesigned Roadmap Dashboard */
                <div className="space-y-8 animate-fadeIn text-left">
                  {/* Profile Changed Banner */}
                  {profileChanged && (
                    <div className="glass-panel border-l-4 border-blue-500 p-5 rounded-r-2xl bg-blue-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5">
                      <div className="flex items-start space-x-4">
                        <Sparkles className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-blue-400 text-sm">Profile Configuration Changed</h4>
                          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                            We detected updates to your target career or coding profile since this roadmap was generated.
                            Regenerate it to align with your new goals. (Your completed progress will be preserved!)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerate(true)}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl border-none cursor-pointer transition flex items-center space-x-1.5 disabled:opacity-50 text-xs flex-shrink-0"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
                      </button>
                    </div>
                  )}

                  {/* Dynamic AI Alert cards: Lag warning */}
                  {sdeState?.isLagging && (
                    <div className="glass-panel border-l-4 border-amber-500 p-5 rounded-r-2xl bg-amber-500/5 flex items-start space-x-4 border-t border-r border-b border-white/5">
                      <AlertOctagon className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-400 text-sm">Schedule Lag Detected</h4>
                        <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                          You have been enrolled in this roadmap for {sdeState?.elapsedDays} days. Based
                          on SDE guidelines, you are behind the expected progress milestone. We recommend
                          focusing on "Today's Learning Path" tasks below to catch up.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Redesigned Premium Widgets Row: Stats & Focus */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1 & 2. Today's Focus and Learning Path Card */}
                    <div className="space-y-4 lg:col-span-2">
                      <TodayFocusCard
                        activeMonth={sdeState?.activeMonth || null}
                        totalItems={sdeState?.totalItems || 0}
                        completedItems={sdeState?.completedItems || 0}
                        nextTaskType={sdeState?.nextTaskType || 'none'}
                        nextTaskTitle={sdeState?.nextTaskTitle || ''}
                        nextTaskAction={sdeState?.nextTaskAction || (() => {})}
                        remainingProblems={sdeState?.remainingProblems || 0}
                      />
                      {sdeState?.todayPath && (
                        <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40">
                          <LearningPathCard todayPath={sdeState.todayPath} />
                        </div>
                      )}
                    </div>

                    {/* 3. Study Streak Tracking Widget */}
                    <StreakTracker />
                  </div>

                  {/* Granular Progress Breakdown Widgets */}
                  <ProgressSummary roadmap={roadmap} />

                  {/* Redesigned Timeline Months List */}
                  <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8">
                    {roadmap.topics.map((topic, index) => (
                      <TimelineMonthCard
                        key={topic.id}
                        topic={topic}
                        index={index}
                        isExpanded={!!expandedTopics[topic.id]}
                        onToggleExpand={toggleExpand}
                        roadmap={roadmap}
                        onToggle={handleToggle}
                        projectSubmissions={projectSubmissions}
                        setProjectSubmissions={setProjectSubmissions}
                        onSubmitProjectDetails={submitProjectDetails}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : activeTab === 'ai-engineer' ? (
              /* AI Engineer Roadmap Track */
              <StaticTrackViewer
                key="ai-engineer"
                track="ai-engineer"
                roadmapData={aiEngineerRoadmap}
              />
            ) : (
              /* Data Scientist Roadmap Track */
              <StaticTrackViewer
                key="data-scientist"
                track="data-scientist"
                roadmapData={dataScientistRoadmap}
              />
            )}
          </>
        )}
      </main>

      {/* ─── Premium Weekly Review Modal Dialog ─────────── */}
      {showReviewModal && (
        <WeeklyReviewModal
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleWeeklyReviewSubmit}
          isSubmitting={isSubmittingReview}
        />
      )}
    </div>
  );
}

export default Roadmap;
