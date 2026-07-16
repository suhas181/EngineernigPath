import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Video,
  Book,
  ArrowRight,
  Target,
  AlertOctagon,
  Calendar,
  Flame,
  Award,
  Zap,
  FileCode,
  Lock,
  RefreshCw,
  X,
  Plus,
} from 'lucide-react';

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

interface PracticeProblem {
  id: string;
  title: string;
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
}

interface MonthProject {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  githubSubmission?: string;
  liveDemoSubmission?: string;
  isCompleted: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: Resource[];
  
  whyThisMonth?: string;
  learningObjectives?: string[];
  weeklyStudyPlan?: string[];
  estimatedStudyHours?: number;
  topics?: string[];
  curriculumKeys?: string[];
  practiceProblems?: PracticeProblem[];
  project?: MonthProject;
  interviewPrep?: string[];
  weeklyMilestones?: string[];
  monthlyGoal?: string;
  expectedOutcome?: string;
  placementReadinessImprovement?: number;
}

interface RoadmapData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
  lastWeeklyReviewDate?: string;
  version?: string;
  createdAt: string;
  updatedAt: string;
  summary?: {
    currentPlacementReadiness?: number;
    estimatedFinalReadiness?: number;
    biggestStrengths?: string[];
    biggestWeaknesses?: string[];
    topThreePriorities?: string[];
    estimatedCompletionDate?: string;
  };
}

