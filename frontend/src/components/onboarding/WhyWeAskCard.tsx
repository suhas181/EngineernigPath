import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const WhyWeAskCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/20 rounded-2xl p-4 sm:p-5 text-left space-y-3 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider font-heading">
            Why do we ask this?
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Used for AI recommendations</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-200">Personalized Roadmap</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-200">Company Eligibility</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-200">Internship Matching</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-200">Resume Analysis</span>
        </div>
      </div>
    </div>
  );
};
