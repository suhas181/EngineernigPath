import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import {
  Code,
  Layout,
  Server,
  BrainCircuit,
  BarChart3,
  Cloud,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Compass,
  Building2,
  BookMarked,
  Target,
  Layers,
  Award,
} from 'lucide-react';

interface CareerRoleItem {
  id: string;
  name: string;
  categoryName: string;
  icon: any;
  salary: string;
  duration: string;
  skills: string[];
  description: string;
  gradient: string;
  glowColor: string;
  illustrationBadge: string;
}

const CAREER_ROLES: CareerRoleItem[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    categoryName: 'Software Engineer (SDE)',
    icon: Code,
    salary: '$125,000 / yr (₹18 - 45 LPA)',
    duration: '6 Months',
    skills: ['Java', 'C++', 'DSA', 'OS', 'DBMS', 'System Design'],
    description: 'Master Data Structures, Computer Science Core & High-Scalability System Architecture.',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    illustrationBadge: '⚙️ SDE CORE',
  },
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineer',
    categoryName: 'Frontend Engineer',
    icon: Layout,
    salary: '$115,000 / yr (₹14 - 38 LPA)',
    duration: '4 Months',
    skills: ['JS ES6+', 'React', 'Next.js', 'Web Vitals', 'CSS Grid'],
    description: 'Architect next-generation web interfaces with lightning-fast rendering and pixel-perfect UIs.',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    illustrationBadge: '🎨 UI / UX ARCH',
  },
  {
    id: 'backend-engineer',
    name: 'Backend Engineer',
    categoryName: 'Backend Engineer',
    icon: Server,
    salary: '$120,000 / yr (₹16 - 42 LPA)',
    duration: '5 Months',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'System Design'],
    description: 'Build bulletproof microservices, high-throughput REST/gRPC APIs, and distributed databases.',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    illustrationBadge: '⚡ DISTRIBUTED API',
  },
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    categoryName: 'AI / ML Engineer',
    icon: BrainCircuit,
    salary: '$140,000 / yr (₹22 - 60 LPA)',
    duration: '6 Months',
    skills: ['Python', 'PyTorch', 'Scikit-Learn', 'LangChain', 'RAG'],
    description: 'Develop neural networks, Large Language Models (LLMs), and intelligent generative AI systems.',
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    illustrationBadge: '🤖 GEN AI & LLMS',
  },
  {
    id: 'flutter-developer',
    name: 'Flutter Developer',
    categoryName: 'Mobile App Developer',
    icon: Smartphone,
    salary: '$112,000 / yr (₹14 - 36 LPA)',
    duration: '4 Months',
    skills: ['Dart', 'Flutter', 'Kotlin', 'SwiftUI', 'BLoC / Redux'],
    description: 'Craft fluid, native-performance mobile applications for iOS & Android from a single codebase.',
    gradient: 'from-teal-400 via-emerald-500 to-green-600',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    illustrationBadge: '📱 CROSS-PLATFORM',
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    categoryName: 'DevOps Engineer',
    icon: Cloud,
    salary: '$130,000 / yr (₹18 - 50 LPA)',
    duration: '5 Months',
    skills: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'AWS'],
    description: 'Automate CI/CD pipelines, container orchestration clusters, and cloud infrastructure as code.',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    glowColor: 'rgba(14, 165, 233, 0.25)',
    illustrationBadge: '☁️ K8S & CLOUD',
  },
  {
    id: 'cybersecurity-engineer',
    name: 'Cybersecurity Engineer',
    categoryName: 'Software Engineer',
    icon: ShieldCheck,
    salary: '$135,000 / yr (₹20 - 55 LPA)',
    duration: '6 Months',
    skills: ['Linux Admin', 'Network Security', 'OWASP Top 10', 'Cryptography'],
    description: 'Fortify cloud infrastructure, perform penetration testing, and defend applications against vulnerabilities.',
    gradient: 'from-red-500 via-rose-600 to-pink-600',
    glowColor: 'rgba(225, 29, 72, 0.25)',
    illustrationBadge: '🛡️ SECURITY & PENTEST',
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    categoryName: 'Data Scientist / Analyst',
    icon: BarChart3,
    salary: '$110,000 / yr (₹12 - 35 LPA)',
    duration: '4 Months',
    skills: ['Python', 'Pandas', 'SQL Window Functions', 'Seaborn', 'Snowflake'],
    description: 'Transform raw big data into strategic business intelligence, predictive models, and EDA reports.',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-600',
    glowColor: 'rgba(147, 51, 234, 0.25)',
    illustrationBadge: '📊 BIG DATA & SQL',
  },
];

