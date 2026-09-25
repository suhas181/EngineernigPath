import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  adminService,
  AdminUserItem,
  AdminStats,
  AdminNotificationItem,
} from '../services/adminService';
import toast from 'react-hot-toast';
import {
  Users,
  UserPlus,
  RefreshCw,
  Eye,
  X,
  GraduationCap,
  Bell,
  Send,
  Trash2,
  Sparkles,
  Briefcase,
  BookOpen,
  Trophy,
} from 'lucide-react';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { StatCard } from '../components/mosaic/StatCard';
import { Badge } from '../components/mosaic/Badge';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'notifications'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Add User Form State
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'admin',
    college: '',
    branch: '',
    preferredCareer: '',
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Broadcast Notification Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'system_announcement' as AdminNotificationItem['type'],
    link: '/resources',
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, notifsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({
          search: searchQuery,
          role: roleFilter,
          isVerified: verifiedFilter,
        }),
        adminService.getNotifications(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (notifsRes.success) setNotifications(notifsRes.notifications || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load admin management records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, verifiedFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserForm.name || !addUserForm.email || !addUserForm.password) {
      toast.error('Name, email, and password are required.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await adminService.createUser(addUserForm);
      if (res.success) {
        toast.success(`User ${res.user.name} created successfully!`);
        setIsAddUserOpen(false);
        setAddUserForm({
          name: '',
          email: '',
          password: '',
          role: 'student',
          college: '',
          branch: '',
          preferredCareer: '',
        });
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error('Notification title and message are required.');
      return;
    }

    setIsBroadcasting(true);
    try {
      const res = await adminService.broadcastNotification(broadcastForm);
      if (res.success) {
        toast.success('Notification broadcasted to all students successfully! 🎉');
        setBroadcastForm({
          title: '',
          message: '',
          type: 'system_announcement',
          link: '/resources',
        });
        const updatedNotifs = await adminService.getNotifications();
        if (updatedNotifs.success) {
          setNotifications(updatedNotifs.notifications || []);
        }
      }
    } catch (err: any) {
      console.error('Broadcast failed:', err);
      toast.error(err.response?.data?.message || 'Failed to broadcast notification.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast notification?')) {
      return;
    }

    try {
      const res = await adminService.deleteNotification(id);
      if (res.success) {
        toast.success('Notification deleted.');
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err: any) {
      console.error('Delete notification failed:', err);
      toast.error('Failed to delete notification.');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'ai_suggestion':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'internship_alert':
        return <Briefcase className="w-4 h-4 text-cyan-600" />;
      case 'learning_resource':
        return <BookOpen className="w-4 h-4 text-pink-600" />;
      case 'milestone':
        return <Trophy className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotifBadgeColor = (type: string) => {
    switch (type) {
      case 'ai_suggestion':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'internship_alert':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'learning_resource':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'milestone':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <MosaicShell>
      <TopHeader
        title={activeTab === 'users' ? 'Admin Control & User Directory' : 'Student Notification Broadcaster'}
        subtitle={`System Administrator • Logged in as ${user?.name}`}
        searchPlaceholder={activeTab === 'users' ? 'Search users by name, email, or college...' : undefined}
        searchValue={activeTab === 'users' ? searchQuery : undefined}
        onSearchChange={activeTab === 'users' ? (v) => setSearchQuery(v) : undefined}
        primaryActionLabel={activeTab === 'users' ? 'Add New User' : undefined}
        onPrimaryAction={activeTab === 'users' ? () => setIsAddUserOpen(true) : undefined}
        primaryActionIcon={activeTab === 'users' ? <UserPlus className="h-4 w-4" /> : undefined}
      />

      {/* Admin Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 text-left">
        <StatCard
          variant="white"
          icon={<Users className="h-5 w-5 text-teal-600" />}
          label="Total Users"
          value={stats?.totalUsers || 0}
          subtitle="Registered accounts"
        />
        <StatCard
          variant="white"
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Students"
          value={stats?.studentCount || 0}
          subtitle="Active student profiles"
        />
        <StatCard
          variant="white"
          icon={<Bell className="h-5 w-5 text-purple-600" />}
          label="Active Broadcasts"
          value={notifications.length}
          subtitle="Broadcast notifications"
        />
        <StatCard
          variant="white"
          icon={<GraduationCap className="h-5 w-5 text-emerald-600" />}
          label="Verified Profiles"
          value={stats?.verifiedCount || 0}
          subtitle="Completed onboarding"
        />
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-2 text-left">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'notifications'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Broadcaster</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
            {notifications.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: USER DIRECTORY
         ======================================================== */}
      {activeTab === 'users' ? (
        <div className="mosaic-card p-6 space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                User Directory ({users.length})
              </h3>
              <button
                onClick={loadData}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                title="Refresh List"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-[var(--card-border)] rounded-full px-3 py-1.5 text-xs text-[var(--ink-900)] font-semibold"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="bg-white border border-[var(--card-border)] rounded-full px-3 py-1.5 text-xs text-[var(--ink-900)] font-semibold"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">College & Branch</th>
                  <th className="py-3 px-4">Career Track</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No users match the active filter criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const idKey = u._id || u.id || u.email;
                    return (
                      <tr key={idKey} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge tone={u.role === 'admin' ? 'purple' : 'brand'}>
                            {u.role.toUpperCase()}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <p className="font-medium truncate max-w-[180px]">{u.college || '—'}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{u.branch || '—'}</p>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <span className="font-semibold">{u.preferredCareer || '—'}</span>
                        </td>

                        <td className="py-3 px-4">
                          <Badge tone={u.isVerified ? 'success' : 'warning'}>
                            {u.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="mosaic-btn-outline !py-1 !px-2.5 !text-[11px] inline-flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================
            TAB 2: NOTIFICATION BROADCASTER
           ======================================================== */
        <div className="space-y-6 text-left">
          {/* Broadcaster Composer Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 mosaic-card p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Send className="w-4 h-4 text-purple-600" />
                  <span>Compose Broadcast Alert</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Deliver high-priority announcements and smart feature nudges directly to all registered students.
                </p>
              </div>

              <form onSubmit={handleBroadcastNotification} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Notification Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🤖 New AI Resume ATS Optimization Live!"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Notification Category
                    </label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          type: e.target.value as AdminNotificationItem['type'],
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="system_announcement">📢 System Announcement</option>
                      <option value="ai_suggestion">🤖 AI Feature / Mentorship Tip</option>
                      <option value="internship_alert">💼 Internship / Opportunity Alert</option>
                      <option value="learning_resource">📖 Learning Hub Resource</option>
                      <option value="milestone">🏆 Milestone / Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target App Route
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /resume or /resources"
                      value={broadcastForm.link}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                {/* Quick Shortcuts for Route */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold">Quick Link:</span>
                  {[
                    { label: 'Resume Analyzer', route: '/resume' },
                    { label: 'Learning Hub', route: '/resources' },
                    { label: 'Internships', route: '/internships' },
                    { label: 'Roadmaps', route: '/roadmaps' },
                    { label: 'Planner', route: '/planner' },
                  ].map((s) => (
                    <button
                      key={s.route}
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, link: s.route })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        broadcastForm.link === s.route
                          ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {s.label} ({s.route})
                    </button>
                  ))}
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Notification Message / Body *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Benchmark your resume against top tech employers and get actionable suggestions to boost your ATS score."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBroadcasting ? 'Broadcasting to Students...' : 'Broadcast to All Students'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 mosaic-card p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <span>Student View Live Preview</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How this alert appears in the student's navbar bell dropdown:
                </p>
              </div>

              {/* Mock Floating Bell Dropdown Item */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-purple-600">🔔 Student Navbar Flyout</span>
                  <span>Just now</span>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0">
                    {getNotifIcon(broadcastForm.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                      {broadcastForm.title || 'Notification Title Preview'}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {broadcastForm.message || 'Notification message description will be displayed here in full clarity for students.'}
                    </p>
                    {broadcastForm.link && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        Explore {broadcastForm.link} →
                      </span>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-100 dark:border-slate-800">
                  Clicking marks the alert as read and navigates to the target page.
                </div>
              </div>
            </div>
          </div>

          {/* Broadcasted Notifications History */}
          <div className="mosaic-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Broadcasted Notifications ({notifications.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  History of broadcast announcements, active delivery status, and student read rates.
                </p>
              </div>
              <button
                onClick={loadData}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                title="Refresh Broadcasts"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Notification Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Date Sent</th>
                    <th className="py-3 px-4">Read Rate</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No broadcast notifications created yet.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-start space-x-2.5">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                              {getNotifIcon(n.type)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getNotifBadgeColor(
                              n.type
                            )}`}
                          >
                            {n.type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {n.link || '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {n.readCount} read
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteNotification(n.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="mosaic-card max-w-lg w-full p-6 space-y-4 text-left bg-white relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">User Profile Inspector</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Full Name</span>
                  <span className="font-bold text-slate-900">{selectedUser.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Email</span>
                  <span className="font-bold text-slate-900">{selectedUser.email}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Career & Academic Info</span>
                <p className="text-slate-800">
                  <strong>Track:</strong> {selectedUser.preferredCareer || 'N/A'} • <strong>College:</strong> {selectedUser.college || 'N/A'}
                </p>
                <p className="text-slate-800">
                  <strong>Branch:</strong> {selectedUser.branch || 'N/A'} • <strong>Graduation:</strong> {selectedUser.graduationYear || 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setSelectedUser(null)} className="mosaic-btn-outline !py-1.5 !px-4 !text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="mosaic-card max-w-md w-full p-6 space-y-4 text-left bg-white relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">Add User Account</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={addUserForm.name}
                  onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@university.edu"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addUserForm.password}
                  onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">User Role</label>
                <select
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="mosaic-btn-outline !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="mosaic-btn-brand !py-2 !px-5"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MosaicShell>
  );
}

export default AdminDashboard;
