import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  TrendingUp,
  Award,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import { CalendarPlannerSection } from '../components/planner/CalendarPlannerSection';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { Badge } from '../components/mosaic/Badge';

interface TaskItem {
  _id: string;
  title: string;
  type: 'daily' | 'weekly';
  dueDate: string;
  isCompleted: boolean;
  xpReward: number;
}

interface PlannerEventItem {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface UserStatsData {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: Array<{ badgeId: string; earnedAt: string }>;
}

interface AnalyticsData {
  tasksStats: {
    total: number;
    completed: number;
    completionRate: number;
  };
  weeklyTrend: Array<{ _id: string; completedCount: number }>;
}

export function Planner() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<PlannerEventItem[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'calendar' | 'checklist'>('calendar');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'weekly'>('daily');
  const [taskDueDate, setTaskDueDate] = useState('');

  const initData = async () => {
    try {
      const [tasksRes, eventsRes, statsRes, analyticsRes] = await Promise.all([
        api.get('/productivity/tasks'),
        api.get('/productivity/planner'),
        api.get('/productivity/stats'),
        api.get('/productivity/analytics'),
      ]);

      setTasks(tasksRes.data.tasks);
      setEvents(eventsRes.data.events);
      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load planner data:', err);
      toast.error('Failed to load productivity metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) {
      toast.error('Please input task title and due date.');
      return;
    }

    try {
      const res = await api.post('/productivity/tasks', {
        title: taskTitle,
        type: taskType,
        dueDate: taskDueDate,
      });
      setTasks((prev) => [...prev, res.data.task]);
      setTaskTitle('');
      setTaskDueDate('');
      toast.success('Checklist item created!');
      initData();
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('Failed to create task.');
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, isCompleted: !currentStatus } : t))
    );

    try {
      const res = await api.patch(`/productivity/tasks/${taskId}/toggle`, {
        isCompleted: !currentStatus,
      });

      if (res.data.xpGained !== 0) {
        toast.success(`Task status synced! XP: ${res.data.xpGained > 0 ? '+' : ''}${res.data.xpGained}`);
      }

      if (res.data.levelUp) {
        toast.success(`🎉 Level Up! You are now level ${res.data.task?.level || stats?.level || 2}!`, {
          duration: 6000,
        });
      }

      initData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      toast.error('Failed to update task.');
      initData();
    }
  };

  const handleAddEvent = async (eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      const res = await api.post('/productivity/planner', eventData);
      setEvents((prev) => [...prev, res.data.event]);
      toast.success('Important plan scheduled successfully!');
      initData();
    } catch (err: any) {
      console.error('Failed to schedule plan:', err);
      const errMsg = err.response?.data?.message || 'Failed to schedule plan.';
      toast.error(errMsg);
      throw err;
    }
  };

  const handleToggleEvent = async (eventId: string, currentStatus: boolean) => {
    setEvents((prev) =>
      prev.map((ev) => (ev._id === eventId ? { ...ev, isCompleted: !currentStatus } : ev))
    );

    try {
      await api.patch(`/productivity/planner/${eventId}/toggle`, {
        isCompleted: !currentStatus,
      });
      toast.success(!currentStatus ? 'Plan marked completed! 🎉' : 'Plan marked incomplete');
      initData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update plan status.');
      initData();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.delete(`/productivity/planner/${eventId}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
      toast.success('Plan deleted successfully.');
      initData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete plan.');
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading Calendar Planner...</p>
        </div>
      </div>
    );
  }

  const dailyTasks = tasks.filter((t) => t.type === 'daily');
  const weeklyTasks = tasks.filter((t) => t.type === 'weekly');
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

  return (
    <MosaicShell pendingTaskCount={pendingTasksCount}>
      <TopHeader
        title="Calendar Planner & Task Hub"
        subtitle="Schedule milestones, manage target checklists, and track streak analytics"
      >
        <div className="flex bg-white p-1 rounded-full border border-[var(--card-border)] shadow-sm">
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition ${
              activeView === 'calendar'
                ? 'bg-[#101826] text-white shadow-sm'
                : 'text-[var(--ink-muted)] hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Calendar View</span>
          </button>

          <button
            onClick={() => setActiveView('checklist')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition ${
              activeView === 'checklist'
                ? 'bg-[#101826] text-white shadow-sm'
                : 'text-[var(--ink-muted)] hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Checklist & Stats</span>
          </button>
        </div>
      </TopHeader>

      {activeView === 'calendar' ? (
        <CalendarPlannerSection
          events={events}
          onAddEvent={handleAddEvent}
          onToggleEvent={handleToggleEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Left Column (4 Cols): XP Level & Productivity Output */}
          <div className="lg:col-span-4 space-y-6">
            <div className="mosaic-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Current Status</span>
                    <h3 className="text-base font-bold text-[var(--ink-900)]">Level {stats?.level}</h3>
                  </div>
                </div>

                <Badge tone="warning">
                  <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{stats?.currentStreak} Day Streak</span>
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{stats ? stats.xp % 200 : 0} / 200 XP</span>
                  <span className="text-slate-400">Next Level: {Math.max(0, 200 - (stats ? stats.xp % 200 : 0))} XP</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats ? ((stats.xp % 200) / 200) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Productivity Performance Output */}
            {analytics && (
              <div className="mosaic-card p-6 space-y-5">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    Productivity Performance
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-xs text-slate-500 block">Tasks Done</span>
                    <span className="text-2xl font-extrabold text-slate-900">{analytics.tasksStats.completed}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-xs text-slate-500 block">Completion Rate</span>
                    <span className="text-2xl font-extrabold text-emerald-600">{analytics.tasksStats.completionRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (8 Cols): Task Checklist Panel */}
          <div className="lg:col-span-8 mosaic-card p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-[var(--ink-900)] font-heading">
                Target Checklists & Goals
              </h3>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3">
              <input
                type="text"
                placeholder="Set a new daily task or weekly target..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="daily">Daily Task (+10 XP)</option>
                  <option value="weekly">Weekly Target (+30 XP)</option>
                </select>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <button type="submit" className="w-full mosaic-btn-primary !py-2.5 !text-xs">
                <Plus className="h-4 w-4" />
                <span>Add Checklist Item</span>
              </button>
            </form>

            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Daily Targets ({dailyTasks.length})
                </h4>
                {dailyTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No daily targets pending.</p>
                ) : (
                  dailyTasks.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl gap-3"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
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
                        <span className={`text-xs font-semibold truncate ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {t.title}
                        </span>
                      </div>
                      <Badge tone="warning">+{t.xpReward} XP</Badge>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Weekly Goals ({weeklyTasks.length})
                </h4>
                {weeklyTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No weekly goals set.</p>
                ) : (
                  weeklyTasks.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl gap-3"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
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
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block truncate ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {t.title}
                          </span>
                          <span className="text-[9px] text-slate-500">Due: {formatDate(t.dueDate)}</span>
                        </div>
                      </div>
                      <Badge tone="warning">+{t.xpReward} XP</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </MosaicShell>
  );
}

export default Planner;
