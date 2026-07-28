import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { calculateAiAccuracy } from '../utils/profileCompletion';
import AnimatedNumber from '../components/dashboard/AnimatedNumber';
import RadialProgress from '../components/dashboard/RadialProgress';
import {
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  BookOpen,
  Target,
  Flame,
  Award,
  CheckCircle2,
  Circle,
  Sparkles,
  Compass,
  PlayCircle,
} from 'lucide-react';

interface Stats {
  overallProgress: number;
  completedTopics: number;
  totalTopics: number;
  dsaProblemsSolved: number;
  projectsBuilt: number;
  totalStudyHours?: number;
  categoryCounts?: Record<string, number>;
}

interface Recommendation {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
}

interface Deadline {
  id: string;
  title: string;
  date: string;
  type: string;
  company: string;
}

interface Activity {
  id: string;
  description: string;
  date: string;
}

interface TaskItem {
  _id: string;
  title: string;
  type: 'daily' | 'weekly';
  dueDate: string;
  isCompleted: boolean;
  xpReward: number;
}

interface UserStatsData {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: Array<{ badgeId: string; earnedAt: string }>;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const aiAccuracy = calculateAiAccuracy(user);

  const [hasActiveRoadmap, setHasActiveRoadmap] = useState<boolean>(false);
  const [activeCareerPath, setActiveCareerPath] = useState<string>('Engineering Pathway');
  const [currentMonth, setCurrentMonth] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [targetGoal, setTargetGoal] = useState<string>('Placement');
  const [durationMonths, setDurationMonths] = useState<string>('6 Months');
  const [estimatedHoursRemaining, setEstimatedHoursRemaining] = useState<number>(0);
  const [continueLearningRoute, setContinueLearningRoute] = useState<string>('/roadmaps');