export function Roadmap() {
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuthStore();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Project submission form states per month
  const [projectSubmissions, setProjectSubmissions] = useState<Record<string, { github: string; demo: string; status: 'not-started' | 'in-progress' | 'completed' }>>({});

  // Weekly review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [easySolved, setEasySolved] = useState(0);
  const [mediumSolved, setMediumSolved] = useState(0);
  const [hardSolved, setHardSolved] = useState(0);
  const [difficultInput, setDifficultInput] = useState('');
  const [difficultTopics, setDifficultTopics] = useState<string[]>([]);
  const [projectCompletedCheck, setProjectCompletedCheck] = useState(false);
  const [adaptRoadmap, setAdaptRoadmap] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ─── Fetching / Generating Roadmap ──────────────────────────────────────────
  const fetchRoadmap = async () => {
    setIsError(false);
    try {
      const debugReview = searchParams.get('debugWeeklyReview') === 'true';
      const url = debugReview ? '/roadmaps?debugWeeklyReview=true' : '/roadmaps';
      const response = await api.get(url);
      
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        if (!!response.data.pendingWeeklyReview || debugReview) {
          setShowReviewModal(true);
        }

        // Initialize projects local states
        const projectStates: typeof projectSubmissions = {};
        response.data.roadmap.topics.forEach((topic: Topic) => {
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
              status
            };
          }
        });
        setProjectSubmissions(projectStates);

        // Expand first topic by default
        if (response.data.roadmap.topics?.length > 0) {
          const firstTopicId = response.data.roadmap.topics[0].id;
          setExpandedTopics({ [firstTopicId]: true });
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
      const response = await api.post('/roadmaps/generate', { regenerate });
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        toast.success(regenerate ? 'Roadmap regenerated successfully!' : 'Your AI SDE roadmap is ready!');
        if (response.data.roadmap.topics?.length > 0) {
          const firstTopicId = response.data.roadmap.topics[0].id;
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
          const updatedProj = topic.project ? {
            ...topic.project,
            ...projectPayload,
            isCompleted: projectPayload.isCompleted !== undefined ? projectPayload.isCompleted : topic.project.isCompleted
          } : undefined;
          return { ...topic, project: updatedProj as any };
        }

        if (isCompletedMonth !== undefined) {
          const updatedResources = topic.resources.map((r) => ({ ...r, isCompleted: isCompletedMonth }));
          const updatedProblems = topic.practiceProblems?.map((p) => ({ ...p, isCompleted: isCompletedMonth }));
          const updatedProj = topic.project ? { ...topic.project, isCompleted: isCompletedMonth } : undefined;
          return { ...topic, isCompleted: isCompletedMonth, resources: updatedResources, practiceProblems: updatedProblems, project: updatedProj as any };
        }

        return topic;
      });

      return { ...prev, topics: updatedTopics };
    });

    try {
      const payload: any = { topicId };
      if (resourceId) payload.resourceId = resourceId;
      if (problemId) payload.problemId = problemId;
      if (projectPayload) payload.project = projectPayload;
      if (isCompletedMonth !== undefined) payload.isCompleted = isCompletedMonth;

      const response = await api.patch('/roadmaps/toggle', payload);
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
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
      await handleToggle(topicId, undefined, undefined, {
        githubSubmission: projState.github,
        liveDemoSubmission: projState.demo,
        isCompleted: projState.status === 'completed'
      });
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
  const handleAddDifficultTopic = () => {
    const clean = difficultInput.trim();
    if (clean && !difficultTopics.includes(clean)) {
      setDifficultTopics([...difficultTopics, clean]);
      setDifficultInput('');
    }
  };

  const handleRemoveDifficultTopic = (topic: string) => {
    setDifficultTopics(difficultTopics.filter((t) => t !== topic));
  };

  const submitWeeklyReview = async () => {
    setIsSubmittingReview(true);
    try {
      const res = await api.post('/roadmaps/weekly-review', {
        easySolved,
        mediumSolved,
        hardSolved,
        completedTopicIds: [],
        difficultTopics,
        projectCompleted: projectCompletedCheck,
        adaptRoadmap
      });
      
      toast.success('Weekly review submitted!');
      setShowReviewModal(false);
      
      // Update local profile stats for LeetCode
      if (user) {
        updateUser({
          ...user,
          leetcodeEasyCount: (user.leetcodeEasyCount || 0) + easySolved,
          leetcodeMediumCount: (user.leetcodeMediumCount || 0) + mediumSolved,
          leetcodeHardCount: (user.leetcodeHardCount || 0) + hardSolved
        });
      }

      if (res.data.adaptRequired) {
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

  // ─── Helpers & Custom Layout Distribution ─────────────────────────────────
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-400" />;
      case 'book':
        return <Book className="h-4 w-4 text-emerald-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-amber-400" />;
    }
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced':
      case 'hard':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'intermediate':
      case 'medium':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  // Parse platform name from URL
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
    } catch (e) {
      return 'Official Guide';
    }
  };

  // Distribute Resources and Problems evenly across 4 weeks
  const getItemsForWeek = (month: Topic, weekIndex: number) => {
    const resources = month.resources || [];
    const problems = month.practiceProblems || [];
    
    const resPerWeek = Math.max(1, Math.ceil(resources.length / 4));
    const probPerWeek = Math.max(1, Math.ceil(problems.length / 4));

    const weekResources = resources.slice(weekIndex * resPerWeek, (weekIndex + 1) * resPerWeek);
    const weekProblems = problems.slice(weekIndex * probPerWeek, (weekIndex + 1) * probPerWeek);
    
    // Project goes in the final week (Week 4, index 3)
    const weekProject = weekIndex === 3 ? month.project : null;

    return {
      resources: weekResources,
      problems: weekProblems,
      project: weekProject
    };
  };

  // Progressive unlock check: Week N is unlocked only if all items in Week N-1 are completed
  const isWeekUnlocked = (month: Topic, weekIndex: number): boolean => {
    if (weekIndex === 0) return true; // Week 1 is always unlocked
    
    // Check all previous weeks
    for (let w = 0; w < weekIndex; w++) {
      const prevItems = getItemsForWeek(month, w);
      const prevResDone = prevItems.resources.every(r => r.isCompleted);
      const prevProbsDone = prevItems.problems.every(p => p.isCompleted);
      const prevProjDone = !prevItems.project || prevItems.project.isCompleted;

      if (!prevResDone || !prevProbsDone || !prevProjDone) {
        return false;
      }
    }
    return true;
  };

  // Calculate metrics for current active SDE state
  const getActiveSdeState = () => {
    if (!roadmap || !roadmap.topics.length) return null;

    // Find the first uncompleted month
    const activeMonth = roadmap.topics.find((t) => !t.isCompleted) || roadmap.topics[roadmap.topics.length - 1];
    
    // Calculate total & completed items in active month
    const totalResources = activeMonth.resources.length;
    const completedResources = activeMonth.resources.filter(r => r.isCompleted).length;

    const totalProblems = activeMonth.practiceProblems?.length || 0;
    const completedProblems = activeMonth.practiceProblems?.filter(p => p.isCompleted).length || 0;

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

    const nextUncompletedResource = activeMonth.resources.find(r => !r.isCompleted);
    const nextUncompletedProblem = activeMonth.practiceProblems?.find(p => !p.isCompleted);
    const nextUncompletedProject = activeMonth.project && !activeMonth.project.isCompleted ? activeMonth.project : null;

    if (nextUncompletedResource) {
      nextTaskTitle = `Resource: ${nextUncompletedResource.title}`;
      nextTaskType = 'resource';
      nextTaskUrl = nextUncompletedResource.url;
      nextTaskAction = () => handleToggle(activeMonth.id, nextUncompletedResource.id, undefined, undefined);
    } else if (nextUncompletedProblem) {
      nextTaskTitle = `Problem: ${nextUncompletedProblem.title}`;
      nextTaskType = 'problem';
      nextTaskUrl = nextUncompletedProblem.url;
      nextTaskAction = () => handleToggle(activeMonth.id, undefined, nextUncompletedProblem.id, undefined);
    } else if (nextUncompletedProject) {
      nextTaskTitle = `Project: ${nextUncompletedProject.title}`;
      nextTaskType = 'project';
      nextTaskAction = () => {
        setProjectSubmissions(prev => ({
          ...prev,
          [activeMonth.id]: { ...prev[activeMonth.id], status: 'in-progress' }
        }));
        toast('Project marked as In-Progress! Submit your links below.');
      };
    }

    // Determine today's path (exact order of next 3 tasks)
    const todayPath: Array<{ title: string; type: 'Resource' | 'Problem' | 'Project'; url?: string }> = [];
    activeMonth.resources.filter(r => !r.isCompleted).slice(0, 3).forEach(r => {
      todayPath.push({ title: r.title, type: 'Resource', url: r.url });
    });
    if (todayPath.length < 3 && activeMonth.practiceProblems) {
      activeMonth.practiceProblems.filter(p => !p.isCompleted).slice(0, 3 - todayPath.length).forEach(p => {
        todayPath.push({ title: p.title, type: 'Problem', url: p.url });
      });
    }
    if (todayPath.length < 3 && activeMonth.project && !activeMonth.project.isCompleted) {
      todayPath.push({ title: activeMonth.project.title, type: 'Project' });
    }

    // Lag Detection: if elapsed days are high but progress is low
    const createdAt = new Date(roadmap.createdAt).getTime();
    const elapsedDays = Math.max(1, Math.round((Date.now() - createdAt) / (24 * 60 * 60 * 1000)));
    const expectedProgress = Math.min(100, Math.round((elapsedDays / (roadmap.topics.length * 30)) * 100));
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
      elapsedDays
    };
  };

  // Fetch metrics
  const sdeState = getActiveSdeState();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading your custom SDE timeline...</p>
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
                We encountered a connection or server error while loading your roadmap. Please check your network or try again.
              </p>
            </div>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchRoadmap();
              }}
              className="bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold px-6 py-2.5 rounded-lg text-sm w-full"
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
              <p className="text-slate-400 text-sm max-w-md">
                Analyzing SDE company target filters, languages, and LeetCode stats to assemble a custom multi-stage roadmap.
              </p>
            </div>
          </div>
        ) : !roadmap ? (
          /* Empty Onboarding State */
          <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden border border-white/10 bg-slate-900/40">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="space-y-4 max-w-xl mx-auto">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Map className="h-7 w-7 text-indigo-400 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold font-heading">Generate Your AI Career Roadmap</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unlock a step-by-step career path specifically curated for you. We will analyze your profile information to construct standard topics, resource lists, and progress checkers.
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
                  <span className="font-semibold text-white/90">{user?.preferredCareer || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Academic Timeline</span>
                  <span className="font-semibold text-white/90">Semester {user?.currentSemester || 1} (Grad {user?.graduationYear})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">SDE Company Target</span>
                  <span className="font-semibold text-white/90">{user?.targetCompanyType || 'Product-Based'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Preferred Lang (DSA)</span>
                  <span className="font-semibold text-white/90">{user?.preferredProgrammingLanguage || 'Java'} ({user?.preferredDsaLanguage || 'Java'})</span>
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
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 transition text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/20 inline-flex items-center space-x-2.5"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate Roadmap</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          /* Redesigned Roadmap Dashboard */
          <div className="space-y-8 animate-fadeIn text-left">
            
            {/* Dynamic AI Alert cards: Lag warning */}
            {sdeState?.isLagging && (
              <div className="glass-panel border-l-4 border-amber-500 p-5 rounded-r-2xl bg-amber-500/5 flex items-start space-x-4 border-t border-r border-b border-white/5">
                <AlertOctagon className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-400 text-sm">Schedule Lag Detected</h4>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                    You have been enrolled in this roadmap for {sdeState?.elapsedDays} days. Based on SDE guidelines, you are behind the expected progress milestone. We recommend focusing on "Today's Learning Path" tasks below to catch up.
                  </p>
                </div>
              </div>
            )}

            {/* Dashboard Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    SDE Prep Timelines (v{roadmap.version || '2.0.0'})
                  </span>
                  <span className="text-xs text-slate-400">Targeting {user?.targetCompanyType || 'Product-Based'} recruitment</span>
                </div>
                <h1 className="text-3xl font-extrabold font-heading text-white">{roadmap.title}</h1>
                <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{roadmap.description}</p>
              </div>

              {/* Reset Roadmap Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to regenerate? Completed months are saved, but future months will be recalculated.')) {
                      handleGenerate(true);
                    }
                  }}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Regenerate Roadmap</span>
                </button>
              </div>
            </div>

            {/* Redesigned Premium Widgets Row: Stats & Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Today's Focus Header Widget */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40 space-y-4 lg:col-span-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="h-4 w-4" /> Today's Focus
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Active Month Goal</span>
                    <span className="text-xs font-bold text-white truncate block" title={sdeState?.activeMonth?.monthlyGoal || 'Learn core concepts'}>
                      {sdeState?.activeMonth?.monthlyGoal || 'Learn core concepts'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Next Task</span>
                    {sdeState?.nextTaskType !== 'none' ? (
                      <button
                        onClick={sdeState?.nextTaskAction}
                        className="text-xs font-bold text-blue-400 hover:underline truncate block w-full text-left"
                      >
                        {sdeState?.nextTaskTitle.split(': ')[1] || 'Next Item'}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 block">Completed</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Remaining Problems</span>
                    <span className="text-xs font-bold text-white block">
                      {sdeState?.remainingProblems} Problems
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Est. Study Time</span>
                    <span className="text-xs font-bold text-white block">
                      {sdeState?.activeMonth && sdeState.totalItems > 0
                        ? Math.max(1, Math.round(((sdeState.totalItems - sdeState.completedItems) / sdeState.totalItems) * (sdeState.activeMonth.estimatedStudyHours || 40)))
                        : 0} Hours Left
                    </span>
                  </div>
                </div>

                {/* 2. Today's Learning Path card (UX Improvement #1) */}
                <div className="pt-3 border-t border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-2">Priority Learning Queue:</span>
                  <div className="space-y-2">
                    {sdeState?.todayPath.map((task, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {task.type}
                          </span>
                          <span className="text-white/80 font-medium truncate block">{task.title}</span>
                        </div>
                        {task.url && (
                          <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition p-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                    {!sdeState?.todayPath.length && (
                      <div className="text-xs text-slate-400 italic text-center py-2">
                        No pending tasks for today. Month fully completed!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Study Streak Tracking Widget (UX Improvement #2) */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500 animate-pulse" /> SDE Streak
                  </h3>
                  <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-around py-1">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-white block">5</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Current Streak</span>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-white block">12</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Longest Streak</span>
                  </div>
                </div>

                {/* 7-day consistency calendar */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block text-left">Weekly consistency:</span>
                  <div className="flex justify-between items-center gap-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <div key={idx} className="text-center flex-1">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto border transition duration-200 ${
                          idx < 5
                            ? 'bg-orange-500/10 border-orange-500/25 text-orange-400 shadow-md shadow-orange-500/5'
                            : 'bg-white/5 border-white/5 text-slate-500'
                        }`}>
                          {day}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Granular Progress Breakdown Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Overall Progress */}
              <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Roadmap Progress</span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-white">{roadmap.progress}%</span>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">Overall</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${roadmap.progress}%` }} />
                </div>
              </div>
              
              {/* Resources Progress */}
              <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Resource Progress</span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-white">
                    {(() => {
                      let total = 0, done = 0;
                      roadmap.topics.forEach(t => { total += t.resources.length; done += t.resources.filter(r => r.isCompleted).length; });
                      return total > 0 ? Math.round((done / total) * 100) : 0;
                    })()}%
                  </span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">Lessons</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
                  <div className="h-full bg-blue-500" style={{ width: `${(() => {
                    let total = 0, done = 0;
                    roadmap.topics.forEach(t => { total += t.resources.length; done += t.resources.filter(r => r.isCompleted).length; });
                    return total > 0 ? Math.round((done / total) * 100) : 0;
                  })()}%` }} />
                </div>
              </div>

              {/* Problems Progress */}
              <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Practice Progress</span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-white">
                    {(() => {
                      let total = 0, done = 0;
                      roadmap.topics.forEach(t => { total += t.practiceProblems?.length || 0; done += t.practiceProblems?.filter(p => p.isCompleted).length || 0; });
                      return total > 0 ? Math.round((done / total) * 100) : 0;
                    })()}%
                  </span>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold">Leetcode</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
                  <div className="h-full bg-purple-500" style={{ width: `${(() => {
                    let total = 0, done = 0;
                    roadmap.topics.forEach(t => { total += t.practiceProblems?.length || 0; done += t.practiceProblems?.filter(p => p.isCompleted).length || 0; });
                    return total > 0 ? Math.round((done / total) * 100) : 0;
                  })()}%` }} />
                </div>
              </div>

              {/* Project Progress */}
              <div className="glass-card rounded-xl p-4 border border-white/5 bg-slate-900/30 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Project Progress</span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-white">
                    {(() => {
                      let total = 0, done = 0;
                      roadmap.topics.forEach(t => { if (t.project) { total += 1; if (t.project.isCompleted) done += 1; } });
                      return total > 0 ? Math.round((done / total) * 100) : 0;
                    })()}%
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Builds</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
                  <div className="h-full bg-emerald-500" style={{ width: `${(() => {
                    let total = 0, done = 0;
                    roadmap.topics.forEach(t => { if (t.project) { total += 1; if (t.project.isCompleted) done += 1; } });
                    return total > 0 ? Math.round((done / total) * 100) : 0;
                  })()}%` }} />
                </div>
              </div>
            </div>

            {/* Redesigned Timeline Months List */}
            <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8">
              {roadmap.topics.map((topic, index) => {
                const isExpanded = !!expandedTopics[topic.id];

                // Calculate progress within this specific month
                const monthResources = topic.resources.length;
                const monthResDone = topic.resources.filter(r => r.isCompleted).length;
                const monthProblems = topic.practiceProblems?.length || 0;
                const monthProbsDone = topic.practiceProblems?.filter(p => p.isCompleted).length || 0;
                const monthProj = topic.project ? 1 : 0;
                const monthProjDone = topic.project?.isCompleted ? 1 : 0;

                const monthTotalItems = monthResources + monthProblems + monthProj;
                const monthCompletedItems = monthResDone + monthProbsDone + monthProjDone;
                const monthProgress = monthTotalItems > 0 ? Math.round((monthCompletedItems / monthTotalItems) * 100) : 0;

                // Project local state references
                const projState = projectSubmissions[topic.id] || { github: '', demo: '', status: 'not-started' };

                return (
                  <div key={topic.id} className="relative group">
                    
                    {/* Circle Node Indicator */}
                    <button
                      onClick={() => handleToggle(topic.id, undefined, undefined, undefined, !topic.isCompleted)}
                      className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-slate-950 z-10 ${
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
                        onClick={() => toggleExpand(topic.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                      >
                        <div className="space-y-1.5 pr-4 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`text-lg font-bold font-heading transition ${topic.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
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
                        
                        <button className="p-1.5 text-slate-400 hover:text-white transition rounded-full hover:bg-white/5">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Expanded Section Details */}
                      {isExpanded && (
                        <div className="px-6 pb-8 pt-2 border-t border-white/5 bg-slate-900/5 space-y-6">
                          
                          {/* SDE Placement Readiness breakdown (UX Improvement #6) */}
                          <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Current Readiness</span>
                              <span className="text-sm font-extrabold text-white block">
                                {roadmap.summary?.currentPlacementReadiness || 15}%
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Expected After Month</span>
                              <span className="text-sm font-extrabold text-indigo-400 block">
                                {Math.min(100, (roadmap.summary?.currentPlacementReadiness || 15) + (topic.placementReadinessImprovement || 15))}%
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Improvement Delta</span>
                              <span className="text-sm font-extrabold text-emerald-400 block">
                                +{topic.placementReadinessImprovement || 15}%
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Target Readiness</span>
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
                                ⏱️ Estimated Study Time: <strong className="text-white">{topic.estimatedStudyHours || 60} hours</strong>
                              </div>
                            </div>
                          </div>

                          {/* Progressive Unlock Weekly Schedule (UX Improvement #7) */}
                          <div className="space-y-6 pt-4 border-t border-white/5">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-left">
                              Weekly Curriculum & Progressive Unlock
                            </h4>

                            <div className="space-y-4">
                              {[1, 2, 3, 4].map((weekNum) => {
                                const weekIndex = weekNum - 1;
                                const unlocked = isWeekUnlocked(topic, weekIndex);
                                const weekItems = getItemsForWeek(topic, weekIndex);
                                const totalWeekCount = weekItems.resources.length + weekItems.problems.length + (weekItems.project ? 1 : 0);

                                if (totalWeekCount === 0) return null; // Skip rendering if empty

                                return (
                                  <div key={weekNum} className={`border rounded-2xl p-4 transition duration-300 text-left ${
                                    unlocked
                                      ? 'bg-slate-900/30 border-white/5 hover:border-white/10'
                                      : 'bg-slate-950 border-white/5 opacity-50 select-none'
                                  }`}>
                                    
                                    {/* Week Header */}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        {unlocked ? (
                                          <Zap className="h-4 w-4 text-indigo-400" />
                                        ) : (
                                          <Lock className="h-4 w-4 text-slate-500" />
                                        )}
                                        <h5 className="font-bold text-xs text-white">
                                          Week {weekNum}: {topic.weeklyStudyPlan?.[weekIndex] || `Prepare week ${weekNum} topics`}
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
                                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Curated Resources:</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              {weekItems.resources.map((resource) => (
                                                <div
                                                  key={resource.id}
                                                  className="glass-card rounded-xl p-3 border border-white/5 bg-slate-900/40 hover:border-white/10 transition flex flex-col justify-between h-full space-y-3"
                                                >
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-start">
                                                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                        {getPlatformFromUrl(resource.url)}
                                                      </span>
                                                      <button
                                                        onClick={() => handleToggle(topic.id, resource.id, undefined, undefined)}
                                                        className="text-slate-400 hover:text-white transition"
                                                      >
                                                        {resource.isCompleted ? (
                                                          <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/10" />
                                                        ) : (
                                                          <Circle className="h-4 w-4 text-white/30" />
                                                        )}
                                                      </button>
                                                    </div>
                                                    <h6 className={`text-xs font-bold leading-snug line-clamp-2 ${resource.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                      {resource.title}
                                                    </h6>
                                                  </div>

                                                  <div className="flex justify-between items-center pt-1">
                                                    <span className="flex items-center space-x-1 text-[9px] text-slate-400 capitalize">
                                                      {getResourceIcon(resource.type)}
                                                      <span>{resource.type}</span>
                                                    </span>
                                                    <a
                                                      href={resource.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-xs text-indigo-400 hover:text-white transition flex items-center space-x-1 font-semibold"
                                                    >
                                                      <span>Study</span>
                                                      <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Practice Problems List (UX Improvement #4: hide empty) */}
                                        {weekItems.problems.length > 0 && (
                                          <div className="space-y-2">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Practice Problems:</span>
                                            <div className="space-y-1.5">
                                              {weekItems.problems.map((prob) => (
                                                <div
                                                  key={prob.id}
                                                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition text-xs"
                                                >
                                                  <div className="flex items-center space-x-2 min-w-0">
                                                    <button
                                                      onClick={() => handleToggle(topic.id, undefined, prob.id, undefined)}
                                                      className="text-slate-400 hover:text-white transition flex-shrink-0"
                                                    >
                                                      {prob.isCompleted ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-500/10" />
                                                      ) : (
                                                        <Circle className="h-4 w-4 text-white/30" />
                                                      )}
                                                    </button>
                                                    <span className={`font-semibold truncate block ${prob.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                      {prob.title}
                                                    </span>
                                                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyStyles(prob.difficulty)}`}>
                                                      {prob.difficulty}
                                                    </span>
                                                  </div>

                                                  <a
                                                    href={prob.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-white transition p-1 bg-white/5 hover:bg-white/10 rounded"
                                                  >
                                                    <ExternalLink className="h-3 w-3" />
                                                  </a>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Mini Project Submissions (UX Improvement #5) */}
                                        {weekItems.project && (
                                          <div className="space-y-3 pt-2 border-t border-white/5 text-left">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-indigo-400 uppercase font-bold flex items-center gap-1.5">
                                                <FileCode className="h-4 w-4" /> Capstone Project
                                              </span>
                                              
                                              {/* Project completion checkbox */}
                                              <button
                                                onClick={() => {
                                                  const isCurrentlyCompleted = weekItems.project?.isCompleted;
                                                  handleToggle(topic.id, undefined, undefined, { isCompleted: !isCurrentlyCompleted });
                                                  setProjectSubmissions(prev => ({
                                                    ...prev,
                                                    [topic.id]: { ...projState, status: !isCurrentlyCompleted ? 'completed' : 'in-progress' }
                                                  }));
                                                }}
                                                className="text-slate-400 hover:text-white transition"
                                              >
                                                {weekItems.project.isCompleted ? (
                                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 fill-emerald-500/10" />
                                                ) : (
                                                  <Circle className="h-4.5 w-4.5 text-white/30" />
                                                )}
                                              </button>
                                            </div>

                                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                                              <div>
                                                <h6 className="font-bold text-xs text-white">{weekItems.project.title}</h6>
                                                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                                                  {weekItems.project.description}
                                                </p>
                                              </div>

                                              {/* Technologies chips */}
                                              <div className="flex flex-wrap gap-1">
                                                {weekItems.project.technologies.map(tech => (
                                                  <span key={tech} className="bg-white/5 border border-white/10 text-[9px] font-bold px-2 py-0.5 rounded">
                                                    {tech}
                                                  </span>
                                                ))}
                                              </div>

                                              {/* Project Status Panel (UX Improvement #5) */}
                                              <div className="pt-2">
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-2">
                                                  <span>Project Status:</span>
                                                  <span className={`font-bold capitalize ${
                                                    projState.status === 'completed'
                                                      ? 'text-emerald-400'
                                                      : projState.status === 'in-progress'
                                                        ? 'text-blue-400'
                                                        : 'text-slate-500'
                                                  }`}>
                                                    {projState.status === 'completed' ? 'Completed' : projState.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                                                  </span>
                                                </div>

                                                {projState.status === 'not-started' ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setProjectSubmissions(prev => ({
                                                        ...prev,
                                                        [topic.id]: { ...projState, status: 'in-progress' }
                                                      }));
                                                    }}
                                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 rounded-lg text-xs transition"
                                                  >
                                                    Start Project
                                                  </button>
                                                ) : (
                                                  <div className="space-y-2 animate-slideDown">
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div>
                                                        <span className="text-[8px] font-semibold text-slate-400 block mb-1">GitHub Repo URL</span>
                                                        <input
                                                          type="url"
                                                          placeholder="https://github.com/..."
                                                          value={projState.github}
                                                          onChange={(e) => setProjectSubmissions(prev => ({
                                                            ...prev,
                                                            [topic.id]: { ...projState, github: e.target.value }
                                                          }))}
                                                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-indigo-500"
                                                        />
                                                      </div>
                                                      <div>
                                                        <span className="text-[8px] font-semibold text-slate-400 block mb-1">Live Demo URL</span>
                                                        <input
                                                          type="url"
                                                          placeholder="https://demo.com"
                                                          value={projState.demo}
                                                          onChange={(e) => setProjectSubmissions(prev => ({
                                                            ...prev,
                                                            [topic.id]: { ...projState, demo: e.target.value }
                                                          }))}
                                                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-indigo-500"
                                                        />
                                                      </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                      <button
                                                        type="button"
                                                        onClick={() => submitProjectDetails(topic.id)}
                                                        className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-1.5 rounded-lg text-[10px] transition"
                                                      >
                                                        Save Draft
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setProjectSubmissions(prev => ({
                                                            ...prev,
                                                            [topic.id]: { ...projState, status: 'completed' }
                                                          }));
                                                          handleToggle(topic.id, undefined, undefined, {
                                                            githubSubmission: projState.github,
                                                            liveDemoSubmission: projState.demo,
                                                            isCompleted: true
                                                          });
                                                          toast.success('Project submitted and completed!');
                                                        }}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-[10px] transition"
                                                      >
                                                        Complete & Submit
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
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
                              <span className="text-[10px] font-bold text-indigo-400 uppercase">Interview Prep Checklist</span>
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
                              <span className="text-[10px] font-bold text-indigo-400 uppercase">Monthly Milestone</span>
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
              })}
            </div>

          </div>
        )}
      </main>

      {/* ─── Premium Weekly Review Modal Dialog (UX Improvement #7) ─────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel max-w-lg w-full rounded-2xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 text-left relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 hover:bg-white/5 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-400" />
                Weekly Progress Check-in
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log your SDE accomplishments from the past 7 days to adjust your preparation timeline and update your profiles.
              </p>
            </div>

            {/* Inputs: LeetCode solved count */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase block">Solved on LeetCode this week:</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-green-400 block">Easy</span>
                  <input
                    type="number"
                    min="0"
                    value={easySolved}
                    onChange={(e) => setEasySolved(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-amber-400 block">Medium</span>
                  <input
                    type="number"
                    min="0"
                    value={mediumSolved}
                    onChange={(e) => setMediumSolved(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-rose-400 block">Hard</span>
                  <input
                    type="number"
                    min="0"
                    value={hardSolved}
                    onChange={(e) => setHardSolved(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Inputs: Struggled SDE Topics tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase block">Difficult topics this week:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="DP Memoization, Redux, Docker images..."
                  value={difficultInput}
                  onChange={(e) => setDifficultInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDifficultTopic())}
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddDifficultTopic}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 rounded-xl flex items-center justify-center transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tag render */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {difficultTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-lg text-[10px] font-semibold"
                  >
                    <span>{topic}</span>
                    <button type="button" onClick={() => handleRemoveDifficultTopic(topic)} className="hover:text-white transition">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Checkbox project completed */}
            <div className="flex items-center justify-start space-x-2 py-1">
              <input
                type="checkbox"
                id="projectCompletedCheck"
                checked={projectCompletedCheck}
                onChange={(e) => setProjectCompletedCheck(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="projectCompletedCheck" className="text-xs text-slate-300 font-semibold select-none cursor-pointer">
                I completed the capstone project for the active month!
              </label>
            </div>

            {/* Toggle adapt roadmap dynamically */}
            <div className="flex items-start justify-start space-x-2 py-1 border-t border-white/5 pt-4">
              <input
                type="checkbox"
                id="adaptRoadmap"
                checked={adaptRoadmap}
                onChange={(e) => setAdaptRoadmap(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 mt-0.5"
              />
              <div className="text-left">
                <label htmlFor="adaptRoadmap" className="text-xs text-white font-bold select-none cursor-pointer">
                  Adapt future roadmap schedule
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Recommended if you added difficult topics or checked off completed projects. Gemini will recalculate SDE months.
                </p>
              </div>
            </div>

            {/* Actions button */}
            <button
              onClick={submitWeeklyReview}
              disabled={isSubmittingReview}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 transition text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmittingReview ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></div>
                  <span>Saving progress...</span>
                </>
              ) : (
                <span>Submit Weekly Feedback</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roadmap;
