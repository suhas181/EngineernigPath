import React from 'react';
import { InternshipItem } from '../../services/internshipService';
import { X, MapPin, Globe, ExternalLink, Heart, Building2, Calendar, Clock, ShieldCheck, Sparkles, Briefcase } from 'lucide-react';

interface InternshipDetailModalProps {
  internship: InternshipItem | null;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
}

export const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  internship,
  isBookmarked,
  onClose,
  onToggleBookmark,
}) => {
  if (!internship) return null;

  const companyInitial = internship.company ? internship.company.charAt(0).toUpperCase() : 'C';

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left relative">
        {/* Top Sticky Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
          <div className="flex items-center space-x-4 min-w-0 pr-8">
            <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-[2px] shadow-lg shadow-purple-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-900 text-xl font-black text-white">
                {companyInitial}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  {internship.company}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  via {internship.source}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                {internship.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer bg-transparent border-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Key Quick Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>{internship.location || 'India'}</span>
            </div>

            {internship.remote ? (
              <div className="flex items-center space-x-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-bold text-indigo-700">
                <Globe className="h-4 w-4 text-indigo-600" />
                <span>Remote Work</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span>On-site / Hybrid</span>
              </div>
            )}

            <div className="flex items-center space-x-1.5 rounded-xl bg-purple-50 border border-purple-200/80 px-3 py-1.5 text-xs font-bold text-purple-700">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span>{internship.role}</span>
            </div>

            {internship.salary && (
              <div className="flex items-center space-x-1.5 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                <span>{internship.salary}</span>
              </div>
            )}
          </div>

          {/* Verification Status Banner */}
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Verified Opportunity
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Source status checked and confirmed active from {internship.source}.
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] font-semibold text-emerald-700">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Last verified: {formatDate(internship.lastCheckedAt)}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Role Overview & Description
            </h3>
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
              {internship.description || 'No detailed description available for this listing.'}
            </div>
          </div>

          {/* Required Skills Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Required Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-purple-50 border border-purple-200/80 px-3 py-1.5 text-xs font-bold text-purple-700 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Listing Timeline */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Published: {formatDate(internship.publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Category: {internship.role}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions Row */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <button
            onClick={() => onToggleBookmark(internship._id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
              isBookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{isBookmarked ? 'Saved to Bookmarks' : 'Save Internship'}</span>
          </button>

          <a
            href={internship.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 transition-all text-center"
          >
            <span>View Original Listing & Apply</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailModal;
