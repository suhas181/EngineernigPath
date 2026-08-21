import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import {
  Compass,
  Code2,
  ChevronDown,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  AlertOctagon,
} from 'lucide-react';

import * as roadmapService from '../services/roadmapService';
import {
  CareerRoleCurriculum,
  CurriculumCategory,
  CurriculumModule,
  CurriculumTopic,
} from '../services/curriculumServiceTypes';

import { MosaicShell } from '../components/mosaic/MosaicShell';
import { CategoryCard } from '../components/learning/CategoryCard';
import { TopicLearningView } from '../components/learning/TopicLearningView';

const AVAILABLE_ROLES = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'AI / ML Engineer',
  'Data Scientist / Analyst',
  'DevOps Engineer',
  'Mobile App Developer',
  'Cybersecurity Engineer',
];

const resolveRole = (roleParam: string | null, fallbackRole: string | undefined): string => {
  if (roleParam) {
    const trimmed = roleParam.trim();
    // 1. Exact match (case-insensitive)
    const exact = AVAILABLE_ROLES.find((r) => r.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;

    // 2. Keyword/alias match
    const lower = trimmed.toLowerCase();
    if (lower.includes('cyber') || lower.includes('security') || lower.includes('infosec') || lower.includes('pentest')) {
      return 'Cybersecurity Engineer';
    }
    if (lower.includes('mobile') || lower.includes('flutter') || lower.includes('react native') || lower.includes('android') || lower.includes('ios')) {
      return 'Mobile App Developer';
    }
    if (lower.includes('devops') || lower.includes('cloud') || lower.includes('infra')) {
      return 'DevOps Engineer';
    }
    if (lower.includes('data') || lower.includes('analyst') || lower.includes('scientist')) {
      return 'Data Scientist / Analyst';
    }
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
      return 'AI / ML Engineer';
    }
    if (lower.includes('full') || lower.includes('fullstack')) {
      return 'Full Stack Developer';
    }
    if (lower.includes('frontend') || lower.includes('front-end') || lower.includes('ui')) {
      return 'Frontend Engineer';
    }
    if (lower.includes('backend') || lower.includes('back-end') || lower.includes('api')) {
      return 'Backend Engineer';
    }
    if (lower.includes('software') || lower.includes('sde') || lower.includes('engineer')) {
      return 'Software Engineer';
    }
  }

  if (fallbackRole) {
    const exactFallback = AVAILABLE_ROLES.find((r) => r.toLowerCase() === fallbackRole.trim().toLowerCase());
    if (exactFallback) return exactFallback;
  }

  return 'Software Engineer';
};

const getInitialLanguageForRole = (role: string, userLang: string | undefined): 'Java' | 'Python' | 'C++' => {
  const roleLower = role.toLowerCase();
  if (
    roleLower.includes('data') ||
    roleLower.includes('analyst') ||
    roleLower.includes('scientist') ||
    roleLower.includes('ai') ||
    roleLower.includes('ml') ||
    roleLower.includes('cyber') ||
    roleLower.includes('security')
  ) {
    return 'Python';
  }
  return (userLang as any) || 'Java';
};

interface SelectedTopicState {
  category: CurriculumCategory;
  module: CurriculumModule;
  topic: CurriculumTopic;
}

