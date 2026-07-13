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
  TrendingUp,
  Target,
  AlertOctagon,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: Resource[];
}

interface RoadmapData {
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
}

export function Roadmap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const handleGenerate = async (regenerate: boolean = false) => {
    setIsGenerating(true);
    setIsError(false);
    try {
      const response = await api.post('/roadmaps/generate', { regenerate });
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        toast.success(regenerate ? 'Roadmap regenerated successfully!' : 'Your AI career roadmap is ready!');
        if (response.data.roadmap.topics?.length > 0) {
          const firstTopicId = response.data.roadmap.topics[0].id;
          setExpandedTopics({ [firstTopicId]: true });
        }
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      const errMsg = error.response?.data?.message || 'Failed to generate roadmap. Please check your profile details.';
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchRoadmap = async () => {
    setIsError(false);
    try {
      const response = await api.get('/roadmaps');
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        // Expand first topic by default
        if (response.data.roadmap.topics?.length > 0) {
          const firstTopicId = response.data.roadmap.topics[0].id;
          setExpandedTopics({ [firstTopicId]: true });
        }
        if (searchParams.get('generate') === 'true') {
          setSearchParams({}, { replace: true });
        }
      } else {
        if (searchParams.get('generate') === 'true') {
          setSearchParams({}, { replace: true });
          handleGenerate(false);
        }
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggle = async (topicId: string, resourceId?: string, isCompleted?: boolean) => {
    // Optimistic UI Update
    setRoadmap((prev) => {
      if (!prev) return null;
      const updatedTopics = prev.topics.map((topic) => {
        if (topic.id !== topicId) return topic;

        if (resourceId) {
          const updatedResources = topic.resources.map((r) => {
            if (r.id !== resourceId) return r;
            return { ...r, isCompleted: !!isCompleted };
          });
          const allDone = updatedResources.length > 0 && updatedResources.every((r) => r.isCompleted);
          return { ...topic, isCompleted: allDone, resources: updatedResources };
        } else {
          const updatedResources = topic.resources.map((r) => ({ ...r, isCompleted: !!isCompleted }));
          return { ...topic, isCompleted: !!isCompleted, resources: updatedResources };
        }
      });

      const total = updatedTopics.length;
      const completed = updatedTopics.filter((t) => t.isCompleted).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { ...prev, topics: updatedTopics, progress };
    });

    try {
      const response = await api.patch('/roadmaps/toggle', {
        topicId,
        resourceId,
        isCompleted,
      });
      if (response.data && response.data.roadmap) {
        // Sync with database response state
        setRoadmap(response.data.roadmap);
      }
    } catch (error) {
      console.error('Error toggling roadmap item:', error);
      toast.error('Failed to sync progress with server.');
      fetchRoadmap(); // rollback/reload
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

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
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'intermediate':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen text-white font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full px-6 py-10">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertOctagon className="h-6 w-6 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Failed to Load Roadmap</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We encountered a connection or server error while loading your roadmap. Please check your network or try again.
              </p>
            </div>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchRoadmap();
              }}
              className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm w-full"
            >
              Retry Connection
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 text-left">
        {isGenerating ? (
          <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Consulting the AI Career Mentor</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Analyzing your career goals, semester timeline, skills, and interests to generate a structured, custom-fit pathway.
              </p>
            </div>
          </div>
        ) : !roadmap ? (
          /* Empty Onboarding State */
          <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="space-y-4 max-w-xl mx-auto">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Map className="h-7 w-7 text-indigo-400 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold font-heading">Generate Your AI Career Roadmap</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Unlock a step-by-step career path specifically curated for you. We will analyze your profile information to construct standard topics, resource lists, and progress checkers.
              </p>
            </div>

            {/* Profile Overview Card */}
            <div className="glass-card rounded-xl p-6 text-left max-w-lg mx-auto border border-white/5 space-y-4 bg-white/[0.01]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Based on your Profile:
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs block">Target Role</span>
                  <span className="font-semibold text-white/90">{user?.preferredCareer || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Academic Timeline</span>
                  <span className="font-semibold text-white/90">Semester {user?.currentSemester || 1} (Grad {user?.graduationYear})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs block">Interests & Core Skills</span>
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
          /* Roadmap Timeline State */
          <div className="space-y-8 animate-fade-in">
            {/* Header Description */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  AI-Powered Guides
                </span>
                <span className="text-xs text-muted-foreground">Updated live</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading">{roadmap.title}</h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {roadmap.description}
              </p>
            </div>

            {/* Overall Progress Widget */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold">Your Progression</h3>
                  <p className="text-xs text-muted-foreground">Complete resources to progress your topics</p>
                </div>
              </div>
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{roadmap.progress}% Done</span>
                  <span className="text-muted-foreground">
                    {roadmap.topics.filter((t) => t.isCompleted).length} / {roadmap.topics.length} Topics
                  </span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${roadmap.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Reset Roadmap Button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleGenerate(true)}
                className="text-xs text-muted-foreground hover:text-white transition flex items-center space-x-1 hover:underline"
                title="Regenerate roadmap with updated profile parameters"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Re-generate roadmap</span>
              </button>
            </div>

            {/* Vertical timeline listing topics */}
            <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
              {roadmap.topics.map((topic, index) => {
                const isExpanded = !!expandedTopics[topic.id];
                return (
                  <div key={topic.id} className="relative group">
                    {/* Circle Node Indicator */}
                    <button
                      onClick={() => handleToggle(topic.id, undefined, !topic.isCompleted)}
                      className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                        topic.isCompleted
                          ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                          : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                      }`}
                      title={topic.isCompleted ? 'Mark Topic Incomplete' : 'Mark Topic Complete'}
                    >
                      {topic.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                      ) : (
                        <span className="text-xs font-bold font-heading">{index + 1}</span>
                      )}
                    </button>

                    {/* Topic Content Card */}
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                      {/* Topic Header Summary */}
                      <div
                        onClick={() => toggleExpand(topic.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                      >
                        <div className="space-y-1 pr-4 text-left">
                          <h3 className={`text-lg font-bold font-heading transition ${topic.isCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                            {topic.title}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            {topic.resources.length} study resources • {topic.resources.filter((r) => r.isCompleted).length} completed
                          </p>
                        </div>
                        <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Expandable resources details */}
                      {isExpanded && (
                        <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-4">
                          <p className="text-sm text-white/70 leading-relaxed text-left">
                            {topic.description}
                          </p>

                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">
                              Learning Resources
                            </h4>

                            {topic.resources.map((resource) => (
                              <div
                                key={resource.id}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition gap-4 text-left"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  {/* Resource completion checkbox */}
                                  <button
                                    onClick={() => handleToggle(topic.id, resource.id, !resource.isCompleted)}
                                    className="p-0.5 text-muted-foreground hover:text-white transition"
                                  >
                                    {resource.isCompleted ? (
                                      <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-white/30" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <h5 className={`text-sm font-semibold truncate ${resource.isCompleted ? 'text-white/40 line-through' : 'text-white/90'}`}>
                                      {resource.title}
                                    </h5>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="flex items-center space-x-1 text-[10px] text-muted-foreground font-medium capitalize">
                                        {getResourceIcon(resource.type)}
                                        <span>{resource.type}</span>
                                      </span>
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyStyles(resource.difficulty)}`}>
                                        {resource.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                  title="Open learning link in new tab"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            ))}
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
    </div>
  );
}

export default Roadmap;