  const [stats, setStats] = useState<Stats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [prodStats, setProdStats] = useState<UserStatsData | null>(null);
  const [dailyTasks, setDailyTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, statsRes, tasksRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/productivity/stats'),
        api.get('/productivity/tasks?type=daily'),
      ]);

      const data = dashRes.data;
      setHasActiveRoadmap(!!data.hasActiveRoadmap);
      setActiveCareerPath(data.activeCareerPath || user?.preferredCareer || 'Engineering Pathway');
      setTargetGoal(data.targetGoal || 'Placement');
      setDurationMonths(data.durationMonths || '6 Months');
      setCurrentMonth(data.currentMonth || null);
      setCurrentModule(data.currentModule || null);
      setCurrentTopic(data.currentTopic || null);
      setCompletionPercentage(data.completionPercentage || 0);
      setEstimatedHoursRemaining(data.estimatedHoursRemaining || 0);
      setContinueLearningRoute(data.continueLearningRoute || '/roadmaps');

      setStats(data.stats);
      setRecommendations(data.recommendations || []);
      setDeadlines(data.deadlines || []);
      setActivities(data.activities || []);

      setProdStats(statsRes.data.stats);
      setDailyTasks(tasksRes.data.tasks.filter((t: any) => !t.isCompleted).slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setDailyTasks((prev) => prev.filter((t) => t._id !== taskId));

    try {
      const res = await api.patch(`/productivity/tasks/${taskId}/toggle`, {
        isCompleted: !currentStatus,
      });
      toast.success('Checklist item completed!');

      if (res.data.levelUp) {
        toast.success(`🎉 Level Up! You are now level ${res.data.task?.level || 2}!`, {
          duration: 6000,
        });
      }

      if (res.data.newlyEarnedBadges?.length > 0) {
        res.data.newlyEarnedBadges.forEach((b: string) => {
          toast(`🏆 Badge Unlocked: ${b.replace('_', ' ').toUpperCase()}!`, {
            icon: '🔥',
            duration: 5000,
          });
        });
      }

      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task.');
      fetchDashboard();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  const userCareerTrack = activeCareerPath;
  const leetcodeTotal = user?.leetcodeUsername
    ? (user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0)
    : 0;
  const masteryScore = Math.min(100, Math.round((leetcodeTotal * 0.8) + ((stats?.projectsBuilt || 0) * 20)));

  return (
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8 text-left">
        
        {/* ─── Primary Hero Section (Bento Anchor Card) ──────────────────────────────── */}
        <section className="hero-glass-card rounded-3xl p-8 border border-indigo-500/20 relative overflow-hidden transition-all duration-300">
          <div className="absolute -top-12 -right-12 h-80 w-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 left-1/3 h-72 w-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header Badges & User Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap pb-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Track: {userCareerTrack}</span>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Target className="h-3.5 w-3.5" />
                    <span>Goal: {targetGoal}</span>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Timeline: {durationMonths}</span>
                  </div>
                </div>

                {/* Display Font Hero Greeting */}
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">{user?.name}</span>!
                </h1>

                <p className="text-muted-foreground text-xs md:text-sm flex items-center gap-2 flex-wrap font-medium">
                  <span>{user?.college || 'Engineering Student'}</span>
                  <span>•</span>
                  <span>{user?.branch || 'Computer Science'}</span>
                  <span>•</span>
                  <span>Semester {user?.currentSemester || 1}</span>
                </p>
              </div>

              {/* Gamification Pills (Amber Accent) */}
              <div className="flex items-center gap-3 flex-wrap self-stretch md:self-auto">
                <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-extrabold text-amber-400 glow-amber">
                  <Flame className="h-4 w-4 fill-amber-500/30" />
                  <span>🔥 {prodStats?.currentStreak || 0} Day Streak</span>
                </div>

                <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2.5 rounded-xl text-xs font-extrabold text-indigo-300">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span>Lvl {prodStats?.level || 1} Pioneer</span>
                </div>

                {aiAccuracy < 100 && (
                  <button
                    onClick={() => navigate('/complete-profile')}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white/90 px-3.5 py-2.5 rounded-xl transition"
                  >
                    AI Accuracy: {aiAccuracy}%
                  </button>
                )}
              </div>
            </div>

            {/* Active Learning Hero Callout */}
            {hasActiveRoadmap ? (
              <div className="grid md:grid-cols-12 gap-6 items-center pt-2">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      Active Step
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{currentMonth || 'Current Module'}</span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-white">
                    {currentTopic ? `Resume: ${currentTopic}` : (currentModule || 'Continue Learning')}
                  </h2>

                  {currentModule && currentTopic !== currentModule && (
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {currentModule}
                    </p>
                  )}

                  <div className="flex items-center space-x-6 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center space-x-1.5 text-blue-400 font-bold">
                      <TrendingUp className="h-4 w-4" />
                      <span>{completionPercentage}% Complete</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-slate-400 font-medium">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span>~{estimatedHoursRemaining} hrs remaining</span>
                    </span>
                  </div>
                </div>

                <div className="md:col-span-4 flex justify-start md:justify-end">
                  <button
                    onClick={() => navigate(continueLearningRoute)}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-500 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl glow-indigo flex items-center justify-center space-x-2.5 text-base transition transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <PlayCircle className="h-5 w-5 fill-current text-indigo-200" />
                    <span>Continue Learning</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4 max-w-xl mx-auto">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center mx-auto">
                  <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display">No roadmap found.</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Build a personalized, step-by-step learning path tailored directly to <strong className="text-white">{userCareerTrack}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/roadmaps?generate=true')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg glow-indigo inline-flex items-center space-x-2 transition active:scale-[0.98]"
                >
                  <Sparkles className="h-5 w-5 text-indigo-300" />
                  <span>Generate My AI Roadmap</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── Main Bento Grid Layout (Items-Start aligned to eliminate white-space gaps) ───── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1 (Left 7 Cols): Performance Overview Bento & Recommended Next Steps */}
          <div className="lg:col-span-7 space-y-8 items-start">
            
            {/* Bento Grid Stats Tiles (Radial Rings + Animated Count-Up) */}
            <div className="grid sm:grid-cols-3 gap-4">
              
              {/* Tile 1: Path Progress */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Path Progress</span>
                  <RadialProgress progress={stats?.overallProgress || 0} size={48} strokeWidth={5} colorClass="text-blue-500">
                    <span className="text-[10px] font-extrabold text-blue-400">{stats?.overallProgress || 0}%</span>
                  </RadialProgress>
                </div>
                <div>
                  <h3 className="text-4xl lg:text-5xl font-extrabold font-display text-white">
                    <AnimatedNumber value={stats?.overallProgress || 0} suffix="%" />
                  </h3>
                  <p className="text-xs text-blue-400 font-semibold pt-1">
                    {stats?.completedTopics || 0}/{stats?.totalTopics || 0} Topics Mastered
                  </p>
                </div>
              </div>

              {/* Tile 2: Study Hours */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Study Hours</span>
                  <RadialProgress progress={Math.min(100, Math.round(((stats?.totalStudyHours || 0) / 40) * 100))} size={48} strokeWidth={5} colorClass="text-indigo-400">
                    <Clock className="h-4 w-4 text-indigo-400" />
                  </RadialProgress>
                </div>
                <div>
                  <h3 className="text-4xl lg:text-5xl font-extrabold font-display text-white">
                    <AnimatedNumber value={stats?.totalStudyHours || 0} decimals={1} suffix="h" />
                  </h3>
                  <p className="text-xs text-indigo-300 font-semibold pt-1">Learning Hub Tracked</p>
                </div>
              </div>

              {/* Tile 3: Practical Mastery Score */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Mastery Score</span>
                  <RadialProgress progress={masteryScore} size={48} strokeWidth={5} colorClass="text-purple-400">
                    <span className="text-[10px] font-extrabold text-purple-300">{masteryScore}%</span>
                  </RadialProgress>
                </div>
                <div>
                  <h3 className="text-4xl lg:text-5xl font-extrabold font-display text-white">
                    <AnimatedNumber value={masteryScore} suffix="%" />
                  </h3>
                  {user?.leetcodeUsername ? (
                    <p className="text-xs text-purple-300 font-semibold pt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{stats?.projectsBuilt || 0} Projects</span>
                      <span>•</span>
                      <span>{(user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0)} LeetCode Solved</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                        Verified
                      </span>
                    </p>
                  ) : (
                    <div className="pt-1.5 space-y-1">
                      <p className="text-xs text-purple-300/80 font-medium">
                        {stats?.projectsBuilt || 0} Projects Built
                      </p>
                      <button
                        onClick={() => navigate('/profile/settings')}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline flex items-center space-x-1 transition"
                      >
                        <span>Link your LeetCode account to track solved problems</span>
                        <ArrowUpRight className="h-3 w-3 inline" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Recommended Next Steps */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-xl font-bold font-display text-white">Recommended Next Steps</h2>
                </div>
                <span className="text-xs font-bold text-muted-foreground px-3 py-1 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider">
                  {userCareerTrack}
                </span>
              </div>

              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <Target className="h-10 w-10 text-indigo-400/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {hasActiveRoadmap
                        ? 'All roadmap topics completed! You are fully placement ready.'
                        : 'No recommendations available. Generate an AI Roadmap to see your next steps.'}
                    </p>
                    {!hasActiveRoadmap && (
                      <button
                        onClick={() => navigate('/roadmaps?generate=true')}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Generate Roadmap →
                      </button>
                    )}
                  </div>
                ) : (
                  recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-xl border border-white/5 gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {userCareerTrack}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                            {item.difficulty}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white truncate">{item.title}</h4>
                      </div>

                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="flex items-center text-xs text-muted-foreground space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.estimatedTime}</span>
                        </div>
                        <button
                          onClick={() => navigate('/roadmaps')}
                          className="bg-indigo-600 hover:bg-indigo-500 transition text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-md active:scale-[0.98]"
                        >
                          <span>Resume Task</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Column 2 (Right 5 Cols): Daily Checklist, Upcoming Deadlines, Recent Activity */}
          <div className="lg:col-span-5 space-y-8 items-start">
            
            {/* Daily Targets Checklist */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-xl font-bold font-display text-white">Daily Checklist</h2>
                </div>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  {dailyTasks.length} pending
                </span>
              </div>

              <div className="space-y-3">
                {dailyTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-3">
                    All daily targets completed! 🎉
                  </p>
                ) : (
                  dailyTasks.map((t) => (
                    <div
                      key={t._id}
                      className="glass-card flex items-center justify-between p-3.5 rounded-xl border border-white/5 gap-4"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => handleToggleTask(t._id, t.isCompleted)}
                          className="text-muted-foreground hover:text-indigo-400 transition"
                        >
                          <Circle className="h-5 w-5 text-white/30 hover:text-indigo-400 transition" />
                        </button>
                        <span className="text-xs font-semibold truncate text-white/90">
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
                        +{t.xpReward} XP
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold font-display text-white">Upcoming Deadlines</h2>
              </div>
              
              <div className="space-y-4">
                {deadlines.length === 0 ? (
                  <div className="text-center py-6 space-y-3">
                    <Calendar className="h-8 w-8 text-blue-400/40 mx-auto" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No upcoming deadlines. Add planner tasks or bookmark opportunities to track them here.
                    </p>
                    <button onClick={() => navigate('/planner')} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition">
                      Open Planner →
                    </button>
                  </div>
                ) : (
                  deadlines.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card p-4 rounded-xl border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">{item.company}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Due: {formatDate(item.date)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity (Filtered strictly to Career Platform Milestones) */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-bold font-display text-white">Recent Activity</h2>
              </div>

              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <BookOpen className="h-8 w-8 text-purple-400/40 mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      No recent activity yet. Start learning or completing roadmap topics to see your timeline.
                    </p>
                  </div>
                ) : (
                  activities.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 text-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0 shadow-sm" />
                      <div className="space-y-0.5">
                        <p className="text-white/95 text-xs font-semibold leading-relaxed">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;

