import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { aiEngineerRoadmap } from '../utils/aiEngineerData';
import { dataScientistRoadmap } from '../utils/dataScientistData';
import { dataAnalystRoadmap } from '../utils/dataAnalystData';
import { cyberSecurityRoadmap } from '../utils/cyberSecurityData';
import { javaDeveloperRoadmap } from '../utils/javaDeveloperData';
import { softwareEngineerRoadmap } from '../utils/softwareEngineerData';
import { devOpsRoadmap } from '../utils/devOpsData';
import { flutterRoadmap } from '../utils/flutterData';
import { pythonBackendRoadmap } from '../utils/pythonBackendData';
import { frontendRoadmap } from '../utils/frontendData';
import { fullstackRoadmap } from '../utils/fullstackData';
import { backendRoadmap } from '../utils/backendData';
import { mobileRoadmap } from '../utils/mobileData';

import { AlertOctagon, Sparkles, Map, Target } from 'lucide-react';

import * as roadmapService from '../services/roadmapService';
import { RoadmapData, Topic } from '../components/roadmap/roadmap.types';

import RoadmapHeader from '../components/roadmap/RoadmapHeader';
import RoadmapTabs, { RoadmapTabType } from '../components/roadmap/RoadmapTabs';
import TodayFocusCard from '../components/roadmap/cards/TodayFocusCard';
import LearningPathCard, { PathTask } from '../components/roadmap/cards/LearningPathCard';
import StreakTracker from '../components/roadmap/cards/StreakTracker';
import ProgressSummary from '../components/roadmap/cards/ProgressSummary';
import TimelineMonthCard from '../components/roadmap/timeline/TimelineMonthCard';
import WeeklyReviewModal from '../components/roadmap/modals/WeeklyReviewModal';
import StaticTrackViewer from '../components/roadmap/tracks/StaticTrackViewer';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';

