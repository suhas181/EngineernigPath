import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Star,
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
  Book,
  ExternalLink,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { Badge } from '../components/mosaic/Badge';

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
  }, [category, difficulty, search, bookmarkedOnly]);

  const handleToggleState = async (resourceId: string, action: 'toggle-complete' | 'toggle-bookmark') => {
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

    try {
      const endpoint = action === 'toggle-complete' ? 'complete' : 'bookmark';
      await api.post(`/resources/${resourceId}/${endpoint}`);
      toast.success(action === 'toggle-complete' ? 'Resource status updated!' : 'Bookmark updated!');
    } catch (error) {
      console.error(`Error updating resource ${action}:`, error);
      toast.error('Failed to save state.');
      fetchResources();
    }
  };

  const handleTrackClick = async (resource: Resource) => {
    try {
      await api.post(`/resources/${resource.id}/click`);
    } catch (err) {
      console.error('Failed to log click', err);
    }
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'video':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'documentation':
        return <Book className="h-4 w-4 text-blue-600" />;
      case 'article':
        return <BookOpen className="h-4 w-4 text-teal-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-slate-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading Learning Hub Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <MosaicShell>
      <TopHeader
        title="Learning Hub & Resources"
        subtitle={`Curated Documentation & Tutorial Videos • ${user?.preferredCareer || 'Engineering Pathway'}`}
        searchPlaceholder="Filter resources by topic or skill..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'video', 'article', 'documentation', 'practice', 'course'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                category === cat
                  ? 'bg-[var(--btn-primary-bg)] text-white shadow-sm'
                  : 'bg-white text-[var(--ink-700)] border border-[var(--card-border)] hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty & Bookmarks Filter */}
        <div className="flex items-center space-x-3">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-white border border-[var(--card-border)] rounded-full px-3 py-1.5 text-xs text-[var(--ink-900)] font-semibold focus:outline-none focus:border-teal-600 shadow-sm"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition ${
              bookmarkedOnly
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-[var(--ink-muted)] border border-[var(--card-border)] hover:text-slate-900'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${bookmarkedOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Saved Only</span>
          </button>
        </div>
      </div>

      {/* AI Recommendations Highlight Banner */}
      {recommendations.length > 0 && !search && category === 'all' && (
        <div className="mosaic-card p-6 space-y-4 text-left border-teal-200 bg-teal-50/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-bold text-teal-950 font-heading">
              AI Recommendations for {user?.preferredCareer || 'Your Pathway'}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleTrackClick(rec)}
                className="bg-white p-4 rounded-xl border border-teal-200/80 hover:border-teal-400 transition cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-teal-700">
                    <span className="uppercase">{rec.category}</span>
                    <span>{rec.estimatedTime} min</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{rec.title}</h4>
                </div>

                <span className="text-[11px] font-bold text-teal-700 flex items-center space-x-1 pt-2">
                  <span>Explore Now</span>
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Resources Catalog Grid */}
      <div className="space-y-4">
        {isError ? (
          <div className="mosaic-card p-8 text-center space-y-3 max-w-md mx-auto">
            <AlertOctagon className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-[var(--ink-900)]">Failed to Load Catalog</h3>
            <button onClick={fetchResources} className="mosaic-btn-primary !py-2 !px-4 !text-xs">
              Retry
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="mosaic-card p-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-[var(--ink-900)]">No Resources Found</h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Try adjusting your search filters or clearing the bookmark selection.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="mosaic-card p-5 space-y-3 text-left flex flex-col justify-between hover:border-teal-400/50 transition bg-white"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge tone="purple" icon={getCategoryIcon(res.category)}>
                      {res.category}
                    </Badge>

                    <button
                      onClick={() => handleToggleState(res.id, 'toggle-bookmark')}
                      className="text-slate-400 hover:text-amber-500 transition p-1"
                      title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      <Star className={`h-4 w-4 ${res.isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--ink-900)] line-clamp-2">{res.title}</h4>
                  <p className="text-xs text-[var(--ink-muted)] line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{res.estimatedTime} mins</span>
                    </span>
                    <span className="font-semibold capitalize">{res.difficulty}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleState(res.id, 'toggle-complete')}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 transition"
                    >
                      {res.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-300" />
                      )}
                      <span>{res.isCompleted ? 'Completed' : 'Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => handleTrackClick(res)}
                      className="mosaic-btn-brand !py-1.5 !px-3 !text-xs flex items-center space-x-1"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MosaicShell>
  );
}

export default Resources;
