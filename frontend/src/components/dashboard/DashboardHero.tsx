import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Layout,
  Server,
  BrainCircuit,
  BarChart3,
  Cloud,
  Smartphone,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Pause,
  Play,
} from 'lucide-react';

export interface CareerRoleItem {
  id: string;
  name: string;
  categoryName: string;
  estimatedTime: string;
  duration: string;
  headline: string;
  description: string;
  skills: string[];
  gradient: string;
  glowColor: string;
  accentColor: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  floatingCard: {
    title: string;
    subtitle: string;
    tag: string;
  };
}

export const CAREER_ROLES: CareerRoleItem[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    categoryName: 'Software Engineer',
    estimatedTime: '6 Months',
    duration: '6 Months',
    headline: 'Architect Scalable Software & CS Systems',
    description:
      'Master Data Structures, Computer Science Core & High-Scalability Distributed System Architecture.',
    skills: ['Java', 'C++', 'DSA Core', 'OS & Concurrency', 'DBMS', 'System Design'],
    gradient: 'from-blue-400 via-indigo-400 to-violet-500',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    accentColor: '#3b82f6',
    badgeBorder: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeLabel: '⚙️ SDE CORE & SYSTEMS',
    image: '/images/hero/software_engineer.png',
    icon: Code,
    floatingCard: {
      title: 'System Architecture',
      subtitle: '8-Step Guided CS Roadmap',
      tag: 'Top Tier Track',
    },
  },
  {
    id: 'frontend-engineer',
    name: 'Frontend Engineer',
    categoryName: 'Frontend Engineer',
    estimatedTime: '4 Months',
    duration: '4 Months',
    headline: 'Craft Pixel-Perfect Web Interfaces',
    description:
      'Build reactive web applications with modern React, Next.js, state architecture, and core browser performance optimization.',
    skills: ['JavaScript ES6+', 'React 18', 'TypeScript', 'Next.js', 'Web Vitals', 'Tailwind CSS'],
    gradient: 'from-cyan-400 via-blue-400 to-indigo-500',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    accentColor: '#06b6d4',
    badgeBorder: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    badgeLabel: '🎨 MODERN UI / UX ARCH',
    image: '/images/hero/frontend_engineer.png',
    icon: Layout,
    floatingCard: {
      title: 'React & Next.js Mastery',
      subtitle: 'Interactive UI Design Systems',
      tag: 'Frontend Focus',
    },
  },
  {
    id: 'backend-engineer',
    name: 'Backend Engineer',
    categoryName: 'Backend Engineer',
    estimatedTime: '5 Months',
    duration: '5 Months',
    headline: 'Build Microservices & High-Throughput APIs',
    description:
      'Architect secure REST & gRPC APIs, distributed databases, caching strategies with Redis, and message queues.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Microservices', 'System Design'],
    gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
    glowColor: 'rgba(160, 185, 129, 0.35)',
    accentColor: '#10b981',
    badgeBorder: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeLabel: '⚡ HIGH-THROUGHPUT APIs',
    image: '/images/hero/backend_engineer.png',
    icon: Server,
    floatingCard: {
      title: 'Distributed Systems',
      subtitle: 'Scalable Microservices Stack',
      tag: 'Backend Mastery',
    },
  },
  {
    id: 'fullstack-engineer',
    name: 'Full Stack Developer',
    categoryName: 'Full Stack Developer',
    estimatedTime: '6 Months',
    duration: '6 Months',
    headline: 'Bridge Frontend Craft & Robust Backend',
    description:
      'Master the complete stack with Next.js, Node.js, relational and document databases, Docker, and full deployment lifecycle.',
    skills: ['React & Next.js', 'Node.js & Express', 'PostgreSQL', 'MongoDB', 'REST & GraphQL', 'Docker & CI/CD'],
    gradient: 'from-teal-400 via-indigo-400 to-purple-500',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    accentColor: '#6366f1',
    badgeBorder: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    badgeLabel: '🌐 COMPLETE FULLSTACK',
    image: '/images/hero/fullstack_engineer.png',
    icon: Globe,
    floatingCard: {
      title: 'End-to-End Apps',
      subtitle: 'Modern Fullstack Architecture',
      tag: 'Fullstack Track',
    },
  },
  {
    id: 'ai-ml-engineer',
    name: 'AI / ML Engineer',
    categoryName: 'AI / ML Engineer',
    estimatedTime: '6 Months',
    duration: '6 Months',
    headline: 'Develop Neural Networks & AI Models',
    description:
      'Train machine learning models, build LLM pipelines with LangChain & RAG, and deploy scalable AI microservices.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs & LangChain', 'RAG Pipelines', 'Computer Vision'],
    gradient: 'from-purple-400 via-fuchsia-400 to-pink-500',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    accentColor: '#a855f7',
    badgeBorder: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeLabel: '🤖 GEN AI & NEURAL NETS',
    image: '/images/hero/ai_ml_engineer.png',
    icon: BrainCircuit,
    floatingCard: {
      title: 'Deep Learning & LLMs',
      subtitle: 'PyTorch & RAG Architectures',
      tag: 'AI Specialist',
    },
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist / Analyst',
    categoryName: 'Data Scientist / Analyst',
    estimatedTime: '4 Months',
    duration: '4 Months',
    headline: 'Turn Big Data Into Strategic Insights',
    description:
      'Perform exploratory data analysis, build predictive statistical models, write complex SQL queries, and design dashboards.',
    skills: ['Python', 'Pandas & NumPy', 'SQL Analytics', 'Statistical Modeling', 'Tableau', 'Snowflake'],
    gradient: 'from-pink-400 via-rose-400 to-purple-500',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    accentColor: '#ec4899',
    badgeBorder: 'border-pink-500/30',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-400',
    badgeLabel: '📊 BIG DATA & ANALYTICS',
    image: '/images/hero/data_scientist.png',
    icon: BarChart3,
    floatingCard: {
      title: 'Predictive Analytics',
      subtitle: 'EDA & Complex SQL Pipelines',
      tag: 'Data Track',
    },
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    categoryName: 'DevOps Engineer',
    estimatedTime: '5 Months',
    duration: '5 Months',
    headline: 'Automate Cloud Infrastructure & CI/CD',
    description:
      'Orchestrate Kubernetes clusters, automate deployment pipelines with Docker & GitHub Actions, and manage IaC.',
    skills: ['Linux Admin', 'Docker', 'Kubernetes', 'Terraform', 'AWS & Cloud', 'CI/CD Pipelines'],
    gradient: 'from-sky-400 via-cyan-400 to-blue-500',
    glowColor: 'rgba(14, 165, 233, 0.35)',
    accentColor: '#0ea5e9',
    badgeBorder: 'border-sky-500/30',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    badgeLabel: '☁️ KUBERNETES & CLOUD',
    image: '/images/hero/devops_engineer.png',
    icon: Cloud,
    floatingCard: {
      title: 'Cloud Infrastructure',
      subtitle: 'Automated CI/CD & Containers',
      tag: 'DevOps Track',
    },
  },
  {
    id: 'mobile-developer',
    name: 'Mobile App Developer',
    categoryName: 'Mobile App Developer',
    estimatedTime: '4 Months',
    duration: '4 Months',
    headline: 'Engineer Native Mobile Applications',
    description:
      'Build reactive, fluid mobile applications for iOS & Android with Flutter, React Native, state management, and offline storage.',
    skills: ['Dart', 'Flutter', 'React Native', 'Kotlin / Swift', 'BLoC / Redux', 'App Publishing'],
    gradient: 'from-amber-400 via-orange-400 to-blue-500',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    accentColor: '#f97316',
    badgeBorder: 'border-orange-500/30',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    badgeLabel: '📱 CROSS-PLATFORM MOBILE',
    image: '/images/hero/mobile_developer.png',
    icon: Smartphone,
    floatingCard: {
      title: 'iOS & Android Apps',
      subtitle: 'Flutter & Native Integrations',
      tag: 'Mobile Focus',
    },
  },
  {
    id: 'cybersecurity-engineer',
    name: 'Cybersecurity Engineer',
    categoryName: 'Cybersecurity Engineer',
    estimatedTime: '6 Months',
    duration: '6 Months',
    headline: 'Fortify Systems & Protect Networks',
    description:
      'Master network defense, penetration testing, OWASP security protocols, vulnerability analysis, and encryption.',
    skills: ['Linux Security', 'Network Defense', 'OWASP Top 10', 'Penetration Testing', 'Cryptography', 'SIEM Tools'],
    gradient: 'from-rose-400 via-red-500 to-purple-600',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    accentColor: '#f43f5e',
    badgeBorder: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeLabel: '🛡️ SECURITY & PENTESTING',
    image: '/images/hero/cybersecurity_engineer.png',
    icon: ShieldCheck,
    floatingCard: {
      title: 'System Defense',
      subtitle: 'Penetration & Network Security',
      tag: 'Security Track',
    },
  },
];

