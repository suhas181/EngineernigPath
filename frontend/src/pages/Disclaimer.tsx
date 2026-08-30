import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Cpu, Briefcase, FileCheck, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import { siteConfig } from '../config/siteConfig';

export function Disclaimer() {
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
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10 w-full text-slate-300 text-sm md:text-base leading-relaxed">
        {/* Header */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Important Disclaimers</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-heading tracking-tight">
            Platform Disclaimer
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: {siteConfig.legal.lastUpdated}
          </p>
        </section>

        {/* 1. Educational Guidance & No Employment Guarantees */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-teal-400" />
            <span>1. No Employment or Placement Guarantees</span>
          </h2>
          <p className="text-xs md:text-sm">
            EngineerPath is an educational learning framework designed to guide student self-study, project development, and skill tracking. EngineerPath is not a recruitment agency, employer, or hiring intermediary. We do not guarantee job offers, internship placements, interview invitations, or salary benchmarks.
          </p>
        </section>

        {/* 2. AI-Generated Roadmaps & Recommendations */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span>2. AI-Generated Career Content & Guidance</span>
          </h2>
          <p className="text-xs md:text-sm">
            Roadmap suggestions, project recommendations, and study milestone timelines are generated using algorithmic analysis and AI language models. While designed to reflect industry trends:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs md:text-sm pl-2">
            <li>AI-generated guidance is strictly informational and advisory.</li>
            <li>Users should cross-reference curriculum plans with university syllabus guidelines and specific employer job postings.</li>
            <li>EngineerPath does not represent that any single learning path guarantees qualification for a specific corporate role.</li>
          </ul>
        </section>

        {/* 3. Resume Analyzer & ATS Score Estimates */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-blue-400" />
            <span>3. ATS Compatibility Scoring Estimates</span>
          </h2>
          <p className="text-xs md:text-sm">
            Resume scores produced by the Resume Analyzer are heuristic estimations based on industry keyword density, section structuring, and parsing clarity. Different enterprise applicant tracking systems (such as Workday, Greenhouse, Taleo, or Lever) utilize proprietary ranking algorithms that may evaluate resumes differently. A high score on EngineerPath does not ensure selection by any third-party employer.
          </p>
        </section>

        {/* 4. External Internship Listings & Third-Party Accuracy */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span>4. Third-Party Internship Data & Expirations</span>
          </h2>
          <p className="text-xs md:text-sm">
            Internship listings are retrieved from external APIs and job feeds. Listing availability, deadlines, job descriptions, and eligibility criteria can change rapidly or expire without notice. EngineerPath cannot warrant the real-time accuracy of external employer postings. Users must verify all requirements on the original company careers site before applying.
          </p>
        </section>

        {/* Contact info */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs md:text-sm">
          <h3 className="font-bold text-white text-sm">Questions or Feedback</h3>
          <p>
            For questions regarding this disclaimer, please reach out to us at{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-teal-400 hover:underline font-medium">
              {siteConfig.contactEmail}
            </a>.
          </p>
        </section>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}

export default Disclaimer;
