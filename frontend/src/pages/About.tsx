import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, FileText, Briefcase, Zap, CheckCircle2, Shield } from 'lucide-react';
import Footer from '../components/Footer';
import { siteConfig } from '../config/siteConfig';

export function About() {
  const pillars = [
    {
      icon: <Compass className="h-6 w-6 text-teal-400" />,
      title: 'Personalized Career Roadmaps',
      description:
        'Structured, step-by-step technical learning paths across software engineering, AI/ML, DevOps, and web development tailored to your semester and goals.',
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-400" />,
      title: 'Automated Resume Intelligence',
      description:
        'Deterministic ATS compatibility analysis, keyword benchmarking, and targeted suggestions to help you present your projects and skills effectively.',
    },
    {
      icon: <Briefcase className="h-6 w-6 text-blue-400" />,
      title: 'Real-Time Internship Sync',
      description:
        'Regularly synchronized student internships and trainee opportunities from verified sources with live status and requirement tracking.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#101826] text-white font-sans">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0B101B]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-white font-heading font-extrabold text-lg tracking-tight hover:text-teal-400 transition"
          >
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <span>
              Engineer<span className="text-teal-400">Path</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs md:text-sm font-medium text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>About EngineerPath</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white font-heading tracking-tight">
            Navigating the Journey from College to Career
          </h1>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {siteConfig.description}
          </p>
        </section>

        {/* Mission Statement */}
        <section className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-bold text-white font-heading">Our Purpose</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Engineering curricula often leave students uncertain about how theoretical coursework translates to modern industry requirements. EngineerPath bridges this gap by offering a cohesive suite of tools that help students track skill progression, validate resume readiness, schedule study goals, and identify relevant entry-level opportunities.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-white font-heading text-center">
            What EngineerPath Provides
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0D131F] border border-white/10 hover:border-teal-500/30 transition flex flex-col space-y-3"
              >
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit">
                  {pillar.icon}
                </div>
                <h3 className="font-bold text-white text-base">{pillar.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed flex-1">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Commitment to Truthfulness */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 space-y-3">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-teal-400" />
            <span>Honest & Realistic Guidance</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            EngineerPath is designed as an educational assistant. We provide data-informed skill maps, deterministic ATS scoring formulas, and aggregated internship feeds to empower your preparation. We do not make exaggerated placement claims or guarantee employment outcomes—your consistency, technical practice, and portfolio building drive your success.
          </p>
        </section>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}

export default About;
