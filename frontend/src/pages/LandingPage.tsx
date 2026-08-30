import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, FileText, Briefcase, MessageSquare, ArrowRight, Zap, Check, X, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '../components/mosaic/Badge';
import Footer from '../components/Footer';

export function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const features = [
    {
      icon: <Compass className="h-6 w-6 text-teal-400" />,
      title: 'Personalized Roadmaps',
      description: 'AI-generated step-by-step learning paths tailored to your specific career goals.',
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-400" />,
      title: 'AI Resume Analyzer',
      description: 'Upload your resume and get an instant ATS score review with actionable suggestions.',
    },
    {
      icon: <Briefcase className="h-6 w-6 text-blue-400" />,
      title: 'Job & Skill Sync',
      description: 'Discover verified jobs and live skill gap metrics linked directly to your profile.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-emerald-400" />,
      title: 'AI Career Assistant',
      description: 'Get 24/7 career advice, project ideas, and interview strategy recommendations.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#101826] text-white font-sans overflow-x-hidden">
      
      {/* Navbar Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            Engineer<span className="text-teal-400">Path</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="mosaic-btn-brand">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/signup" className="mosaic-btn-brand">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ─── 1. DARK HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge tone="brand" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              MosaicMove OS • Unifying Career Framework
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading leading-tight tracking-tight text-white"
          >
            Orchestrates and delivers your path from{' '}
            <span className="text-gradient">College to Placement</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal"
          >
            EngineerPath is the complete case-management style career platform designed for engineering students.
            Track roadmap milestones, analyze ATS resume scores, and schedule important interview dates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            {isAuthenticated ? (
              <Link to="/dashboard" className="mosaic-btn-brand !py-3 !px-7 !text-base">
                <span>Enter Workspace</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="mosaic-btn-brand !py-3 !px-7 !text-base">
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/dashboard" className="mosaic-btn-outline !py-3 !px-7 !text-base">
                  <span>Explore Platform</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Hero Graphic Card */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="mosaic-card-dark p-8 space-y-6 max-w-md w-full text-left relative z-10 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Career Sync</span>
              </div>
              <Badge tone="success">94% Placement Rate</Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>React & Node.js Mastery</span>
                  <span className="text-teal-400">82% Complete</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full w-[82%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">ATS Resume Audit</span>
                  <span className="text-[10px] text-slate-400">Targeting Product Frontend Engineer</span>
                </div>
                <span className="text-sm font-extrabold text-purple-400 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30">
                  88 / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. LIGHT COMPARISON SECTION ───────────────────────────────────── */}
      <section className="py-20 bg-[var(--page-bg)] text-[var(--ink-700)]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge tone="brand">Comparison Framework</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--ink-900)] font-heading">
              Why Engineers Choose EngineerPath
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Replace fragmented spreadsheets and generic job boards with a unified career management dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Generic Approach Card */}
            <div className="mosaic-card p-8 space-y-6 text-left border-rose-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <X className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Traditional Preparation</h3>
                  <p className="text-xs text-slate-500">Unstructured & Reactive</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start space-x-3">
                  <X className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Random YouTube playlists with no skill verification.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Submitting resumes without knowing if ATS will parse them.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Missing important interview dates and application deadlines.</span>
                </li>
              </ul>
            </div>

            {/* EngineerPath Approach Card */}
            <div className="mosaic-card p-8 space-y-6 text-left border-teal-300 bg-white shadow-md relative overflow-hidden">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">EngineerPath MosaicMove</h3>
                  <p className="text-xs text-teal-700 font-semibold">Structured & Proven</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Verified step-by-step roadmaps with progress tracking.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Instant ATS feedback with keyword optimization.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>Interactive calendar planner with streak achievement tracking.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. FEATURE SHOWCASE ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#101826] text-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge tone="purple">Core Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-heading">
              Everything You Need for Career Mastery
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="mosaic-card-dark p-6 space-y-4 text-left border border-white/10 hover:border-teal-500/40 transition"
              >
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 inline-block">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white font-heading">{f.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
