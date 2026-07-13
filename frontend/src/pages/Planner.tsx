import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  TrendingUp,
  Award,
  Flame,
  Check,
  Trash2,
  PlusCircle,
} from 'lucide-react';

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
  // Unused user state destruct removed to satisfy tsc compiler checks
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<PlannerEventItem[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Forms state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'weekly'>('daily');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

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
      toast.success('Task created successfully!');
      // Reload stats and analytics
      initData();
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('Failed to create task.');
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, isCompleted: !currentStatus } : t))
    );

    try {
      const res = await api.patch(`/productivity/tasks/${taskId}/toggle`, {
        isCompleted: !currentStatus,
      });

      // Synchronize stats & achievements
      setStats(res.data.task ? res.data.task : null); // fallback if structure differs
      
      if (res.data.xpGained !== 0) {
        toast.success(`Task status synced! XP: ${res.data.xpGained > 0 ? '+' : ''}${res.data.xpGained}`);
      }

      if (res.data.levelUp) {
        toast.success(`🎉 Level Up! You are now level ${res.data.task?.level || stats?.level || 2}!`, {
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
      initData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      toast.error('Failed to update task.');
      initData();
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventStart || !eventEnd) {
      toast.error('Please input schedule title, start and end time.');
      return;
    }

    try {
      const res = await api.post('/productivity/planner', {
        title: eventTitle,
        description: eventDesc,
        startTime: eventStart,
        endTime: eventEnd,
      });
      setEvents((prev) => [...prev, res.data.event]);
      setEventTitle('');
      setEventDesc('');
      setEventStart('');
      setEventEnd('');
      toast.success('Event scheduled!');
      initData();
    } catch (err: any) {
      console.error('Failed to schedule event:', err);
      const errMsg = err.response?.data?.message || 'Failed to schedule event.';
      toast.error(errMsg);
    }
  };

  const handleToggleEvent = async (eventId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setEvents((prev) =>
      prev.map((ev) => (ev._id === eventId ? { ...ev, isCompleted: !currentStatus } : ev))
    );

    try {
      await api.patch(`/productivity/planner/${eventId}/toggle`, {
        isCompleted: !currentStatus,
      });
      toast.success(!currentStatus ? 'Agenda slot checked off!' : 'Agenda slot unchecked');
      initData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle event.');
      initData();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.delete(`/productivity/planner/${eventId}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
      toast.success('Planner slot deleted.');
      initData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete planner event.');
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to map DB badge IDs to user friendly badges
  const getBadgeDetails = (badgeId: string) => {
    switch (badgeId) {
      case 'welcome_pioneer':
        return { name: 'Welcome Pioneer', desc: 'Signed up and verified profile.' };
      case 'task_starter':
        return { name: 'First Milestone', desc: 'Completed your first study task.' };
      case 'task_conqueror':
        return { name: 'Task Conqueror', desc: 'Completed 10 study tasks.' };
      case 'streak_3_days':
        return { name: 'Consistency Starter', desc: 'Maintained a 3-day active streak.' };
      case 'streak_7_days_hero':
        return { name: '7-Day Champion', desc: 'Unbroken week of career growth.' };
      case 'level_2_pioneer':
        return { name: 'Level 2 Ascendant', desc: 'Earned over 200 XP points.' };
      case 'level_5_master':
        return { name: 'Mentor Master', desc: 'Eearned over 1000 XP points.' };
      default:
        return { name: badgeId.replace(/_/g, ' ').toUpperCase(), desc: 'Awarded for consistency.' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading your planner...</p>
        </div>
      </div>
    );
  }

  // Segment tasks
  const dailyTasks = tasks.filter((t) => t.type === 'daily');
  const weeklyTasks = tasks.filter((t) => t.type === 'weekly');

  return (
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-8 text-left items-start">
        
        {/* Main Header Description */}
        <div className="lg:col-span-12 space-y-2">
          <h1 className="text-3xl font-bold font-heading">Study Planner & Productivity</h1>
          <p className="text-muted-foreground text-sm">
            Set study agendas, check off goals, earn XP to level up, and unlock achievements.
          </p>
        </div>

        {/* Level up Progression Panel (Left - col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* XP & Level Panel */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6 relative overflow-hidden bg-gradient-to-r from-blue-500/[0.02] to-transparent">
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="text-left">
                  <span className="text-muted-foreground text-xs font-semibold block uppercase">Current Status</span>
                  <h3 className="text-lg font-bold font-heading">Level {stats?.level}</h3>
                </div>
              </div>
              
              {/* Streak indicators */}
              <div className="flex items-center space-x-1 text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded-full text-xs font-bold">
                <Flame className="h-4 w-4 fill-orange-500/25" />
                <span>🔥 {stats?.currentStreak} Day Streak</span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>{stats ? stats.xp % 200 : 0} / 200 XP</span>
                <span className="text-muted-foreground">Next Level: {Math.max(0, 200 - (stats ? stats.xp % 200 : 0))} XP</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stats ? ((stats.xp % 200) / 200) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Productivity Aggregations Chart (Custom CSS Chart) */}
          {analytics && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold font-heading">Productivity Performance</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <span className="text-xs text-muted-foreground block mb-0.5">Tasks Done</span>
                  <span className="text-2xl font-bold font-heading">{analytics.tasksStats.completed}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <span className="text-xs text-muted-foreground block mb-0.5">Completion Rate</span>
                  <span className="text-2xl font-bold font-heading">{analytics.tasksStats.completionRate}%</span>
                </div>
              </div>

              {/* Weekly completion trend visual bar chart using CSS */}
              {analytics.weeklyTrend.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Output</h4>
                  <div className="flex justify-between items-end h-24 pt-4 border-b border-white/10 px-1 gap-2">
                    {analytics.weeklyTrend.map((day) => {
                      const maxCount = Math.max(...analytics.weeklyTrend.map((d) => d.completedCount), 1);
                      const barPercent = Math.min(100, Math.round((day.completedCount / maxCount) * 100));
                      return (
                        <div key={day._id} className="flex flex-col items-center flex-1 group relative">
                          {/* Tooltip */}
                          <span className="absolute -top-6 text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition duration-200">
                            {day.completedCount}
                          </span>
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-sm group-hover:opacity-90 transition duration-300"
                            style={{ height: `${Math.max(10, barPercent)}%` }}
                          />
                          <span className="text-[9px] text-muted-foreground font-semibold mt-1">
                            {formatDate(day._id).split(' ')[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Badges Earned cabinet */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold font-heading flex items-center space-x-2">
              <Award className="h-5 w-5 text-indigo-400" />
              <span>Cabinet Achievements</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {stats?.badges.map((b) => {
                const details = getBadgeDetails(b.badgeId);
                return (
                  <div
                    key={b.badgeId}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-2 group hover:border-white/10 transition relative cursor-default"
                  >
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner text-lg">
                      🥇
                    </div>
                    <div>
                      <h5 className="text-xs font-bold truncate">{details.name}</h5>
                      <p className="text-[9px] text-muted-foreground truncate">{details.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Management Panel (Center - col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold font-heading flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Target Checklist</span>
            </h3>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="space-y-3">
              <input
                type="text"
                placeholder="Set a new target..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-xs focus:outline-none text-white focus:border-blue-500"
                >
                  <option value="daily">Daily Task</option>
                  <option value="weekly">Weekly Goal</option>
                </select>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-xs focus:outline-none text-white focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:opacity-90 transition text-primary-foreground font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Checklist Item</span>
              </button>
            </form>

            {/* Daily checklists list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily Checklist</h4>
              {dailyTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-2">No daily tasks scheduled</p>
              ) : (
                <div className="space-y-2">
                  {dailyTasks.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition gap-4"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleTask(t._id, t.isCompleted)}
                          className="text-muted-foreground hover:text-white transition"
                        >
                          {t.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/10" />
                          ) : (
                            <Circle className="h-5 w-5 text-white/30" />
                          )}
                        </button>
                        <span className={`text-xs font-semibold truncate ${t.isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 flex-shrink-0">+{t.xpReward} XP</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Weekly goals list */}
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2">Weekly Milestones</h4>
              {weeklyTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-2">No weekly goals set</p>
              ) : (
                <div className="space-y-2">
                  {weeklyTasks.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition gap-4"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleTask(t._id, t.isCompleted)}
                          className="text-muted-foreground hover:text-white transition"
                        >
                          {t.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/10" />
                          ) : (
                            <Circle className="h-5 w-5 text-white/30" />
                          )}
                        </button>
                        <div className="min-w-0 text-left">
                          <span className={`text-xs font-semibold block truncate ${t.isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                            {t.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground">Due: {formatDate(t.dueDate)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 flex-shrink-0">+{t.xpReward} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Study Planner / Calendar (Right - col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold font-heading flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span>Study Planner Agenda</span>
            </h3>

            {/* Event Schedule Form */}
            <form onSubmit={handleAddEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Study session title..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-white"
              />
              <input
                type="text"
                placeholder="Description/notes (optional)"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground uppercase font-semibold">Starts At</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground uppercase font-semibold">Ends At</label>
                  <input
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:opacity-90 transition text-primary-foreground font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Schedule Session</span>
              </button>
            </form>

            {/* Agenda Timeline List */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled Slots</h4>
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-2">No planned study sessions</p>
              ) : (
                <div className="relative border-l border-white/10 ml-2 pl-4 space-y-4">
                  {events.map((ev) => (
                    <div key={ev._id} className="relative group text-left">
                      {/* Timeline circle node */}
                      <button
                        onClick={() => handleToggleEvent(ev._id, ev.isCompleted)}
                        className={`absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 transition bg-background ${
                          ev.isCompleted
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-white/20 group-hover:border-white/40'
                        }`}
                        title={ev.isCompleted ? 'Mark slot incomplete' : 'Mark slot complete'}
                      >
                        {ev.isCompleted && <Check className="h-2 w-2 text-emerald-400 mx-auto" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${ev.isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                            {ev.title}
                          </h5>
                          <button
                            onClick={() => handleDeleteEvent(ev._id)}
                            className="opacity-0 group-hover:opacity-100 transition p-1 text-muted-foreground hover:text-rose-500"
                            title="Cancel schedule slot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDate(ev.startTime)} • {formatTime(ev.startTime)} - {formatTime(ev.endTime)}
                          </span>
                        </p>
                        {ev.description && !ev.isCompleted && (
                          <p className="text-[10px] text-white/70 leading-relaxed bg-white/5 border border-white/5 p-2 rounded-lg mt-1">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Planner;
