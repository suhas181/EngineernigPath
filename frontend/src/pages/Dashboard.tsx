import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { calculateAiAccuracy } from '../utils/profileCompletion';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { StatCard } from '../components/mosaic/StatCard';
import { Badge } from '../components/mosaic/Badge';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  BookOpen,
  Target,
  CheckCircle2,
  Circle,
  Sparkles,
  Compass,
  FileText,
  AlertTriangle,
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
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const initDashboard = async () => {
    try {
      const [dashRes, tasksRes, statsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/productivity/tasks'),
        api.get('/productivity/stats'),
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.data.stats);
        setRecommendations(dashRes.data.data.recommendations || []);
        setDeadlines(dashRes.data.data.upcomingDeadlines || []);
        setActivities(dashRes.data.data.recentActivity || []);
      }

      setTasks(tasksRes.data.tasks || []);
      setUserStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to sync dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initDashboard();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, isCompleted: !currentStatus } : t))
    );

    try {
      await api.patch(`/productivity/tasks/${taskId}/toggle`, {
        isCompleted: !currentStatus,
      });
      toast.success(!currentStatus ? 'Task completed! +XP awarded' : 'Task status updated');
      initDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task.');
      initDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading Workspace Dashboard...</p>
        </div>
      </div>
    );
  }

  const aiAccuracy = calculateAiAccuracy(user);
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <MosaicShell pendingTaskCount={pendingTasksCount}>
      {/* Top Header Bar */}
      <TopHeader
        title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Student'} 👋`}
        subtitle={`${user?.preferredCareer || 'Engineering Pathway'} • ${user?.college || 'Workspace Active'}`}
        searchPlaceholder="Search roadmaps, topics, tasks..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        primaryActionLabel="Schedule Plan"
        onPrimaryAction={() => navigate('/planner')}
      />

      {/* Profile Setup Warning Banner if incomplete */}
      {aiAccuracy < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Profile Setup Incomplete ({aiAccuracy}% AI Accuracy)
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                Complete your target role & semester details for higher quality AI roadmap suggestions.
              </p>
            </div>
          </div>
          <Link
            to="/complete-profile"
            className="mosaic-btn-outline !py-1.5 !px-3.5 !text-xs !bg-amber-100 !border-amber-300 !text-amber-950 hover:!bg-amber-200 flex-shrink-0"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* ─── METRIC STAT CARDS GRID (Variants A, B, C) ────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Variant A: Dark Hero Card */}
        <StatCard
          variant="dark"
          icon={<Compass className="h-5 w-5" />}
          label="Roadmap Progress"
          value={`${stats?.overallProgress || 0}%`}
          subtitle={`${stats?.completedTopics || 0} of ${stats?.totalTopics || 0} topics completed`}
          trend={{ text: `🔥 ${userStats?.currentStreak || 1} Day Streak`, direction: 'up' }}
        />

        {/* Variant B: Tinted Alert Card */}
        <StatCard
          variant="alert"
          icon={<Calendar className="h-5 w-5" />}
          label="Upcoming Deadlines"
          value={deadlines.length}
          valueColor="#78350F"
          subtitle="Target milestones & exams"
          alertBullets={
            deadlines.length > 0
              ? deadlines.slice(0, 2).map((d) => `${d.title} (${d.company || 'Milestone'})`)
              : ['All upcoming milestones on track', 'Schedule new targets in Planner']
          }
          alertLinkText="Open Planner Calendar →"
          onAlertLinkClick={() => navigate('/planner')}
        />

        {/* Variant C: White Metric Card with Progress */}
        <StatCard
          variant="white"
          icon={<Target className="h-5 w-5 text-teal-600" />}
          label="DSA & Projects"
          value={`${stats?.dsaProblemsSolved || 0} Solved`}
          subtitle={`${stats?.projectsBuilt || 0} major projects completed`}
          progressPercent={Math.min(100, ((stats?.dsaProblemsSolved || 0) / 100) * 100)}
          progressColor="var(--brand)"
        />
      </div>

      {/* ─── MAIN CONTENT SPLIT VIEW ──────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 Cols): Recommendations & Target Tasks */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Recommended Learning Path Card */}
          <div className="mosaic-card p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    AI Recommended Learning Path
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Tailored topics for {user?.preferredCareer || 'Engineering Role'}
                  </p>
                </div>
              </div>

              <Link to="/roadmaps" className="text-xs font-bold text-teal-700 hover:underline flex items-center space-x-1">
                <span>View Full Roadmap</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {recommendations.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)] italic col-span-2 py-4 text-center">
                  No pending recommendations. Explore topics in Roadmap!
                </p>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-[var(--card-border)] bg-slate-50/50 hover:bg-slate-50 transition space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge tone="purple">{rec.category}</Badge>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{rec.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--ink-900)] pt-1">{rec.title}</h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-[var(--ink-muted)]">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{rec.estimatedTime}</span>
                      </span>
                      <Link
                        to="/roadmaps"
                        className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
                      >
                        Start Topic →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Tasks Checklist Card */}
          <div className="mosaic-card p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    Target Tasks & Checklists
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Earn XP and build consistency streaks
                  </p>
                </div>
              </div>

              <Link to="/planner" className="mosaic-btn-outline !py-1.5 !px-3 !text-xs">
                Manage All Tasks
              </Link>
            </div>

            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)] italic text-center py-4">
                  No tasks set for today. Add tasks in Planner!
                </p>
              ) : (
                tasks.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--card-border)] bg-white hover:border-teal-400/50 transition gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(t._id, t.isCompleted)}
                        className="text-slate-400 hover:text-teal-600 transition flex-shrink-0"
                      >
                        {t.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                      <span className={`text-xs font-semibold truncate ${t.isCompleted ? 'text-slate-400 line-through' : 'text-[var(--ink-900)]'}`}>
                        {t.title}
                      </span>
                    </div>

                    <Badge tone="warning">+{t.xpReward} XP</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Quick Actions & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="mosaic-card p-6 space-y-4 text-left">
            <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Link
                to="/resume"
                className="p-3 rounded-xl border border-[var(--card-border)] bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-pink-100 text-pink-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-900)] block">Analyze Resume ATS</span>
                    <span className="text-[10px] text-[var(--ink-muted)]">Upload & benchmark resume</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
              </Link>

              <Link
                to="/resources"
                className="p-3 rounded-xl border border-[var(--card-border)] bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-900)] block">Browse Learning Hub</span>
                    <span className="text-[10px] text-[var(--ink-muted)]">Curated courses & docs</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
              </Link>

              <Link
                to="/planner"
                className="p-3 rounded-xl border border-[var(--card-border)] bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-900)] block">Calendar Planner</span>
                    <span className="text-[10px] text-[var(--ink-muted)]">Schedule exam & target dates</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Timeline Card */}
          <div className="mosaic-card p-6 space-y-4 text-left">
            <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
              Recent Activity Log
            </h3>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)] italic text-center py-2">
                  No recent activities recorded.
                </p>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 border-l-2 border-teal-500 pl-3 py-1">
                    <div>
                      <p className="text-xs font-semibold text-[var(--ink-900)]">{act.description}</p>
                      <span className="text-[10px] text-[var(--ink-muted)]">{act.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </MosaicShell>
  );
}

export default Dashboard;