export function Roadmap() {
  const { user, updateUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRoleParam = searchParams.get('role');

  // Priority 1: URL ?role=... | Priority 2: user?.preferredCareer | Priority 3: 'Software Engineer'
  const initialResolvedRole = resolveRole(urlRoleParam, user?.preferredCareer);
  const [selectedRole, setSelectedRole] = useState<string>(initialResolvedRole);
  const [selectedLanguage, setSelectedLanguage] = useState<'Java' | 'Python' | 'C++'>(
    getInitialLanguageForRole(initialResolvedRole, user?.preferredProgrammingLanguage)
  );

  const [curriculum, setCurriculum] = useState<CareerRoleCurriculum | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTopicState, setSelectedTopicState] = useState<SelectedTopicState | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const categorySectionRef = useRef<HTMLDivElement>(null);

  // Synchronize role whenever URL search parameter changes
  useEffect(() => {
    const currentParam = searchParams.get('role');
    if (currentParam) {
      const targetRole = resolveRole(currentParam, user?.preferredCareer);
      if (targetRole !== selectedRole) {
        setSelectedRole(targetRole);
        setSelectedTopicState(null);
        if (
          targetRole === 'Data Scientist / Analyst' ||
          targetRole.includes('AI / ML') ||
          targetRole === 'Cybersecurity Engineer'
        ) {
          setSelectedLanguage('Python');
        }
      }
    }
  }, [searchParams]);

  const fetchCurriculum = async (role: string, lang: 'Java' | 'Python' | 'C++') => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await roadmapService.getLearningCurriculum(role, lang);
      if (data) {
        setCurriculum(data);
        if (data.categories && data.categories.length > 0) {
          const exists = data.categories.some((c: CurriculumCategory) => c.id === selectedCategoryId);
          if (!exists) {
            setSelectedCategoryId(data.categories[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load curriculum:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum(selectedRole, selectedLanguage);
  }, [selectedRole, selectedLanguage]);

  const handleLanguageChange = (lang: 'Java' | 'Python' | 'C++') => {
    setSelectedLanguage(lang);
    if (user) {
      updateUser({
        ...user,
        preferredProgrammingLanguage: lang,
      });
    }
    toast.success(`Language updated to ${lang}`);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setSelectedTopicState(null);
    setSearchParams({ role });
    let targetLang = selectedLanguage;
    if (role === 'Data Scientist / Analyst' || role.includes('AI / ML') || role === 'Cybersecurity Engineer') {
      targetLang = 'Python';
      setSelectedLanguage('Python');
    }
    if (user) {
      updateUser({
        ...user,
        preferredCareer: role,
        preferredProgrammingLanguage: targetLang,
      });
    }
    toast.success(`Career track changed to ${role}`);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setTimeout(() => {
      categorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSelectTopic = (category: CurriculumCategory, module: CurriculumModule, topic: CurriculumTopic) => {
    setSelectedTopicState({ category, module, topic });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategory = curriculum?.categories.find((c) => c.id === selectedCategoryId);

  return (
    <MosaicShell>
      {/* If a topic is selected, render dedicated TopicLearningView */}
      {selectedTopicState ? (
        <TopicLearningView
          role={selectedRole}
          language={selectedLanguage}
          category={selectedTopicState.category}
          module={selectedTopicState.module}
          topic={selectedTopicState.topic}
          onBack={() => {
            setSelectedTopicState(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* ─── CAREER ROLE HEADER & LANGUAGE SELECTOR BAR ────────────────── */}
          <div className="mosaic-card p-6 bg-white border border-[var(--card-border)] space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
                  <Compass className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Career Learning Platform
                    </span>
                    <span className="text-[11px] text-slate-400">• Step-by-Step Pathway</span>
                  </div>

                  <div className="relative inline-block mt-1 group">
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <h1 className="text-2xl font-extrabold text-[var(--ink-900)] font-heading tracking-tight">
                        {selectedRole}
                      </h1>
                      <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-700 transition" />
                    </div>

                    <select
                      value={selectedRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      {AVAILABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r} Track
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                    Select a category card below to automatically jump to its modules & topics.
                  </p>
                </div>
              </div>

              {/* Language Awareness Selector Toggle */}
              <div className="flex items-center space-x-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600 px-2 flex items-center space-x-1">
                  <Code2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Language:</span>
                </span>

                {(['Java', 'Python', 'C++'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                      selectedLanguage === lang
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Header Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-semibold">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-teal-600" />
                <span>8 Learning Categories</span>
                <span className="text-slate-300">•</span>
                <span>
                  {curriculum?.categories.reduce((sum, c) => sum + c.topicCount, 0) || 0} Core Topics
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 text-[11px] font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Resources tailored for {selectedRole === 'Data Scientist / Analyst' || selectedRole.toLowerCase().includes('data') ? 'Python' : selectedRole.toLowerCase().includes('frontend') ? 'Frontend Engineering' : selectedRole.toLowerCase().includes('backend') ? 'Backend Engineering' : (selectedRole.toLowerCase().includes('ai') || selectedRole.toLowerCase().includes('machine learning')) ? 'AI / ML Engineering' : selectedLanguage}
                </span>
              </div>
            </div>
          </div>

          {/* Loading & Error States */}
          {isLoading ? (
            <div className="mosaic-card p-12 text-center space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
              <p className="text-[var(--ink-muted)] text-sm font-medium">
                Loading {selectedRole} Learning Categories...
              </p>
            </div>
          ) : isError ? (
            <div className="mosaic-card p-8 text-center space-y-4 max-w-lg mx-auto">
              <AlertOctagon className="h-12 w-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-[var(--ink-900)]">Failed to Load Curriculum</h2>
              <button
                onClick={() => fetchCurriculum(selectedRole, selectedLanguage)}
                className="mosaic-btn-primary !py-2 !px-4 !text-xs"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ─── 8 CATEGORY CARDS GRID ───────────────────────────────────── */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-heading">
                    Learning Categories ({curriculum?.categories.length || 0})
                  </h2>
                  <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    💡 Click any category to auto-scroll to its topics
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {curriculum?.categories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      isSelected={cat.id === selectedCategoryId}
                      onClick={() => handleSelectCategory(cat.id)}
                    />
                  ))}
                </div>
              </div>

              {/* ─── SELECTED CATEGORY MODULES & TOPICS TREE (AUTO SCROLL TARGET) ── */}
              {activeCategory && (
                <div
                  ref={categorySectionRef}
                  className="mosaic-card p-6 space-y-6 text-left border-teal-300 bg-white shadow-md scroll-mt-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md inline-block mb-1">
                        Active Category View
                      </span>
                      <h2 className="text-xl font-extrabold text-[var(--ink-900)] font-heading">
                        {activeCategory.title}
                      </h2>
                      <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                        {activeCategory.description}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
                      {activeCategory.moduleCount} Modules • {activeCategory.topicCount} Topics
                    </span>
                  </div>

                  {/* Modules List */}
                  <div className="space-y-6">
                    {activeCategory.modules.map((module) => (
                      <div
                        key={module.id}
                        className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4"
                      >
                        <div className="border-b border-slate-200/60 pb-3">
                          <h3 className="text-base font-bold text-slate-900 font-heading">
                            {module.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5">{module.description}</p>
                        </div>

                        {/* Topics List under this Module */}
                        <div className="grid md:grid-cols-2 gap-3">
                          {module.topics.map((topic) => (
                            <div
                              key={topic.id}
                              onClick={() => handleSelectTopic(activeCategory, module, topic)}
                              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition cursor-pointer space-y-2 flex flex-col justify-between group"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-semibold ${
                                      topic.difficulty === 'Beginner'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : topic.difficulty === 'Intermediate'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                                    }`}
                                  >
                                    {topic.difficulty}
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3 text-slate-400" />
                                    <span>{topic.estimatedTime}</span>
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition">
                                  {topic.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {topic.description}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-medium">
                                  {topic.resourceCount} Curated Resources{selectedRole.toLowerCase().includes('frontend') || selectedRole.toLowerCase().includes('backend') || selectedRole.toLowerCase().includes('ai') || selectedRole.toLowerCase().includes('machine learning') ? '' : ` (${selectedLanguage})`}
                                </span>
                                <span className="text-teal-700 font-bold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                                  <span>Start Topic</span>
                                  <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </MosaicShell>
  );
}

export default Roadmap;