interface DashboardHeroProps {
  onStartRole?: (categoryName: string) => void;
}

export function DashboardHero({ onStartRole }: DashboardHeroProps) {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const isPaused = isManualPaused || isHovered;

  // Auto transition every 4 seconds (4000ms) with clean setTimeout and timer reset
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      setDirection(1);
      setActiveSlide((prev) => (prev + 1) % CAREER_ROLES.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isPaused, activeSlide]);

  const handleNext = () => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % CAREER_ROLES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + CAREER_ROLES.length) % CAREER_ROLES.length);
  };

  const handleSelectRole = (idx: number) => {
    setDirection(idx > activeSlide ? 1 : -1);
    setActiveSlide(idx);
  };

  const currentRole = CAREER_ROLES[activeSlide];
  const IconComp = currentRole.icon;

  const handleStart = () => {
    if (onStartRole) {
      onStartRole(currentRole.categoryName);
    } else {
      navigate(`/roadmaps?role=${encodeURIComponent(currentRole.categoryName)}`);
    }
  };

  return (
    <section
      className="relative rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl overflow-hidden transition-all duration-700 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Atmospheric Lighting (Layer 2) */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[35rem] h-[35rem] rounded-full blur-[110px] pointer-events-none transition-all duration-1000"
        style={{ background: currentRole.glowColor }}
      />
      <motion.div
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -right-32 w-[35rem] h-[35rem] rounded-full blur-[110px] pointer-events-none transition-all duration-1000"
        style={{ background: currentRole.glowColor }}
      />

      {/* Subtle Tech Grid overlay */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Content Carousel Grid */}
      <div className="relative z-10 p-6 sm:p-8 md:p-12 min-h-[460px] flex flex-col justify-between">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentRole.id}
            initial={{ opacity: 0, x: direction * 28, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 28, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold ${currentRole.badgeBg} ${currentRole.badgeText} border ${currentRole.badgeBorder} tracking-wide shadow-sm backdrop-blur-md`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  PREMIUM CAREER PATHWAY
                </span>
                <span className="text-xs text-slate-300 font-semibold flex items-center bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Est. {currentRole.estimatedTime}
                </span>
                {isPaused && (
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center animate-pulse backdrop-blur-md">
                    <Pause className="w-3 h-3 mr-1" /> PAUSED
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div className="min-h-[90px] flex items-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-none text-white">
                    Become a Master{' '}
                    <span
                      className={`bg-clip-text text-transparent bg-gradient-to-r ${currentRole.gradient}`}
                    >
                      {currentRole.name}
                    </span>
                  </h1>
                </div>
                <div className="min-h-[48px] flex items-center">
                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
                    {currentRole.description}
                  </p>
                </div>
              </div>

              {/* Skill Tags */}
              <div className="min-h-[36px] flex flex-wrap items-center gap-2 pt-1">
                {currentRole.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 text-slate-200 border border-slate-800/80 shadow-inner hover:border-purple-500/40 hover:text-white transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Button & Supporting Info */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleStart}
                  className={`group inline-flex items-center px-7 py-3.5 rounded-2xl text-sm font-extrabold text-white shadow-xl bg-gradient-to-r ${currentRole.gradient} hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-purple-500/20 hover:shadow-purple-500/40`}
                >
                  <span>Start Learning Path</span>
                  <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/70 px-4 py-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">Structured 8-Step Mentor Pathway</span>
                </div>
              </div>
            </div>

            {/* Right Column: LIVING FUTURISTIC CAREER DISPLAY FRAME */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              {/* Outer Career-Aware Ambient Glow Aura */}
              <div
                className="absolute -inset-3 rounded-3xl blur-3xl opacity-50 transition-all duration-700 pointer-events-none"
                style={{ background: currentRole.glowColor }}
              />

              {/* Futuristic Visual Display Frame */}
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl p-[1px] bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 shadow-2xl overflow-hidden group">
                {/* Inner Glass Container (Tight Padding for 90-95% Visual Area Coverage) */}
                <div className="w-full h-full rounded-[23px] bg-slate-950/85 backdrop-blur-xl overflow-hidden relative flex items-center justify-center p-1.5">
                  {/* Dynamic Inner Accent Lighting Glow */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-700 blur-2xl"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${currentRole.glowColor}, transparent 70%)`,
                    }}
                  />

                  {/* Futuristic Background Tech Grid */}
                  <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#475569_1px,transparent_1px),linear-gradient(to_bottom,#475569_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />

                  {/* Light Sweep Reflection Sheen */}
                  <motion.div
                    className="absolute -inset-full w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                  />

                  {/* Main 3D Technical Artwork Image (Fills 90-95% of Container) */}
                  <motion.img
                    src={currentRole.image}
                    alt={currentRole.name}
                    className="relative z-10 w-full h-full object-cover rounded-[18px] filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] pb-11"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Static Top-Right Role Track Badge (NO Blinking / Pulse Animation) */}
                  <div className="absolute top-3.5 right-3.5 z-20 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-md backdrop-blur-md text-[9px] font-mono font-bold text-slate-300 tracking-wider uppercase">
                    EST. {currentRole.estimatedTime}
                  </div>

                  {/* Compact Bottom Glass Information Panel (20-25% Height) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="absolute bottom-2.5 left-2.5 right-2.5 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-950/92 border border-slate-800/90 backdrop-blur-xl flex items-center justify-between shadow-2xl"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gradient-to-r ${currentRole.gradient} text-white shadow-md shrink-0`}
                      >
                        <IconComp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-xs font-bold text-white leading-tight truncate">
                          {currentRole.floatingCard.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                          {currentRole.floatingCard.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-900/90 text-purple-300 border border-purple-500/30 shadow-inner shrink-0 ml-2">
                      {currentRole.floatingCard.tag.toUpperCase()}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation & Controls Bar */}
        <div className="mt-8 pt-4 border-t border-slate-900/90 flex flex-col space-y-4">
          {/* Centered Dot Pagination Indicators */}
          <div className="flex items-center justify-center space-x-2">
            {CAREER_ROLES.map((role, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(idx)}
                  className={`transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-8 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md shadow-purple-500/50'
                      : 'w-2.5 h-2.5 rounded-full bg-slate-700/80 hover:bg-slate-500'
                  }`}
                  title={role.name}
                />
              );
            })}
          </div>

          {/* Role Navigation Text Pills & Action Arrows */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Role Pills Row */}
            <div className="flex items-center flex-wrap justify-center gap-2">
              {CAREER_ROLES.map((role, idx) => {
                const isActive = activeSlide === idx;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(idx)}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center space-x-2 ${
                      isActive
                        ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20 backdrop-blur-md font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-all ${
                        isActive ? 'animate-pulse' : 'bg-slate-600'
                      }`}
                      style={{
                        backgroundColor: isActive ? role.accentColor : undefined,
                        boxShadow: isActive ? `0 0 10px ${role.accentColor}` : undefined,
                      }}
                    />
                    <span>{role.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={() => setIsManualPaused((prev) => !prev)}
                className="p-2.5 rounded-full border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isManualPaused ? 'Resume Carousel' : 'Pause Carousel'}
              >
                {isManualPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous Career Role"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 hover:scale-105 transition-all cursor-pointer"
                title="Next Career Role"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
