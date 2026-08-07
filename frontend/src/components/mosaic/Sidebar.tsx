import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  LayoutDashboard,
  Map,
  BookOpen,
  FolderGit2,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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

  const userTrack = user?.preferredCareer || 'Software Engineer';
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'EP';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
    },
    {
      to: '/roadmaps',
      label: 'Learning Paths',
      icon: Map,
      color: 'text-purple-400',
    },
    {
      to: '/resources',
      label: 'Learning Hub',
      icon: BookOpen,
      color: 'text-teal-400',
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: FolderGit2,
      color: 'text-amber-400',
    },
    {
      to: '/resume',
      label: 'Resume Analyzer',
      icon: FileText,
      color: 'text-pink-400',
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-slate-400',
    },
  ];

  if (user?.role === 'admin') {
    navItems.unshift({
      to: '/admin',
      label: 'Admin Control',
      icon: ShieldCheck,
      color: 'text-amber-400',
    });
  }

  const sidebarContent = (
    <div
      className={`h-full flex flex-col justify-between bg-slate-950 text-slate-300 border-r border-slate-800/80 transition-all duration-300 select-none ${
        isCollapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      {/* Top Header Region: Logo & Expand/Collapse Toggle */}
      <div className="flex flex-col">
        {/* Compact Logo Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 overflow-hidden text-left"
            onClick={onCloseMobile}
          >
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex-shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-base text-white tracking-tight leading-none">
                  Engineer<span className="text-blue-400">Path</span>
                </h1>
                <span className="text-[10px] font-mono font-medium text-slate-400 block mt-1">
                  AI Career OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar (250px)' : 'Collapse Sidebar (Icons Only)'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5" />
            ) : (
              <PanelLeftClose className="h-4.5 w-4.5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Career Role Card (Only in Expanded Mode) */}
        {!isCollapsed && (
          <div className="p-3.5 mx-3 mt-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0 text-left">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate">{userTrack}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">Target Role</p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <div key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  onClick={onCloseMobile}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'px-3.5'
                  } py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : item.color
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="ml-3 font-medium text-left truncate">{item.label}</span>
                  )}
                </NavLink>

                {/* Collapsed Mode Tooltip */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 shadow-xl border border-slate-700 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            {/* User Avatar with Status Indicator */}
            <div className="relative flex-shrink-0 group">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden border border-slate-700">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />

              {/* Tooltip on Collapsed Mode Avatar */}
              {isCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 shadow-xl border border-slate-700 whitespace-nowrap z-50">
                  {user?.name || 'Student Profile'}
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {user?.role || 'Student'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Backdrop Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative z-10 w-72 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
