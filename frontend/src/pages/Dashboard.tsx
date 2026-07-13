import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { calculateAiAccuracy } from '../utils/profileCompletion';
import {
  TrendingUp,
  Code,
  FolderGit2,
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

      const { stats, recommendations, deadlines, activities } = dashRes.data;
      setStats(stats);
      setRecommendations(recommendations);
      setDeadlines(deadlines);
      setActivities(activities);

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
    // Optimistic UI update
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

      // Reload
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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-8 text-left">
        
        {/* Welcome message & AI Accuracy Bar */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left space-y-2">
              <h1 className="text-3xl font-bold font-heading">
                Welcome back, <span className="text-blue-400">{user?.name}</span>!
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 flex-wrap">
                <span>{user?.college}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{user?.branch}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>Semester {user?.currentSemester}</span>
              </p>
            </div>
            
            {/* AI Accuracy Badge */}
            <div className="flex items-center space-x-4 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl self-stretch md:self-auto justify-between">
              <div className="text-left space-y-1 pr-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">AI Accuracy Score</span>
                <span className="text-sm font-bold text-indigo-400">{aiAccuracy}%</span>
              </div>
              {aiAccuracy < 100 && (
                <button
                  onClick={() => navigate('/complete-profile')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10"
                >
                  Improve AI Accuracy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generate My AI Roadmap CTA */}
        {(!stats || stats.totalTopics === 0) && (
          <div className="lg:col-span-12 glass-panel rounded-2xl p-8 text-center space-y-6 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.03] to-blue-500/[0.03] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            
            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold font-heading text-white">Generate Your AI Career Roadmap</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a completely customized, step-by-step learning path tailored to your semesters, career goals, and skills.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/roadmaps?generate=true')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 transition text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/25 inline-flex items-center space-x-2"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-indigo-300" />
              <span>Generate My AI Roadmap</span>
            </button>
          </div>
        )}

        {/* XP Level & Streak Overview Widget */}
        <div className="lg:col-span-12 glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6 bg-gradient-to-r from-blue-500/[0.02] to-indigo-500/[0.02]">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold font-heading">Level {prodStats?.level || 1} Pioneer</h2>
              <p className="text-xs text-muted-foreground">Keep completing tasks and roadmaps to gain XP</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 w-full sm:w-auto">
            {/* Streak count */}
            <div className="flex items-center space-x-1.5 text-orange-400 bg-orange-500/10 border border-orange-500/25 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0">
              <Flame className="h-4.5 w-4.5 fill-orange-500/25" />
              <span>🔥 {prodStats?.currentStreak || 1} Day Streak</span>
            </div>

            {/* Progress bar */}
            <div className="w-48 sm:w-64 space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold">
                <span>{prodStats ? prodStats.xp % 200 : 0} / 200 XP</span>
                <span className="text-muted-foreground">Next Level: {Math.max(0, 200 - (prodStats ? prodStats.xp % 200 : 0))} XP</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${prodStats ? ((prodStats.xp % 200) / 200) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 1: Progress Metrics & Learning */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Progress Cards Row */}
          <div className="grid sm:grid-cols-4 gap-4">
            
            {/* Learning Path */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Path Progress</span>
                <h3 className="text-3xl font-bold mt-2 font-heading">{stats?.overallProgress}%</h3>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-xs text-blue-400 font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>{stats?.completedTopics}/{stats?.totalTopics} topics done</span>
              </div>
              {/* Progress bar background indicator */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${stats?.overallProgress}%` }} />
            </div>

            {/* Study Hours Completed */}
            <div className="glass-card rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Study Hours</span>
                <h3 className="text-3xl font-bold mt-2 font-heading">{stats?.totalStudyHours || 0} hrs</h3>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-xs text-amber-400 font-semibold">
                <Clock className="h-4 w-4" />
                <span>Learning Hub Tracked</span>
              </div>
            </div>

            {/* DSA Solved */}
            <div className="glass-card rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">DSA Solved</span>
                <h3 className="text-3xl font-bold mt-2 font-heading">{stats?.dsaProblemsSolved}</h3>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-xs text-purple-400 font-semibold">
                <Code className="h-4 w-4" />
                <span>LeetCode & GFG Tracker</span>
              </div>
            </div>

            {/* Projects Built */}
            <div className="glass-card rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Projects Built</span>
                <h3 className="text-3xl font-bold mt-2 font-heading">{stats?.projectsBuilt}</h3>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-xs text-green-400 font-semibold">
                <FolderGit2 className="h-4 w-4" />
                <span>GitHub Repos Linked</span>
              </div>
            </div>

          </div>

          {/* Recommended Learning Widget */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-400" />
                <h2 className="text-xl font-bold font-heading">Recommended Next Steps</h2>
              </div>
              <span className="text-xs text-muted-foreground">Based on career profile</span>
            </div>

            <div className="space-y-4">
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl transition hover:border-white/10 gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {item.difficulty}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold">{item.title}</h4>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-xs text-muted-foreground space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.estimatedTime}</span>
                    </div>
                    <button className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5">
                      <span>Start</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column 2: Side Panels (Deadlines, Daily Checklist, Recent Activity) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Daily Targets Checklist */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold font-heading">Daily Checklist</h2>
              </div>
              <span className="text-xs text-muted-foreground">{dailyTasks.length} pending</span>
            </div>

            <div className="space-y-3">
              {dailyTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-2">All daily targets completed! 🎉</p>
              ) : (
                dailyTasks.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition gap-4"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(t._id, t.isCompleted)}
                        className="text-muted-foreground hover:text-white transition"
                      >
                        <Circle className="h-4.5 w-4.5 text-white/30" />
                      </button>
                      <span className="text-xs font-semibold truncate text-white/90">
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400 flex-shrink-0">+{t.xpReward} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-bold font-heading">Upcoming Deadlines</h2>
            </div>
            
            <div className="space-y-4">
              {deadlines.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 transition hover:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      {item.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.company}</span>
                  </div>
                  <h4 className="text-sm font-semibold leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Due: {formatDate(item.date)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-pink-400" />
              <h2 className="text-xl font-bold font-heading">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-white/95 leading-relaxed">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;
