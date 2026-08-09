import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Star,
  CheckCircle2,
  Circle,
  Video,
  BookOpen,
  Github,
  FileText,
  GraduationCap,
  ExternalLink,
  Search,
  X,
  Rocket,
  Target,
  Layers,
  Play,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';
import { MosaicShell } from '../components/mosaic/MosaicShell';

export interface LearningHubResource {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: string;
  topic: string;
  type: 'video' | 'playlist' | 'github' | 'documentation' | 'article' | 'course' | 'practice' | 'open-source' | 'interview' | string;
  url: string;
  thumbnail?: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  tags: string[];
  featured?: boolean;
  language?: string;
  verified?: boolean;
  isCompleted?: boolean;
  isBookmarked?: boolean;
}

const CATEGORIES = [
  'All',
  'Recommended',
  'Programming Languages',
  'Data Structures & Algorithms',
  'Web Development',
  'CS Fundamentals',
  'Git & GitHub',
  'Open Source & GSoC',
  'Aptitude',
  'Interview Preparation',
  'Projects',
];

const TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'playlist', label: 'Playlists', icon: Layers },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'documentation', label: 'Docs', icon: BookOpen },
  { id: 'article', label: 'Articles', icon: FileText },
  { id: 'course', label: 'Courses', icon: GraduationCap },
  { id: 'practice', label: 'Practice', icon: Target },
  { id: 'open-source', label: 'Open Source', icon: Rocket },
];

