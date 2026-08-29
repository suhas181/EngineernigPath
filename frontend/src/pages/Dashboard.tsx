import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthModalStore } from '../store/useAuthModalStore';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { DashboardHero, CAREER_ROLES } from '../components/dashboard/DashboardHero';
import {
  getRecentResources,
  recordResourceOpened,
  RecentResourceItem,
} from '../services/recentResourceService';
import { formatRelativeTime } from '../utils/dateUtils';
import {
  ArrowRight,
  ExternalLink,
  PlayCircle,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Compass,
  BookMarked,
  Target,
  Layers,
  Award,
  Sparkles,
  Code,
  GraduationCap,
  Clock,
} from 'lucide-react';

interface SavedTopicInfo {
  role: string;
  category: string;
  module: string;
  topic: string;
  topicId: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();

  const [activeTopicInfo] = useState<SavedTopicInfo | null>(() => {
    const saved = localStorage.getItem('engineerpath_active_topic');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return {
      role: 'Software Engineer',
      category: 'Data Structures & Algorithms',
      module: 'Linear Data Structures',
      topic: 'Arrays, Two Pointers & Sliding Window',
      topicId: 'top-sde-dsa-arrays',
    };
  });

  const [recentResources, setRecentResources] = useState<RecentResourceItem[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState<boolean>(true);

  // Dynamic fetch of user/guest recent history
  useEffect(() => {
    let isMounted = true;
    const loadRecentResources = async () => {
      setIsLoadingRecent(true);
      try {
        const items = await getRecentResources(6);
        if (isMounted) {
          setRecentResources(items);
        }
      } catch (err) {
        if (isMounted) {
          setRecentResources([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRecent(false);
        }
      }
    };

    loadRecentResources();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleStartRole = (categoryName: string) => {
    navigate(`/roadmaps?role=${encodeURIComponent(categoryName)}`);
  };

  const handleOpenAgain = async (res: RecentResourceItem) => {
    // Re-record recent action so it refreshes lastOpenedAt
    await recordResourceOpened({
      id: res.id || res.resourceId,
      resourceId: res.resourceId,
      title: res.title,
      provider: res.provider,
      type: res.type,
      url: res.url,
      thumbnail: res.thumbnail,
    });

    // Optimistically update the UI order and relative time
    setRecentResources((prev) => {
      const updated = { ...res, lastOpenedAt: new Date().toISOString() };
      return [updated, ...prev.filter((item) => (item.id || item.resourceId) !== (res.id || res.resourceId))].slice(0, 6);
    });
  };

  const getResourceIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t === 'video' || t === 'playlist') return PlayCircle;
    if (t === 'practice' || t === 'problem') return Target;
    if (t === 'github' || t === 'project' || t === 'open-source') return Code;
    if (t === 'course') return GraduationCap;
    if (t === 'article' || t === 'documentation' || t === 'doc') return BookOpen;
    return FileCheck;
  };

  return (
    <MosaicShell>
      <div className="space-y-8 pb-16 text-left pt-2">
        {/* ==================== SECTION 1: RICH HERO CAROUSEL ==================== */}
        <DashboardHero onStartRole={handleStartRole} />

        {/* ==================== 4 QUICK STATISTICS BADGES ==================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 font-bold">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">80+</div>
              <div className="text-xs font-semibold text-slate-500">Structured Topics</div>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">1200+</div>
              <div className="text-xs font-semibold text-slate-500">Practice Problems</div>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">500+</div>
              <div className="text-xs font-semibold text-slate-500">Curated Resources</div>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">8</div>
              <div className="text-xs font-semibold text-slate-500">Career Paths</div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: CHOOSE YOUR CAREER PATH ==================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isAuthenticated ? 'Based on Your Career Goal' : 'Popular Career Paths'}
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Select a role to unlock its structured category curriculum, practice sheets, and projects.
              </p>
            </div>
            <Link
              to="/roadmaps"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center transition-colors"
            >
              View All Paths
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAREER_ROLES.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => handleStartRole(role.categoryName)}
                  className="group relative rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-250 cursor-pointer text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${role.gradient} text-white shadow-md group-hover:scale-105 transition-transform`}>
                        <RoleIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {role.duration}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {role.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {role.skills.slice(0, 4).map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
                        >
                          {sk}
                        </span>
                      ))}
                      {role.skills.length > 4 && (
                        <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-400">
                          +{role.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Est. {role.duration}</span>
                    <span className="text-blue-600 font-extrabold group-hover:translate-x-1 transition-transform flex items-center">
                      Start Path
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================== SECTION 3: CONTINUE LEARNING / PERSONALIZE CTA ==================== */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isAuthenticated ? 'Continue Learning' : 'Explore Learning Pathways'}
          </h2>

          {isAuthenticated && activeTopicInfo ? (
            <div className="relative rounded-2xl border border-blue-200/90 bg-white/90 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-250">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-700 border border-blue-200">
                    ACTIVE STEP
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Role: <strong className="text-slate-800">{activeTopicInfo.role}</strong>
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeTopicInfo.category} &bull; {activeTopicInfo.module}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {activeTopicInfo.topic}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Follow the 8-step guided learning flow to complete this topic.
                </p>
              </div>

              <button
                onClick={() => navigate(`/roadmaps?role=${encodeURIComponent(activeTopicInfo.role)}`)}
                className="w-full md:w-auto px-7 py-4 rounded-2xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
              >
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : !isAuthenticated ? (
            <div className="relative rounded-2xl border border-purple-200/90 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl text-white">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-1 text-xs font-bold text-purple-300">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Interactive Exploration Mode</span>
                </div>
                <h3 className="text-2xl font-extrabold font-heading text-white">
                  Personalize your EngineerPath &rarr;
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Track your roadmap progress, bookmark internships, save learning resources, and upload your resume for instant ATS analysis.
                </p>
              </div>

              <button
                onClick={() => openModal({ title: 'Make EngineerPath yours', description: 'Create a free account to save your progress, internships and roadmap.' })}
                className="w-full md:w-auto px-7 py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                Personalize EngineerPath
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-xl p-8 text-center space-y-4 shadow-sm hover:shadow-md transition-all duration-250">
              <Compass className="w-12 h-12 text-blue-600 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Choose Your First Learning Path</h3>
                <p className="text-xs text-slate-500">
                  Select a career role above to start your guided 8-step engineering journey.
                </p>
              </div>
              <button
                onClick={() => navigate('/roadmaps')}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-flex items-center cursor-pointer"
              >
                Browse Career Paths
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          )}
        </section>

        {/* ==================== SECTION 4: RECENTLY OPENED RESOURCES ==================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recently Opened Resources</h2>
            <span className="text-xs text-slate-500 font-semibold">Direct Access</span>
          </div>

          {isLoadingRecent ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border border-slate-200 bg-white/80 p-6 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                    <div className="w-20 h-5 bg-slate-200 rounded-md" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="pt-4 border-t border-slate-100 flex justify-between">
                    <div className="w-20 h-4 bg-slate-200 rounded" />
                    <div className="w-16 h-4 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentResources.length === 0 ? (
            /* Clean Empty State: No Fake Resources */
            <div className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">No resources opened yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Explore the Learning Hub or your curriculum topics to start building your personal direct access history.
                </p>
              </div>
              <button
                onClick={() => navigate('/resources')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all inline-flex items-center space-x-1.5 shadow-sm shadow-blue-600/20 cursor-pointer"
              >
                <span>Explore Learning Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentResources.map((res) => {
                const ResourceIcon = getResourceIcon(res.type);
                const relativeTimeLabel = formatRelativeTime(res.lastOpenedAt);

                return (
                  <div
                    key={res.id || res.resourceId || res.url}
                    className="rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 text-left"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                          <ResourceIcon className="w-5 h-5" />
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200">
                          {res.provider || 'Resource'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {res.title}
                      </h4>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Opened {relativeTimeLabel.toLowerCase()}</span>
                        </span>
                        <span className="text-slate-500 font-medium capitalize text-[11px] px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                          {res.type}
                        </span>
                      </div>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpenAgain(res)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 group cursor-pointer"
                      >
                        <span>Open Again</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MosaicShell>
  );
}

export default Dashboard;
