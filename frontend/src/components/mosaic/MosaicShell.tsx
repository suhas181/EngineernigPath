import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MosaicShellProps {
  children: React.ReactNode;
  pendingTaskCount?: number;
}

export function MosaicShell({ children }: MosaicShellProps) {
  // Desktop Collapsed State (Default: true for icons-only collapsed mode)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('engineerpath_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  // Mobile Drawer Open State
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth < 768) {
        setIsMobileOpen((prev) => !prev);
      } else {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('toggle_sidebar', handleToggle);
    return () => window.removeEventListener('toggle_sidebar', handleToggle);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6F8] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.06),rgba(255,255,255,0))] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Component (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Mobile Header Bar (Only Visible on Mobile <768px) */}
        <header className="md:hidden h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              Engineer<span className="text-blue-400">Path</span>
            </span>
          </Link>

          <div className="w-8" />
        </header>

        {/* Expanded Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-10 max-w-[1600px] w-full mx-auto text-left transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MosaicShell;