export function Resources() {
  const [resources, setResources] = useState<LearningHubResource[]>([]);
  const [recommendations, setRecommendations] = useState<LearningHubResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const fetchResources = async () => {
    try {
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedLanguage !== 'all') params.language = selectedLanguage;
      if (search.trim() !== '') params.search = search;
      if (bookmarkedOnly) params.bookmarkedOnly = 'true';

      const response = await api.get('/resources', { params });
      if (response.data && response.data.resources) {
        setResources(response.data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setIsError(true);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/resources/recommendations');
      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchResources(), fetchRecommendations()]);
      setIsLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedType, selectedLanguage, search, bookmarkedOnly]);

  const handleToggleState = async (
    resourceId: string,
    action: 'toggle-complete' | 'toggle-bookmark'
  ) => {
    // Optimistic UI update
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          return {
            ...r,
            isCompleted: action === 'toggle-complete' ? !r.isCompleted : r.isCompleted,
            isBookmarked: action === 'toggle-bookmark' ? !r.isBookmarked : r.isBookmarked,
          };
        }
        return r;
      })
    );

    setRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          return {
            ...r,
            isCompleted: action === 'toggle-complete' ? !r.isCompleted : r.isCompleted,
            isBookmarked: action === 'toggle-bookmark' ? !r.isBookmarked : r.isBookmarked,
          };
        }
        return r;
      })
    );

    try {
      const targetRes = resources.find((r) => r.id === resourceId) || recommendations.find((r) => r.id === resourceId);
      if (!targetRes) return;

      if (action === 'toggle-bookmark') {
        const nextState = !targetRes.isBookmarked;
        await api.patch(`/resources/${resourceId}/bookmark`, { isBookmarked: nextState });
        toast.success(nextState ? 'Resource bookmarked' : 'Bookmark removed');
      } else {
        const nextState = !targetRes.isCompleted;
        await api.patch(`/resources/${resourceId}/toggle-complete`, { isCompleted: nextState });
        toast.success(nextState ? 'Marked as completed' : 'Marked as uncompleted');
      }
    } catch (error) {
      console.error('Failed to update resource state:', error);
      toast.error('Failed to sync resource state with server');
    }
  };

  // Group resources by category for section rendering
  const resourcesByCategory = useMemo(() => {
    const map: Record<string, LearningHubResource[]> = {};
    resources.forEach((r) => {
      const cat = r.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(r);
    });
    return map;
  }, [resources]);

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'All' || selectedType !== 'all' || selectedLanguage !== 'all' || bookmarkedOnly;

  return (
    <MosaicShell>
      <div className="space-y-8 pb-20 text-left">
        {/* ==========================================
            HERO HEADER AREA
           ========================================== */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-10 text-white overflow-hidden shadow-2xl border border-slate-800">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>CURATED STUDENT DISCOVERY PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Learning Hub
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              Curated high-quality YouTube courses, GitHub repositories, official documentation, and interview preparation resources for engineering students.
            </p>

            {/* SEARCH INPUT BAR */}
            <div className="pt-2">
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources by title, topic, provider or tag (e.g. Striver, Python, React, OS)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            TYPE FILTERS & CATEGORIES BAR
           ========================================== */}
        <div className="space-y-4">
          {/* Resource Type Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {TYPES.map((typeObj) => {
              const IconComp = typeObj.icon;
              const isActive = selectedType === typeObj.id;
              return (
                <button
                  key={typeObj.id}
                  onClick={() => setSelectedType(typeObj.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 shrink-0 border ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {IconComp && <IconComp className="w-3.5 h-3.5" />}
                  <span>{typeObj.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 shrink-0 border ${
                bookmarkedOnly
                  ? 'bg-amber-500 text-white border-amber-400 shadow-md'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-current' : ''}`} />
              <span>Bookmarked</span>
            </button>
          </div>

          {/* Category Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-slate-100/80 border-slate-200/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            LOADING / ERROR STATES
           ========================================== */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading curated resources...</p>
          </div>
        ) : isError ? (
          <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2">
            <p className="text-red-700 font-bold">Failed to load learning resources</p>
            <button
              onClick={() => fetchResources()}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* ==========================================
                SEARCH / FILTER ACTIVE VIEW
               ========================================== */}
            {hasActiveFilters ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span>Search & Filter Results</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold">
                      {resources.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                      setSelectedType('all');
                      setSelectedLanguage('all');
                      setBookmarkedOnly(false);
                    }}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Clear All Filters
                  </button>
                </div>

                {resources.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
                    <p className="text-slate-600 font-medium">No resources found matching your search criteria.</p>
                    <p className="text-xs text-slate-400">Try searching for broader terms like "DSA", "Python", "React", or "Git".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={res}
                        onToggleState={handleToggleState}
                        hasError={Boolean(imageErrorMap[res.id])}
                        onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ==========================================
                  DEFAULT CURATED SECTIONS VIEW
                 ========================================== */
              <div className="space-y-12">
                {/* SECTION 1: RECOMMENDED FOR YOU */}
                {recommendations.length > 0 && (
                  <SectionBlock
                    title="✨ Recommended for You"
                    subtitle="Hand-picked resources personalized for your career path and preferred programming language."
                    badge="FEATURED"
                    badgeColor="bg-purple-100 text-purple-700 border-purple-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {recommendations.map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 2: OPEN SOURCE & GSOC */}
                {resourcesByCategory['Open Source & GSoC']?.length > 0 && (
                  <SectionBlock
                    title="🚀 Open Source & GSoC"
                    subtitle="Official Google Summer of Code guides, GitHub Skills labs, and beginner contribution walkthroughs."
                    badge="COMMUNITY"
                    badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                      {resourcesByCategory['Open Source & GSoC'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 3: PROGRAMMING LANGUAGES */}
                {resourcesByCategory['Programming Languages']?.length > 0 && (
                  <SectionBlock
                    title="💻 Programming Languages"
                    subtitle="Core language courses and documentation for Python, Java, C++, JavaScript, and TypeScript."
                    badge="LANGUAGES"
                    badgeColor="bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Programming Languages'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 4: DATA STRUCTURES & ALGORITHMS */}
                {resourcesByCategory['Data Structures & Algorithms']?.length > 0 && (
                  <SectionBlock
                    title="🧠 Master Data Structures & Algorithms"
                    subtitle="Striver's A2Z Sheet, NeetCode 150, LeetCode, GeeksforGeeks, and Abdul Bari's algorithms playlist."
                    badge="TOP PICK"
                    badgeColor="bg-amber-100 text-amber-700 border-amber-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Data Structures & Algorithms'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 5: WEB DEVELOPMENT */}
                {resourcesByCategory['Web Development']?.length > 0 && (
                  <SectionBlock
                    title="🌐 Web Development"
                    subtitle="HTML, CSS, React 18, Node.js, Express, MongoDB, and SQL database tutorials."
                    badge="FULL STACK"
                    badgeColor="bg-cyan-100 text-cyan-700 border-cyan-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Web Development'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 6: CS FUNDAMENTALS */}
                {resourcesByCategory['CS Fundamentals']?.length > 0 && (
                  <SectionBlock
                    title="⚙️ CS Fundamentals"
                    subtitle="Operating Systems, DBMS, Computer Networks, and System Design Primer for placement exams & interviews."
                    badge="CORE THEORY"
                    badgeColor="bg-indigo-100 text-indigo-700 border-indigo-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['CS Fundamentals'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 7: GIT & GITHUB */}
                {resourcesByCategory['Git & GitHub']?.length > 0 && (
                  <SectionBlock
                    title="🐙 Git & GitHub"
                    subtitle="Learn version control, branch management, pull requests, interactive command visualizers, and GitHub Skills."
                    badge="TOOLS"
                    badgeColor="bg-slate-200 text-slate-800 border-slate-300"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Git & GitHub'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 8: APTITUDE */}
                {resourcesByCategory['Aptitude']?.length > 0 && (
                  <SectionBlock
                    title="🎯 Placement Aptitude"
                    subtitle="Quantitative maths, logical reasoning, verbal ability, and company placement preparation drills."
                    badge="PLACEMENT"
                    badgeColor="bg-orange-100 text-orange-700 border-orange-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Aptitude'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 9: INTERVIEW PREPARATION */}
                {resourcesByCategory['Interview Preparation']?.length > 0 && (
                  <SectionBlock
                    title="🎤 Crack the Interview"
                    subtitle="Striver SDE sheet, Tech Interview Handbook, SQL 50 study plan, and behavioral STAR method guides."
                    badge="INTERVIEWS"
                    badgeColor="bg-rose-100 text-rose-700 border-rose-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Interview Preparation'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* SECTION 10: PROJECTS */}
                {resourcesByCategory['Projects']?.length > 0 && (
                  <SectionBlock
                    title="🚀 Real-World Projects"
                    subtitle="Full Stack MERN E-Commerce, AI SaaS applications, and curated project specs to build a standout portfolio."
                    badge="PORTFOLIO"
                    badgeColor="bg-violet-100 text-violet-700 border-violet-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {resourcesByCategory['Projects'].map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          onToggleState={handleToggleState}
                          hasError={Boolean(imageErrorMap[res.id])}
                          onImageError={() => setImageErrorMap((prev) => ({ ...prev, [res.id]: true }))}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MosaicShell>
  );
}

{/* ==========================================
    SECTION CONTAINER COMPONENT
   ========================================== */}
function SectionBlock({
  title,
  subtitle,
  badge,
  badgeColor,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            {badge && (
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${badgeColor || 'bg-slate-100 text-slate-700'}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

{/* ==========================================
    THUMBNAIL RESOURCE CARD COMPONENT
   ========================================== */}
function ResourceCard({
  resource,
  onToggleState,
  hasError,
  onImageError,
}: {
  resource: LearningHubResource;
  onToggleState: (id: string, action: 'toggle-complete' | 'toggle-bookmark') => void;
  hasError: boolean;
  onImageError: () => void;
}) {
  const isVideo = resource.type === 'video' || resource.type === 'playlist';
  const isGithub = resource.type === 'github' || resource.type === 'open-source';

  return (
    <div className="group relative flex flex-col bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      {/* THUMBNAIL CONTAINER (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {!hasError && resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            onError={onImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* FALLBACK PLACEHOLDER GRADIENT */
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
            {isGithub ? (
              <Github className="w-10 h-10 text-purple-400 mb-2 opacity-80" />
            ) : isVideo ? (
              <Video className="w-10 h-10 text-blue-400 mb-2 opacity-80" />
            ) : (
              <BookOpen className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            )}
            <span className="text-xs font-bold text-slate-200 truncate max-w-[90%]">{resource.provider}</span>
            <span className="text-[10px] text-slate-400">{resource.topic}</span>
          </div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Video Play Icon Overlay */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-purple-500 transition-all">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-slate-700/80 shadow-md">
            {resource.provider}
          </span>

          <div className="flex items-center space-x-1.5">
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleState(resource.id, 'toggle-bookmark');
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                resource.isBookmarked
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
              title={resource.isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
            >
              <Star className={`w-3.5 h-3.5 ${resource.isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Complete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleState(resource.id, 'toggle-complete');
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                resource.isCompleted
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
              title={resource.isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
            >
              {resource.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Bottom Metadata Badges */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 text-[10px] font-semibold text-slate-300">
          <span className="px-2 py-0.5 rounded bg-slate-900/90 text-purple-300 border border-purple-500/30">
            {resource.type.toUpperCase()}
          </span>

          {resource.duration && (
            <span className="px-2 py-0.5 rounded bg-slate-900/90 text-slate-300">
              {resource.duration}
            </span>
          )}
        </div>
      </div>

      {/* CARD BODY CONTENT */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 uppercase tracking-wider">
            <span>{resource.topic}</span>
            {resource.verified && (
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 font-extrabold">
                <ShieldCheck className="w-3 h-3" />
                <span>VERIFIED</span>
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
            {resource.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* TAGS & CTA BUTTON */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                #{tag}
              </span>
            ))}
            {resource.level && (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold ml-auto">
                {resource.level}
              </span>
            )}
          </div>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm group-hover:shadow-md"
          >
            <span>{isVideo ? 'Watch Now' : isGithub ? 'Explore Repo' : 'Open Resource'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Resources;
