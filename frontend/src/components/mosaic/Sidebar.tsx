import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  LayoutDashboard,
  Map,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  pendingTaskCount?: number;
  className?: string;
}

export function Sidebar({ pendingTaskCount = 0, className = '' }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      logout();
      toast.success('Successfully logged out.');
      navigate('/login');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-white/10 text-white font-semibold'
        : 'text-[var(--sidebar-text)] hover:text-white hover:bg-white/5'
    }`;

  const userTrack = user?.preferredCareer || 'Engineering Pathway';
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'EP';

  return (
    <aside
      className={`w-64 bg-[#101826] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-white/10 flex-shrink-0 select-none ${className}`}
    >
      {/* Top Region: Brand + Workspace Switcher + Nav Groups */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 pt-2">
          <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg text-white tracking-tight leading-none">
              Engineer<span className="text-teal-400">Path</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-1">
              MosaicMove OS
            </span>
          </div>
        </div>

        {/* Workspace Switcher Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between hover:bg-white/10 transition cursor-pointer">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 flex-shrink-0">
              <Compass className="h-4 w-4" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">{userTrack}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {user?.college || 'Engineering Student'}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </div>

        {/* WORKSPACE Nav Group */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 block mb-2">
            WORKSPACE
          </span>

          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={navLinkClass}>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-4.5 w-4.5 text-amber-400" />
                <span>Admin Control</span>
              </div>
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className="h-4.5 w-4.5 text-teal-400" />
                  <span>Dashboard</span>
                </div>
              </NavLink>

              <NavLink to="/roadmaps" className={navLinkClass}>
                <div className="flex items-center space-x-3">
                  <Map className="h-4.5 w-4.5 text-purple-400" />
                  <span>Roadmap</span>
                </div>
              </NavLink>

              <NavLink to="/resources" className={navLinkClass}>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4.5 w-4.5 text-blue-400" />
                  <span>Learning Hub</span>
                </div>
              </NavLink>

              <NavLink to="/planner" className={navLinkClass}>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4.5 w-4.5 text-amber-400" />
                  <span>Planner & Calendar</span>
                </div>
                {pendingTaskCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                    {pendingTaskCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/resume" className={navLinkClass}>
                <div className="flex items-center space-x-3">
                  <FileText className="h-4.5 w-4.5 text-pink-400" />
                  <span>Resume Analyzer</span>
                </div>
              </NavLink>
            </>
          )}
        </div>

        {/* SYSTEM Nav Group */}
        <div className="space-y-1 text-left pt-2 border-t border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 block mb-2">
            SYSTEM
          </span>

          <NavLink to="/settings" className={navLinkClass}>
            <div className="flex items-center space-x-3">
              <Settings className="h-4.5 w-4.5 text-slate-400" />
              <span>Settings & Profile</span>
            </div>
          </NavLink>
        </div>
      </div>

      {/* Bottom Region: User Profile Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Avatar Circle with Online Dot */}
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden border border-white/20">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#101826]" />
            </div>

            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate max-w-[110px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'Student'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