interface SavedTopicInfo {
  role: string;
  category: string;
  module: string;
  topic: string;
  topicId: string;
}

interface SavedResourceItem {
  id: string;
  title: string;
  provider: string;
  type: string;
  url: string;
}

interface CareerOpportunity {
  id: string;
  company: string;
  title: string;
  stipend: string;
  deadline: string;
  tag: string;
  url: string;
}

const CAREER_OPPORTUNITIES: CareerOpportunity[] = [
  {
    id: 'gsoc-2026',
    company: 'Google Open Source',
    title: 'Google Summer of Code (GSoC) 2026',
    stipend: '$1,500 – $3,300 Stipend',
    deadline: 'March 2026',
    tag: 'Global Open Source',
    url: 'https://summerofcode.withgoogle.com/',
  },
  {
    id: 'google-swe-intern',
    company: 'Google Careers',
    title: 'Software Engineering Summer Intern 2026',
    stipend: 'Industry Top Tier + Relocation',
    deadline: 'Applications Open',
    tag: 'Summer Internship',
    url: 'https://careers.google.com/students/',
  },
  {
    id: 'microsoft-step',
    company: 'Microsoft',
    title: 'Microsoft STEP Internship 2026',
    stipend: 'Exploratory Tech Stipend',
    deadline: 'Open Now',
    tag: 'Early Career',
    url: 'https://careers.microsoft.com/students/us/en',
  },
  {
    id: 'amazon-ml-school',
    company: 'Amazon AI',
    title: 'Amazon ML Summer School 2026',
    stipend: 'Free Certificate & Mentorship',
    deadline: 'Open Now',
    tag: 'AI BootCamp',
    url: 'https://www.amazon.science/academic-relations/amazon-ml-summer-school',
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const [recentResources] = useState<SavedResourceItem[]>(() => {
    const saved = localStorage.getItem('engineerpath_recent_resources');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'res-1',
        title: '⭐ Striver A2Z DSA Master Practice Sheet',
        provider: 'takeUforward',
        type: 'practice',
        url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
      },
      {
        id: 'res-2',
        title: 'Corey Schafer: Python Beginner & OOP Masterclass',
        provider: 'Corey Schafer',
        type: 'video',
        url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXvwh68gCdW0LVc',
      },
      {
        id: 'res-3',
        title: 'React.dev: Official Documentation & Interactive Guide',
        provider: 'Meta Open Source',
        type: 'article',
        url: 'https://react.dev/learn',
      },
    ];
  });

  // Auto-advance Hero Carousel every 5 seconds (5000ms infinite loop)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAREER_ROLES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleStartRole = (categoryName: string) => {
    navigate(`/roadmaps?role=${encodeURIComponent(categoryName)}`);
  };

  const currentRoleSlide = CAREER_ROLES[activeSlide];
  const IconComponent = currentRoleSlide.icon;

  return (
    <MosaicShell>
      <div className="space-y-10 pb-16 text-left">
        {/* ==================== SECTION 1: RICH HERO CAROUSEL ==================== */}
        <section
          className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl overflow-hidden transition-all duration-700"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Soft Radial Glow */}
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-40"
            style={{ background: currentRoleSlide.glowColor }}
          />

          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 items-center min-h-[420px]">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  PREMIUM CAREER PATHWAY
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Est. {currentRoleSlide.duration}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                  Become a Master{' '}
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${currentRoleSlide.gradient}`}>
                    {currentRoleSlide.name}
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                  {currentRoleSlide.description}
                </p>
              </div>

              {/* Skills Covered Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {currentRoleSlide.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-inner"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action & Salary CTA Bar */}
              <div className="pt-4 flex flex-wrap items-center gap-5">
                <button
                  onClick={() => handleStartRole(currentRoleSlide.categoryName)}
                  className={`inline-flex items-center px-7 py-4 rounded-2xl text-sm font-extrabold text-white shadow-xl bg-gradient-to-r ${currentRoleSlide.gradient} hover:opacity-95 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200`}
                >
                  Start Learning Path
                  <ArrowRight className="w-4 h-4 ml-2.5" />
                </button>
                <div className="text-xs text-slate-400 font-medium">
                  Average Compensation:{' '}
                  <strong className="text-white font-bold ml-1">{currentRoleSlide.salary}</strong>
                </div>
              </div>
            </div>

            {/* Right Large 3D Illustration Card */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-sm aspect-square rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-8 flex flex-col justify-between items-center text-center shadow-2xl backdrop-blur-md group">
                <div className="absolute top-4 right-4 text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  {currentRoleSlide.illustrationBadge}
                </div>

                <div className="my-auto space-y-5">
                  <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center bg-gradient-to-tr ${currentRoleSlide.gradient} shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500`}>
                    <IconComponent className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{currentRoleSlide.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Guided 8-Step Mentor Learning Flow
                    </p>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Structured Path</span>
                  <span className="text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                    Verified Resources
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Footer Navigation Bar */}
          <div className="relative z-10 px-8 py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {CAREER_ROLES.map((role, idx) => (
                <button
                  key={role.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    activeSlide === idx ? 'w-10 bg-blue-500 shadow-md shadow-blue-500/50' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={role.name}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + CAREER_ROLES.length) % CAREER_ROLES.length)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % CAREER_ROLES.length)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== 4 QUICK STATISTICS BADGES ==================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 font-bold">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">80+</div>
              <div className="text-xs font-semibold text-slate-500">Structured Topics</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">1200+</div>
              <div className="text-xs font-semibold text-slate-500">Practice Problems</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">500+</div>
              <div className="text-xs font-semibold text-slate-500">Curated Resources</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">8</div>
              <div className="text-xs font-semibold text-slate-500">Career Paths</div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: CHOOSE YOUR CAREER PATH (LIGHT CANVAS) ==================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Choose Your Career Path</h2>
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
                  className="group relative rounded-2xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 cursor-pointer text-left"
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
                    <span className="text-slate-500 font-semibold">{role.salary.split('(')[0]}</span>
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

        {/* ==================== SECTION 3: CONTINUE LEARNING (LIGHT CANVAS) ==================== */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Continue Learning</h2>

          {activeTopicInfo ? (
            <div className="relative rounded-2xl border border-blue-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
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
                className="w-full md:w-auto px-7 py-4 rounded-2xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
              >
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
              <Compass className="w-12 h-12 text-blue-600 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Choose Your First Learning Path</h3>
                <p className="text-xs text-slate-500">
                  Select a career role above to start your guided 8-step engineering journey.
                </p>
              </div>
              <button
                onClick={() => navigate('/roadmaps')}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Browse Career Paths
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          )}
        </section>

        {/* ==================== SECTION 4: RECENTLY OPENED RESOURCES (LIGHT CANVAS) ==================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recently Opened Resources</h2>
            <span className="text-xs text-slate-500 font-semibold">Direct Access</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentResources.map((res) => {
              const ResourceIcon =
                res.type === 'video' ? PlayCircle : res.type === 'article' ? BookOpen : FileCheck;
              return (
                <div
                  key={res.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <ResourceIcon className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                        {res.provider}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {res.title}
                    </h4>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium capitalize">{res.type} Resource</span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      Open Again
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================== SECTION 5: LATEST CAREER OPPORTUNITIES (LIGHT CANVAS) ==================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Latest Career Opportunities</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Top internships, open-source programs, and hiring challenges.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              Verified Open Opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAREER_OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                      {opp.company}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      {opp.tag}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{opp.stipend}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Deadline: {opp.deadline}</span>
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    Apply / Details
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MosaicShell>
  );
}

export default Dashboard;