interface ProjectSubmissionState {
  github: string;
  demo: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export function Roadmap() {
  const { user, updateUser } = useAuthStore();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [profileChanged, setProfileChanged] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<RoadmapTabType>('personalized');

  const [projectSubmissions, setProjectSubmissions] = useState<Record<string, ProjectSubmissionState>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchRoadmap = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await roadmapService.getRoadmap();
      if (data) {
        setRoadmap(data);
      } else {
        setRoadmap(null);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  useEffect(() => {
    if (!roadmap || !user) return;
    const isDifferentRole = user.preferredCareer && user.preferredCareer !== roadmap.title;
    setProfileChanged(Boolean(isDifferentRole));
  }, [user, roadmap]);

  const handleGenerate = async (forceRegenerate = false) => {
    setIsGenerating(true);
    try {
      const newRoadmap = await roadmapService.generateRoadmap(forceRegenerate);
      setRoadmap(newRoadmap);
      setProfileChanged(false);
      toast.success(
        forceRegenerate
          ? 'Roadmap adapted to latest progress & profile!'
          : 'Custom SDE roadmap generated successfully!'
      );
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate roadmap. Please check your backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggle = async (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: any,
    isCompletedMonth?: boolean
  ) => {
    try {
      const updated = await roadmapService.updateRoadmapProgress(
        topicId,
        resourceId,
        problemId,
        projectPayload,
        isCompletedMonth
      );
      if (updated) {
        setRoadmap(updated);
      }
    } catch (error) {
      console.error('Error toggling progress:', error);
      toast.error('Failed to update progress.');
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const handleProjectSubmit = async (topicId: string) => {
    try {
      const sub = projectSubmissions[topicId];
      await handleToggle(topicId, undefined, undefined, sub, true);
      toast.success('Project submission updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save project submission.');
    }
  };

  const handleWeeklyReviewSubmit = async (data: {
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    difficultTopics: string[];
    projectCompletedCheck: boolean;
    adaptRoadmap: boolean;
  }) => {
    setIsSubmittingReview(true);
    try {
      const res = await roadmapService.submitWeeklyReview(data);

      toast.success('Weekly review submitted!');
      setShowReviewModal(false);

      if (user) {
        updateUser({
          ...user,
          leetcodeEasyCount: (user.leetcodeEasyCount || 0) + data.easySolved,
          leetcodeMediumCount: (user.leetcodeMediumCount || 0) + data.mediumSolved,
          leetcodeHardCount: (user.leetcodeHardCount || 0) + data.hardSolved,
        });
      }

      if (res && res.adaptRequired) {
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

  const getActiveSdeState = () => {
    if (!roadmap || !roadmap.topics || !Array.isArray(roadmap.topics) || !roadmap.topics.length) {
      return null;
    }

    const activeMonth =
      roadmap.topics.find((t) => !t.isCompleted) || roadmap.topics[roadmap.topics.length - 1];

    if (!activeMonth) return null;

    const resources = activeMonth.resources || [];
    const totalResources = resources.length;
    const completedResources = resources.filter((r) => r.isCompleted).length;

    const practiceProblems = activeMonth.practiceProblems || [];
    const totalProblems = practiceProblems.length;
    const completedProblems = practiceProblems.filter((p) => p.isCompleted).length;

    const totalProj = activeMonth.project ? 1 : 0;
    const completedProj = activeMonth.project?.isCompleted ? 1 : 0;

    const totalItems = totalResources + totalProblems + totalProj;
    const completedItems = completedResources + completedProblems + completedProj;
    const remainingProblems = totalProblems - completedProblems;

    let nextTaskTitle = 'All tasks completed!';
    let nextTaskType: 'resource' | 'problem' | 'project' | 'none' = 'none';

    const nextUncompletedResource = resources.find((r) => !r.isCompleted);
    const nextUncompletedProblem = practiceProblems.find((p) => !p.isCompleted);
    const nextUncompletedProject =
      activeMonth.project && !activeMonth.project.isCompleted ? activeMonth.project : null;

    if (nextUncompletedResource) {
      nextTaskTitle = `Resource: ${nextUncompletedResource.title}`;
      nextTaskType = 'resource';
    } else if (nextUncompletedProblem) {
      nextTaskTitle = `Problem: ${nextUncompletedProblem.title}`;
      nextTaskType = 'problem';
    } else if (nextUncompletedProject) {
      nextTaskTitle = `Project: ${nextUncompletedProject.title}`;
      nextTaskType = 'project';
    }

    const todayPath: PathTask[] = resources.slice(0, 3).map((r) => ({
      title: r.title,
      type: 'Resource',
      url: r.url,
    }));

    return {
      activeMonth,
      totalItems,
      completedItems,
      remainingProblems,
      nextTaskType,
      nextTaskTitle,
      nextTaskAction: () => {},
      todayPath,
    };
  };

  const getStaticTrackData = () => {
    const career = user?.preferredCareer || 'Frontend Engineering';
    switch (career) {
      case 'AI Engineer':
        return { track: 'ai-engineer', data: aiEngineerRoadmap };
      case 'Data Scientist':
        return { track: 'data-scientist', data: dataScientistRoadmap };
      case 'Data Analyst':
        return { track: 'data-analyst', data: dataAnalystRoadmap };
      case 'Cyber Security':
        return { track: 'cyber-security', data: cyberSecurityRoadmap };
      case 'Java Developer':
        return { track: 'java-developer', data: javaDeveloperRoadmap };
      case 'Software Engineer':
        return { track: 'software-engineer', data: softwareEngineerRoadmap };
      case 'DevOps Engineer':
        return { track: 'devops-engineer', data: devOpsRoadmap };
      case 'Flutter Developer':
        return { track: 'flutter-developer', data: flutterRoadmap };
      case 'Python Backend':
        return { track: 'python-backend', data: pythonBackendRoadmap };
      case 'Frontend Engineering':
      case 'Frontend':
        return { track: 'frontend', data: frontendRoadmap };
      case 'Full Stack Developer':
      case 'Fullstack':
        return { track: 'fullstack', data: fullstackRoadmap };
      case 'Backend Engineering':
      case 'Backend':
        return { track: 'backend', data: backendRoadmap };
      case 'Mobile Developer':
        return { track: 'mobile', data: mobileRoadmap };
      default:
        return { track: 'frontend', data: frontendRoadmap };
    }
  };

  const sdeState = getActiveSdeState();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading SDE Roadmap Navigator...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <MosaicShell>
        <div className="mosaic-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <AlertOctagon className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-[var(--ink-900)]">Failed to Load Roadmap</h2>
          <button onClick={fetchRoadmap} className="mosaic-btn-primary">
            Retry Connection
          </button>
        </div>
      </MosaicShell>
    );
  }

  const staticTrackObj = getStaticTrackData();

  return (
    <MosaicShell>
      <TopHeader
        title="Personalized Career Roadmap"
        subtitle={`${user?.preferredCareer || 'Engineering Pathway'} • Multi-stage SDE Schedule`}
        primaryActionLabel="Adapt Roadmap Schedule"
        onPrimaryAction={() => handleGenerate(true)}
        primaryActionIcon={<Sparkles className="h-4 w-4" />}
      />

      {isGenerating ? (
        <div className="mosaic-card p-12 text-center space-y-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-bold text-[var(--ink-900)]">Consulting AI Career Mentor</h2>
          <p className="text-xs text-[var(--ink-muted)]">
            Assembling step-by-step topics and milestone schedule...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <RoadmapHeader activeTab={activeTab} roadmap={roadmap} onGenerate={handleGenerate} />
          <RoadmapTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === 'personalized' ? (
            !roadmap || !roadmap.topics || !roadmap.topics.length ? (
              <div className="mosaic-card p-8 text-center space-y-6 max-w-xl mx-auto">
                <Map className="h-12 w-12 text-teal-600 mx-auto" />
                <h2 className="text-2xl font-bold text-[var(--ink-900)] font-heading">
                  Generate Your AI Career Roadmap
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">
                  Create a customized milestone schedule based on your target career profile.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <span className="text-xs font-bold text-teal-700 uppercase flex items-center gap-1">
                    <Target className="h-4 w-4" /> Target Role: {user?.preferredCareer || 'Not set'}
                  </span>
                </div>

                <button onClick={() => handleGenerate(false)} className="mosaic-btn-brand !py-3 !px-8">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Custom SDE Roadmap</span>
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {profileChanged && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-left">
                    <p className="text-xs text-amber-900 font-semibold">
                      Your career profile was updated. Re-generate to adapt your roadmap schedule!
                    </p>
                    <button
                      onClick={() => handleGenerate(true)}
                      className="mosaic-btn-primary !py-1.5 !px-3 !text-xs !bg-amber-900 hover:!bg-amber-950"
                    >
                      Update Roadmap
                    </button>
                  </div>
                )}

                {sdeState && (
                  <div className="grid lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                      <TodayFocusCard
                        activeMonth={sdeState.activeMonth}
                        totalItems={sdeState.totalItems}
                        completedItems={sdeState.completedItems}
                        nextTaskType={sdeState.nextTaskType}
                        nextTaskTitle={sdeState.nextTaskTitle}
                        nextTaskAction={sdeState.nextTaskAction}
                        remainingProblems={sdeState.remainingProblems}
                      />
                      <LearningPathCard todayPath={sdeState.todayPath} />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                      <StreakTracker />
                      <ProgressSummary roadmap={roadmap} />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[var(--ink-900)] font-heading text-left">
                    Month-by-Month Schedule Timeline
                  </h3>
                  <div className="space-y-4">
                    {roadmap.topics.map((topic: Topic, idx: number) => (
                      <TimelineMonthCard
                        key={topic.id}
                        topic={topic}
                        index={idx}
                        isExpanded={Boolean(expandedTopics[topic.id])}
                        onToggleExpand={() => toggleExpand(topic.id)}
                        roadmap={roadmap}
                        onToggle={handleToggle}
                        projectSubmissions={projectSubmissions}
                        setProjectSubmissions={setProjectSubmissions}
                        onSubmitProjectDetails={handleProjectSubmit}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <StaticTrackViewer track={staticTrackObj.track} roadmapData={staticTrackObj.data} />
          )}

          {showReviewModal && (
            <WeeklyReviewModal
              isSubmitting={isSubmittingReview}
              onClose={() => setShowReviewModal(false)}
              onSubmit={handleWeeklyReviewSubmit}
            />
          )}
        </div>
      )}
    </MosaicShell>
  );
}

export default Roadmap;
