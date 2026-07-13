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
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
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
      const refreshToken = useAuthStore.getState().refreshToken;
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error('Logout API failed, logging out locally:', err);
    } finally {
      logout();
      toast.success('Successfully logged out.');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-1.5 text-xs sm:text-sm font-semibold transition px-3 py-1.5 rounded-lg border ${
      isActive
        ? 'text-white bg-white/10 border-white/10'
        : 'text-muted-foreground hover:text-white hover:bg-white/5 border-transparent'
    }`;

  return (
    <header className="glass-panel sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10">
      {/* Brand Logo */}
      <Link to="/dashboard" className="flex items-center space-x-2">
        <GraduationCap className="h-8 w-8 text-blue-500" />
        <span className="font-heading font-bold text-lg sm:text-2xl bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
          EngineerPath
        </span>
      </Link>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-2 mx-4">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </NavLink>
        <NavLink to="/roadmaps" className={navLinkClass}>
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">Roadmap</span>
        </NavLink>
        <NavLink to="/resources" className={navLinkClass}>
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Learning Hub</span>
        </NavLink>
        <NavLink to="/planner" className={navLinkClass}>
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Planner</span>
        </NavLink>
        <NavLink to="/resume" className={navLinkClass}>
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Resume Analyzer</span>
        </NavLink>
      </nav>
      
      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />
        </button>
        
        {/* User Card & Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3 pl-2 border-l border-white/10">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border border-white/15 bg-slate-800 flex items-center justify-center">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-semibold max-w-[80px] truncate">{user?.name}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                Lvl {level}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive transition rounded-full hover:bg-white/5"
            title="Logout"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
