import React from 'react';
import { InternshipItem } from '../../services/internshipService';
import { MapPin, Globe, ExternalLink, Heart, Sparkles, Building2, Clock } from 'lucide-react';

interface InternshipCardProps {
  internship: InternshipItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelect: (internship: InternshipItem) => void;
  recommendationReason?: string;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  recommendationReason,
}) => {
  const companyInitial = internship.company ? internship.company.charAt(0).toUpperCase() : 'C';

  // Format posted date relative
  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return 'Recently listed';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 30) return `Posted ${diffDays} days ago`;
    return `Posted on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Format last checked relative
  const formatLastChecked = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Checked < 1h ago';
    if (diffHours === 1) return 'Checked 1h ago';
    if (diffHours < 24) return `Checked ${diffHours}h ago`;
    return `Checked ${Math.floor(diffHours / 24)}d ago`;
  };

  // Render truthful status indicator
  const renderStatusBadge = () => {
    if (internship.status === 'OPEN') {
      return (
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
            Active Opportunity
          </span>
        </div>
      );
    }
    if (internship.status === 'CLOSED') {
      return (
        <div className="flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Posting Concluded
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Status Unverified
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect(internship)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-xl cursor-pointer text-left"
    >
      {/* Top Row: Company Logo Avatar, Name, and Bookmark Toggle */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Company Avatar Ring */}
            <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-[2px] shadow-md shadow-purple-500/10">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-900 text-sm font-black text-white">
                {companyInitial}
              </div>
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 truncate">
                  {internship.company}
                </p>
                <span className="inline-block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {internship.source}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1 mt-0.5">
                {internship.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Heart Action */}
          <button
            onClick={(e) => onToggleBookmark(internship._id, e)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 text-rose-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800/40'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Internship'}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Recommendation Tag Banner (if matched with profile) */}
        {recommendationReason && (
          <div className="mt-3 inline-flex items-center space-x-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{recommendationReason}</span>
          </div>
        )}

        {/* Meta Info Badges: Location, Remote, Salary, Employment Type */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {/* Location Badge */}
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            <span className="truncate max-w-[140px]">{internship.location || 'India'}</span>
          </span>

          {/* Remote / Work Mode Badge */}
          {internship.remote ? (
            <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <Globe className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              <span>Remote</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <Building2 className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              <span>On-site / Hybrid</span>
            </span>
          )}

          {/* Employment Type if specified */}
          {internship.employmentType && internship.employmentType !== 'Internship' && (
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              {internship.employmentType}
            </span>
          )}

          {/* Salary Badge if available */}
          {internship.salary && (
            <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
              {internship.salary}
            </span>
          )}
        </div>

        {/* Skill Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {internship.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="rounded-md bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300"
            >
              {skill}
            </span>
          ))}
          {internship.skills.length > 4 && (
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              +{internship.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Truthful Status, Posted Date, and Primary Apply Button */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="text-left">
          {renderStatusBadge()}

          <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>{formatPostedDate(internship.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {formatLastChecked(internship.lastCheckedAt)}
            </span>
          </div>
        </div>

        {/* Primary CTA Apply Button */}
        <a
          href={internship.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all"
        >
          <span>View & Apply</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

export default InternshipCard;
