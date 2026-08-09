import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  GraduationCap,
  Search,
  ChevronDown,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  selectedRole?: string;
  onSelectRole?: (role: string) => void;
}

export function DashboardHeader({
  onToggleSidebar,
  selectedRole,
  onSelectRole,
}: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const rolesList = [
    'Software Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'AI / ML Engineer',
    'Data Scientist / Analyst',
    'DevOps Engineer',
    'Mobile App Developer',
    'Cybersecurity Engineer',
  ];

  const userName = user?.name || 'Bharath CD';
  const userRole = user?.role === 'admin' ? 'Administrator' : 'Student';
  const currentRole = selectedRole || user?.preferredCareer || 'AI / ML Engineer';

  return (
    <header className="w-full bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl px-4 sm:px-6 py-3 shadow-sm flex items-center justify-between gap-4 mb-6 transition-all select-none">
      {/* Left: Sidebar Toggle + Brand Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-black text-lg text-slate-900 tracking-tight">
            Engineer<span className="text-purple-600">Path</span>
          </span>
        </div>
      </div>

      {/* Center: Search Bar + Target Role Dropdown */}
      <div className="hidden md:flex items-center space-x-3 flex-1 max-w-xl mx-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl pl-10 pr-12 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/70 border border-slate-300/60">
            ⌘ K
          </kbd>
        </div>

        {/* Target Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            <span>{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Target Career
              </div>
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    if (onSelectRole) onSelectRole(r);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-purple-50 transition-colors flex items-center justify-between cursor-pointer ${
                    r === currentRole ? 'text-purple-600 bg-purple-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {r === currentRole && <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle + Notification Bell + User Profile */}
      <div className="flex items-center space-x-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center space-x-1"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-purple-600" />
          ) : (
            <div className="flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <Moon className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
            3
          </span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2.5 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{userName}</div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">{userRole}</div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{userName}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.email || 'student@engineerpath.com'}
                </div>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  navigate('/roadmaps');
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                My Learning Path
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
