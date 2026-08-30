import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import Sidebar from '../components/mosaic/Sidebar';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthModalStore } from '../store/useAuthModalStore';
import internshipService, {
  InternshipItem,
  InternshipStats,
  RecommendedItem,
} from '../services/internshipService';
import InternshipCard from '../components/internships/InternshipCard';
import InternshipDetailModal from '../components/internships/InternshipDetailModal';
import toast from 'react-hot-toast';
import {
  Search,
  Briefcase,
  Globe,
  Building,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';

const ROLES = [
  'All',
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Engineer',
  'Data Analyst',
  'DevOps Engineer',
  'Mobile Developer',
  'Cybersecurity Engineer',
];

const LOCATIONS = [
  'All',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Mumbai',
  'Delhi',
  'Remote',
];

const POPULAR_SKILLS = [
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'AWS',
  'Docker',
];

export function Internships() {
  const { user, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [stats, setStats] = useState<InternshipStats | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [backendRecommendations, setBackendRecommendations] = useState<RecommendedItem[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<InternshipItem | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [workMode, setWorkMode] = useState<'All' | 'Remote' | 'Onsite'>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);

  // Fetch internships from API
  const fetchListings = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await internshipService.getInternships({
        search: searchQuery,
        role: selectedRole,
        location: selectedLocation,
        remote: workMode === 'Remote' ? true : undefined,
        skills: selectedSkill,
        sort: sortOption,
        page,
        limit: 12,
        bookmarkedOnly,
      });

      if (response && response.success) {
        setInternships(response.internships || []);
        setSavedIds(response.savedInternshipIds || []);
        setStats(response.stats || null);
        setTotalCount(response.total || 0);
        setTotalPages(response.pages || 1);
        setCurrentPage(response.page || 1);
      } else {
        setError('Unable to load internships right now.');
      }
    } catch (err: any) {
      console.error('Error fetching internships:', err);
      setError('Unable to load internships right now. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRole, selectedLocation, workMode, selectedSkill, sortOption, bookmarkedOnly]);

  // Fetch backend recommendations when user is authenticated
  const fetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) {
      setBackendRecommendations([]);
      return;
    }
    try {
      const recResponse = await internshipService.getRecommendations(3);
      if (recResponse && recResponse.success && Array.isArray(recResponse.recommendations)) {
        setBackendRecommendations(recResponse.recommendations);
      }
    } catch (err) {
      // Non-blocking recommendation fetch failure
      setBackendRecommendations([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchListings(1);
    fetchRecommendations();
  }, [fetchListings, fetchRecommendations]);

  // Toggle bookmark handler
  const handleToggleBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      openModal({
        title: 'Save Internships to Your Profile',
        description: 'Create a free account to bookmark opportunities and access them anytime.',
      });
      return;
    }

    try {
      const res = await internshipService.toggleBookmark(id);
      if (res && res.success) {
        setSavedIds(res.savedInternshipIds || []);
        if (res.isBookmarked) {
          toast.success('Saved to your bookmarks! ♥');
        } else {
          toast.success('Removed from bookmarks.');
        }
      }
    } catch (err) {
      toast.error('Failed to update bookmark status.');
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('All');
    setSelectedLocation('All');
    setWorkMode('All');
    setSelectedSkill('');
    setSortOption('newest');
    setBookmarkedOnly(false);
  };

  // Recommended opportunities (Backend scored with safe fallback)
  const recommendedListings = useMemo(() => {
    if (!user || !isAuthenticated) return [];

    if (backendRecommendations.length > 0) {
      return backendRecommendations;
    }

    if (internships.length === 0) return [];

    const preferredCareer = (user.preferredCareer || '').toLowerCase();
    const preferredLang = (user.preferredProgrammingLanguage || '').toLowerCase();
    const userSkills = (user.skills || []).map((s) => s.toLowerCase());

    return internships
      .map((item) => {
        let score = 0;
        let reason = '✓ Recommended for your engineering profile';

        const roleLower = item.role.toLowerCase();
        const titleLower = item.title.toLowerCase();
        const skillsLower = item.skills.map((s) => s.toLowerCase());

        if (preferredCareer && (roleLower.includes(preferredCareer) || titleLower.includes(preferredCareer))) {
          score += 5;
          reason = `✓ Matches your target role (${user.preferredCareer})`;
        } else if (preferredLang && skillsLower.includes(preferredLang)) {
          score += 4;
          reason = `✓ Matches your language (${user.preferredProgrammingLanguage})`;
        } else if (userSkills.some((s) => skillsLower.includes(s))) {
          score += 3;
          reason = '✓ Matches your core skill set';
        }

        return { item, score, reason };
      })
      .filter((rec) => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [user, isAuthenticated, backendRecommendations, internships]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0E1524] overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        <Navbar />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-10 text-white shadow-xl shadow-indigo-950/10 border border-slate-800">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 text-left max-w-2xl">
                <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/10 border border-purple-400/20 px-3.5 py-1 text-xs font-bold text-purple-300">
                  <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                  <span>Internship Opportunity Engine</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
                  Find Your Next Internship 🚀
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Discover current engineering internships and opportunities matched to your career path.
                </p>
              </div>

              {/* Automatic Freshness Indicator */}
              <div className="flex items-center space-x-2 self-start md:self-center">
                <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-purple-200 shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {stats?.lastCheckedAt
                      ? `Auto-synced • ${new Date(stats.lastCheckedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                      : 'Auto-synced every 12 hours'}
                  </span>
                </span>
              </div>
            </div>

            {/* Filter Toolbar Box */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-slate-800">
                {/* Search Bar Input */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by role, company, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none p-0 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Role Select */}
                <div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role === 'All' ? 'Role: All Roles' : role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Select */}
                <div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === 'All' ? 'Location: All' : loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill Filter Select */}
                <div>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="">Skill: All Skills</option>
                    {POPULAR_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Option Select */}
                <div>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full bg-white/95 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="company">Sort: Company Name</option>
                  </select>
                </div>
              </div>

              {/* Work Mode Toggle Pills & Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-300 font-semibold">Mode:</span>
                  <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/10">
                    <button
                      onClick={() => setWorkMode('All')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                        workMode === 'All'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setWorkMode('Remote')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                        workMode === 'Remote'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Remote Only
                    </button>
                  </div>

                  {/* Saved Bookmarks Only Toggle */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openModal({
                          title: 'Save Internships to Your Profile',
                          description: 'Create a free account to view your saved internships.',
                        });
                        return;
                      }
                      setBookmarkedOnly(!bookmarkedOnly);
                    }}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      bookmarkedOnly
                        ? 'bg-rose-500 border-rose-400 text-white shadow-sm'
                        : 'bg-white/10 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${bookmarkedOnly ? 'fill-white' : ''}`} />
                    <span>Saved Internships ({savedIds.length})</span>
                  </button>
                </div>

                <button
                  onClick={handleClearFilters}
                  className="text-xs text-slate-300 hover:text-white underline font-semibold cursor-pointer bg-transparent border-none"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Top Summary Statistics Row (4 Compact Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="mosaic-card p-4 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  🟢 Open Now
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {stats ? stats.openCount : '—'}
                </p>
              </div>
            </div>

            <div className="mosaic-card p-4 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                <Filter className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  💻 Software Roles
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {stats ? stats.softwareCount : '—'}
                </p>
              </div>
            </div>

            <div className="mosaic-card p-4 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
                <Globe className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  🌎 Remote
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {stats ? stats.remoteCount : '—'}
                </p>
              </div>
            </div>

            <div className="mosaic-card p-4 flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
                <Building className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  🏢 Companies
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {stats ? stats.companyCount : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Section (Only for Authenticated Student Profile) */}
          {!isLoading && isAuthenticated && recommendedListings.length > 0 && !bookmarkedOnly && (
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                  Recommended Internships
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Matched to your role ({user?.preferredCareer || 'Software Engineer'})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedListings.map(({ item, reason }) => (
                  <InternshipCard
                    key={`rec-${item._id}`}
                    internship={item}
                    isBookmarked={savedIds.includes(item._id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={setSelectedInternship}
                    recommendationReason={reason}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Internship Opportunities Section */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                  {bookmarkedOnly ? 'Saved Internships' : 'Available Internships'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Showing {totalCount} engineering opportunities
                </p>
              </div>
            </div>

            {/* Loading Skeleton Grid */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-slate-200 rounded-md" />
                      <div className="h-6 w-16 bg-slate-200 rounded-md" />
                    </div>
                    <div className="h-8 w-full bg-slate-200 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="mosaic-card p-10 text-center space-y-4 bg-white border border-rose-100">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">{error}</h3>
                <button
                  onClick={() => fetchListings(currentPage)}
                  className="mosaic-btn-brand px-6 py-2.5 text-xs inline-block"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && internships.length === 0 && (
              <div className="mosaic-card p-12 text-center space-y-4 bg-white border border-slate-200">
                <Search className="h-12 w-12 text-purple-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No internships found</h3>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    {bookmarkedOnly
                      ? 'You have not saved any internships yet. Click the heart icon on any listing to save it here.'
                      : 'Try changing your role, location, or search filters to find available opportunities.'}
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="mosaic-btn-outline px-6 py-2 text-xs"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Internship Listings Grid */}
            {!isLoading && !error && internships.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.map((item) => (
                  <InternshipCard
                    key={item._id}
                    internship={item}
                    isBookmarked={savedIds.includes(item._id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={setSelectedInternship}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchListings(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-800 px-3 py-1 bg-slate-100 rounded-lg">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => fetchListings(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Shared Footer */}
        <Footer />
      </div>

      {/* Internship Detail Modal */}
      <InternshipDetailModal
        internship={selectedInternship}
        isBookmarked={selectedInternship ? savedIds.includes(selectedInternship._id) : false}
        onClose={() => setSelectedInternship(null)}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
      />
    </div>
  );
}

export default Internships;
