import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  LogOut,
  Bell,
  User,
  LayoutDashboard,
  Map,
  BookOpen,
  Calendar,
  FileText,
  Briefcase,
  Settings,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [level, setLevel] = useState<number>(1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/productivity/stats');
        if (res.data && res.data.stats) {
          setLevel(res.data.stats.level);
        }
      } catch (err) {
        console.error('Navbar stats fetch error:', err);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed, logging out locally:', err);
    } finally {
      logout();
      toast.success('Successfully logged out.');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-1.5 text-xs sm:text-sm font-medium transition-all px-3 py-1.5 rounded-full ${
      isActive
        ? 'nav-link-active font-semibold text-slate-900'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="sticky top-3 z-50 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      <header className="eterna-nav-pill px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300">
        {/* Brand Logo with Conic Gradient Ring */}
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-3">
          <div className="relative p-[2px] rounded-full bg-[var(--gradient-signature)] flex items-center justify-center">
            <div className="bg-slate-950 p-1.5 rounded-full">
              <GraduationCap className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <span className="font-heading font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
            Engineer<span className="text-gradient">Path</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Admin Dashboard</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                <span className="hidden md:inline">Dashboard</span>
              </NavLink>
              <NavLink to="/roadmaps" className={navLinkClass}>
                <Map className="h-4 w-4 text-purple-600" />
                <span className="hidden md:inline">Learning Platform</span>
              </NavLink>
              <NavLink to="/resources" className={navLinkClass}>
                <BookOpen className="h-4 w-4 text-pink-600" />
                <span className="hidden md:inline">Learning Hub</span>
              </NavLink>
              <NavLink to="/internships" className={navLinkClass}>
                <Briefcase className="h-4 w-4 text-cyan-600" />
                <span className="hidden md:inline">Internships</span>
              </NavLink>
              <NavLink to="/planner" className={navLinkClass}>
                <Calendar className="h-4 w-4 text-amber-600" />
                <span className="hidden md:inline">Planner</span>
              </NavLink>
              <NavLink to="/resume" className={navLinkClass}>
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="hidden md:inline">Resume</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 text-slate-500 hover:text-slate-900 transition rounded-full hover:bg-slate-100">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600" />
              </button>

              {/* User Card & Settings */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition"
                  title="Edit Profile & Settings"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-600" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-semibold max-w-[80px] truncate text-slate-900">{user?.name}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full">
                        Lvl {level}
                      </span>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="p-1.5 text-slate-500 hover:text-slate-900 transition rounded-full hover:bg-slate-100"
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                {/* Solid Primary Pill Logout Button */}
                <button
                  onClick={handleLogout}
                  className="eterna-btn-primary !py-1.5 !px-3 !text-xs shadow-sm flex items-center space-x-1"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="eterna-btn-primary !py-1.5 !px-3.5 !text-xs shadow-sm flex items-center space-x-1 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default Navbar;
