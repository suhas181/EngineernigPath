import React from 'react';
import { Navbar } from '../Navbar';
import Footer from '../Footer';

interface MosaicShellProps {
  children: React.ReactNode;
  pendingTaskCount?: number;
}

export function MosaicShell({ children }: MosaicShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--page-bg)] text-[var(--ink-900)] font-sans antialiased selection:bg-teal-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Expanded Main Canvas */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 w-full text-left transition-all duration-300">
        {children}
      </main>

      {/* Shared Application Footer */}
      <Footer />
    </div>
  );
}

export default MosaicShell;

