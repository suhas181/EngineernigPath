import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
  Search,
  Sparkles,
  Star,
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
  Book,
  ExternalLink,
  Clock,
  Filter,
  ListFilter,
  AlertOctagon,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'video' | 'article' | 'documentation' | 'practice' | 'course';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags: string[];
  clicks: number;
  isCompleted: boolean;
  isBookmarked: boolean;
}

export function Resources() {
  const { user } = useAuthStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [recommendations, setRecommendations] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const fetchResources = async () => {
    setIsError(false);
    try {
      const queryParams: any = {};
      if (category !== 'all') queryParams.category = category;
      if (difficulty !== 'all') queryParams.difficulty = difficulty;
      if (search.trim() !== '') queryParams.search = search;
      if (bookmarkedOnly) queryParams.bookmarkedOnly = 'true';

      const response = await api.get('/resources', { params: queryParams });
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
    } catch (err) {
      console.error('Failed to load AI recommendations:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchResources(), fetchRecommendations()]);
      setIsLoading(false);
    };
    init();
  }, [category, difficulty, bookmarkedOnly]);

  // Debounced/Triggered search execution
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleToggleComplete = async (resourceId: string, currentStatus: boolean) => {
    // Optimistic toggle local list
    const updateList = (list: Resource[]) =>
      list.map((r) => {
        if (r.id !== resourceId) return r;
        return { ...r, isCompleted: !currentStatus };
      });

    setResources((prev) => updateList(prev));
    setRecommendations((prev) => updateList(prev));

    try {
      await api.patch(`/resources/${resourceId}/toggle-complete`, {
        isCompleted: !currentStatus,
      });
      toast.success(!currentStatus ? 'Marked as completed!' : 'Marked as incomplete');
    } catch (error) {
      console.error('Failed to toggle completion status:', error);
      toast.error('Failed to update completion status.');
      // Rollback
      fetchResources();
      fetchRecommendations();
    }
  };

  const handleToggleBookmark = async (resourceId: string, currentStatus: boolean) => {
    // Optimistic toggle local list
    const updateList = (list: Resource[]) =>
      list.map((r) => {
        if (r.id !== resourceId) return r;
        return { ...r, isBookmarked: !currentStatus };
      });

    setResources((prev) => updateList(prev));
    setRecommendations((prev) => updateList(prev));

    try {
      await api.patch(`/resources/${resourceId}/bookmark`, {
        isBookmarked: !currentStatus,
      });
      toast.success(!currentStatus ? 'Added to Bookmarks!' : 'Removed from Bookmarks');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Failed to update bookmark.');
      // Rollback
      fetchResources();
      fetchRecommendations();
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-400" />;
      case 'book':
        return <Book className="h-4 w-4 text-emerald-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-amber-400" />;
    }
  };

  const getDifficultyStyles = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'intermediate':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.round((minutes / 60) * 10) / 10;
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} mins`;
  };

  if (isLoading && resources.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading Learning Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-10 text-left">
        {/* Header Summary */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">Learning Hub</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Browse through curated tutorials, practice platforms, documentation guides, and video bootcamps. Sync updates directly to your active roadmap topics.
          </p>
        </div>

        {/* AI Recommendations Panel */}
        {recommendations.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border border-indigo-500/10 space-y-6 relative overflow-hidden bg-gradient-to-r from-indigo-500/[0.02] to-transparent">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold font-heading">AI Recommendations For You</h3>
              </div>
              <span className="text-xs text-muted-foreground">Customized for {user?.preferredCareer || 'your role'}</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition relative bg-white/[0.01]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1 text-[10px] text-muted-foreground font-medium capitalize">
                        {getResourceIcon(item.category)}
                        <span>{item.category}</span>
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyStyles(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleComplete(item.id, item.isCompleted)}
                        className="p-1 text-muted-foreground hover:text-white transition"
                        title={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 fill-indigo-500/5" />
                        ) : (
                          <Circle className="h-4.5 w-4.5 text-white/30" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleBookmark(item.id, item.isBookmarked)}
                        className="p-1 text-muted-foreground hover:text-white transition"
                        title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                      >
                        <Star className={`h-4.5 w-4.5 ${item.isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                      </button>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-white flex items-center space-x-1 border border-white/5 px-2.5 py-1 rounded bg-white/5 transition"
                    >
                      <span>Study</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter Tabs & Main Catalog Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Search and Filters */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold font-heading">Filter Resources</h3>
              </div>

              {/* Text Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search resources, tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-white"
                />
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <button type="submit" className="hidden">Search</button>
              </form>

              {/* Dropdown Filters */}
              <div className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="video">Videos</option>
                    <option value="article">Articles</option>
                    <option value="documentation">Documentation</option>
                    <option value="practice">Practice Websites</option>
                    <option value="course">Structured Courses</option>
                  </select>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Bookmarked Filter Checkbox */}
                <label className="flex items-center space-x-3 cursor-pointer select-none py-2 text-sm text-left">
                  <input
                    type="checkbox"
                    checked={bookmarkedOnly}
                    onChange={(e) => setBookmarkedOnly(e.target.checked)}
                    className="h-4 w-4 rounded bg-white/5 border border-white/10 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-white/90">Show Bookmarked Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel: Catalog Grid list */}
          <div className="lg:col-span-8 space-y-6">
            {isError ? (
              <div className="glass-panel rounded-2xl p-10 text-center space-y-4">
                <AlertOctagon className="h-10 w-10 text-rose-500 mx-auto" />
                <h3 className="text-lg font-bold">Failed to load resource library</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  We encountered an error query. Please click retry to synchronize search indexes.
                </p>
                <button
                  onClick={fetchResources}
                  className="bg-primary px-5 py-2 rounded-lg font-semibold text-xs transition hover:opacity-90"
                >
                  Retry Search
                </button>
              </div>
            ) : resources.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-muted-foreground space-y-3">
                <ListFilter className="h-10 w-10 text-white/20 mx-auto" />
                <h3 className="text-base font-bold text-white/80">No Resources Found</h3>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">
                  No matches matched your category, search tags, or bookmark selection. Try relaxing your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>Showing {resources.length} resources</span>
                  <span>Sort: popularity</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {resources.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1.5 text-[10px] text-muted-foreground font-medium capitalize">
                            {getResourceIcon(item.category)}
                            <span>{item.category}</span>
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center space-x-1 text-[10px] text-muted-foreground font-semibold">
                              <Clock className="h-3 w-3" />
                              <span>{formatEstimatedTime(item.estimatedTime)}</span>
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyStyles(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-left line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground text-left line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {item.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/60">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleComplete(item.id, item.isCompleted)}
                            className="p-1.5 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5"
                            title={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/5" />
                            ) : (
                              <Circle className="h-5 w-5 text-white/30" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleBookmark(item.id, item.isBookmarked)}
                            className="p-1.5 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5"
                            title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                          >
                            <Star className={`h-5 w-5 ${item.isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                          </button>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5"
                        >
                          <span>Open Link</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Resources;
