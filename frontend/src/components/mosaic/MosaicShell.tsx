import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../Footer';
import ThemeToggle from '../ThemeToggle';

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
    <div className="flex min-h-screen bg-[var(--page-bg)] text-[var(--ink-900)] font-sans antialiased selection:bg-teal-600 selection:text-white transition-colors duration-200">
      {/* Sidebar Component (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen">
        {/* Mobile Header Bar (Only Visible on Mobile <768px) */}
        <header className="md:hidden h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              Engineer<span className="text-teal-400">Path</span>
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <ThemeToggle className="!p-1.5 !rounded-lg" />
          </div>
        </header>

        {/* Expanded Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-10 max-w-[1600px] w-full mx-auto text-left transition-all duration-300">
          {children}
        </main>

        {/* Shared Application Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default MosaicShell;
