import React from 'react';
import { Sidebar } from './Sidebar';

interface MosaicShellProps {
  children: React.ReactNode;
  pendingTaskCount?: number;
}

export function MosaicShell({ children, pendingTaskCount = 0 }: MosaicShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--page-bg)] text-[var(--ink-700)] font-sans antialiased">
      {/* Left Persistent Navy Sidebar */}
      <Sidebar pendingTaskCount={pendingTaskCount} />

      {/* Right Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto text-left">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MosaicShell;
