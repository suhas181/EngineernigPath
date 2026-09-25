import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import {
  GraduationCap,
  LogOut,
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
  Menu,
  X,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [level, setLevel] = useState<number>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
        ? 'nav-link-active font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 text-sm font-medium transition-all px-3.5 py-2.5 rounded-xl ${
      isActive
        ? 'nav-link-active font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
    }`;

  return (
    <div className="sticky top-3 z-50 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      <header className="eterna-nav-pill px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-full shadow-sm">
        {/* Brand Logo with Conic Gradient Ring */}
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-3">
          <div className="relative p-[2px] rounded-full bg-[var(--gradient-signature)] flex items-center justify-center">
            <div className="bg-slate-950 p-1.5 rounded-full">
              <GraduationCap className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <span className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
            Engineer<span className="text-gradient">Path</span>
          </span>
        </Link>

        {/* Navigation Tabs (Desktop md and up) */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={navLinkClass}>
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>Admin Dashboard</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                <span className="hidden md:inline">Dashboard</span>
              </NavLink>
              <NavLink to="/roadmaps" className={navLinkClass}>
                <Map className="h-4 w-4 text-purple-500" />
                <span className="hidden md:inline">Learning Platform</span>
              </NavLink>
              <NavLink to="/resources" className={navLinkClass}>
                <BookOpen className="h-4 w-4 text-pink-500" />
                <span className="hidden md:inline">Learning Hub</span>
              </NavLink>
              <NavLink to="/internships" className={navLinkClass}>
                <Briefcase className="h-4 w-4 text-cyan-500" />
                <span className="hidden md:inline">Internships</span>
              </NavLink>
              <NavLink to="/planner" className={navLinkClass}>
                <Calendar className="h-4 w-4 text-amber-500" />
                <span className="hidden md:inline">Planner</span>
              </NavLink>
              <NavLink to="/resume" className={navLinkClass}>
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="hidden md:inline">Resume</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationDropdown />

              {/* User Card & Settings (Desktop) */}
              <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Edit Profile & Settings"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-semibold max-w-[80px] truncate text-slate-900 dark:text-white">{user?.name}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
                        Lvl {level}
                      </span>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                {/* Solid Primary Pill Logout Button */}
                <button
                  onClick={handleLogout}
                  className="eterna-btn-primary !py-1.5 !px-3 !text-xs shadow-sm flex items-center space-x-1 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

          {/* Hamburger Menu Toggle Button (Mobile) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu (below md breakpoint) */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-2xl shadow-xl space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {user?.role === 'admin' ? (
            <NavLink
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>Admin Dashboard</span>
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/roadmaps"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Map className="h-4 w-4 text-purple-500" />
                <span>Learning Platform</span>
              </NavLink>
              <NavLink
                to="/resources"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <BookOpen className="h-4 w-4 text-pink-500" />
                <span>Learning Hub</span>
              </NavLink>
              <NavLink
                to="/internships"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Briefcase className="h-4 w-4 text-cyan-500" />
                <span>Internships</span>
              </NavLink>
              <NavLink
                to="/planner"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Calendar className="h-4 w-4 text-amber-500" />
                <span>Planner</span>
              </NavLink>
              <NavLink
                to="/resume"
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Resume</span>
              </NavLink>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-800 !my-2.5 pt-2" />

          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-left"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">{user?.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
                      Lvl {level}
                    </span>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Profile Settings"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full eterna-btn-primary !py-2 !px-3 !text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-1">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full eterna-btn-primary !py-2 !px-3.5 !text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
