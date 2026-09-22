import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, FileText, Briefcase, Zap, CheckCircle2, Shield, Linkedin } from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { siteConfig } from '../config/siteConfig';

export function About() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'About EngineerPath | Founded by Suhas H S';

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    const prevDesc = metaDescription ? metaDescription.getAttribute('content') : null;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      'Learn about EngineerPath, an AI-powered career guidance platform for engineering students, founded by Suhas H S.'
    );

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = canonical ? canonical.getAttribute('href') : null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://engineerpath.me/about');

    // Open Graph & Twitter meta tags
    const metaTagsConfig = [
      { attr: 'property', name: 'og:title', content: 'About EngineerPath | Founded by Suhas H S' },
      {
        attr: 'property',
        name: 'og:description',
        content:
          'Learn about EngineerPath, an AI-powered career guidance platform for engineering students, founded by Suhas H S.',
      },
      { attr: 'property', name: 'og:url', content: 'https://engineerpath.me/about' },
      { attr: 'name', name: 'twitter:title', content: 'About EngineerPath | Founded by Suhas H S' },
      {
        attr: 'name',
        name: 'twitter:description',
        content:
          'Learn about EngineerPath, an AI-powered career guidance platform for engineering students, founded by Suhas H S.',
      },
    ];

    const elementsToCleanup: { element: Element; prevContent: string | null; isNew: boolean }[] = [];

    metaTagsConfig.forEach(({ attr, name, content }) => {
      const tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (tag) {
        elementsToCleanup.push({
          element: tag,
          prevContent: tag.getAttribute('content'),
          isNew: false,
        });
        tag.setAttribute('content', content);
      } else {
        const newTag = document.createElement('meta');
        newTag.setAttribute(attr, name);
        newTag.setAttribute('content', content);
        document.head.appendChild(newTag);
        elementsToCleanup.push({
          element: newTag,
          prevContent: null,
          isNew: true,
        });
      }
    });

    return () => {
      document.title = prevTitle;
      if (prevDesc !== null) {
        metaDescription?.setAttribute('content', prevDesc);
      } else {
        metaDescription?.remove();
      }
      if (prevCanonical !== null) {
        canonical?.setAttribute('href', prevCanonical);
      } else {
        canonical?.remove();
      }
      elementsToCleanup.forEach(({ element, prevContent, isNew }) => {
        if (isNew) {
          element.remove();
        } else if (prevContent !== null) {
          element.setAttribute('content', prevContent);
        }
      });
    };
  }, []);

  const pillars = [
    {
      icon: <Compass className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
      title: 'Personalized Career Roadmaps',
      description:
        'Structured, step-by-step technical learning paths across software engineering, AI/ML, DevOps, and web development tailored to your semester and goals.',
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      title: 'Automated Resume Intelligence',
      description:
        'Deterministic ATS compatibility analysis, keyword benchmarking, and targeted suggestions to help you present your projects and skills effectively.',
    },
    {
      icon: <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Real-Time Internship Sync',
      description:
        'Regularly synchronized student internships and trainee opportunities from verified sources with live status and requirement tracking.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#101826] text-slate-900 dark:text-white font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0B101B]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-slate-900 dark:text-white font-heading font-extrabold text-lg tracking-tight hover:text-teal-600 dark:hover:text-teal-400 transition"
          >
            <div className="p-1.5 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 dark:border-teal-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <span>
              Engineer<span className="text-teal-600 dark:text-teal-400">Path</span>
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/5 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>About EngineerPath</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Navigating the Journey from College to Career
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {siteConfig.description}
          </p>
        </section>

        {/* Mission Statement */}
        <section className="p-6 md:p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Our Purpose</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            Engineering curricula often leave students uncertain about how theoretical coursework translates to modern industry requirements. EngineerPath bridges this gap by offering a cohesive suite of tools that help students track skill progression, validate resume readiness, schedule study goals, and identify relevant entry-level opportunities.
          </p>
        </section>

        {/* Meet the Founder */}
        <section
          id="suhas-h-s"
          className="p-6 md:p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold mb-2">
                <span>Meet the Founder</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
                Suhas H S
              </h2>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                Founder &amp; Developer, EngineerPath
              </p>
            </div>
            <div>
              <a
                href="https://www.linkedin.com/in/suhas-h-s-78a34b296/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs md:text-sm font-medium transition shadow-sm hover:shadow"
              >
                <Linkedin className="h-4 w-4 fill-current" />
                <span>Connect with Suhas on LinkedIn</span>
              </a>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            EngineerPath was founded by Suhas H S to help engineering students navigate the journey from college to their first career opportunity. The platform focuses on practical skill development, career roadmaps, internships, projects, resume preparation, and placement readiness.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-heading text-center">
            What EngineerPath Provides
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-white/10 hover:border-teal-500/30 transition shadow-sm flex flex-col space-y-3"
              >
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 w-fit">
                  {pillar.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{pillar.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Commitment to Truthfulness */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span>Honest & Realistic Guidance</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
