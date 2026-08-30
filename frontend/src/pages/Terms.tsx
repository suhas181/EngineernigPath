import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, ShieldAlert, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import { siteConfig } from '../config/siteConfig';

export function Terms() {
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-heading tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: {siteConfig.legal.lastUpdated}
          </p>
        </section>

        {/* 1. Acceptance of Terms */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-teal-400" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-xs md:text-sm">
            By accessing or using the EngineerPath platform (&ldquo;EngineerPath&rdquo;, &ldquo;we&rdquo;, or &ldquo;the service&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the platform.
          </p>
        </section>

        {/* 2. Educational Scope & No Employment Guarantee */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <span>2. Educational Purpose & No Placement Guarantees</span>
          </h2>
          <p className="text-xs md:text-sm">
            EngineerPath is provided solely as an educational preparation, career roadmap, and learning utility. While our curriculum paths, ATS score estimates, and internship aggregations are designed to assist student learning:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs md:text-sm pl-2">
            <li>
              EngineerPath does not guarantee job placement, interview invitations, internship offers, or specific compensation outcomes.
            </li>
            <li>
              ATS compatibility scores are automated heuristic estimates and do not represent internal recruitment decisions of third-party employers.
            </li>
            <li>
              Users remain solely responsible for applying, interviewing, and verifying requirements with prospective employers.
            </li>
          </ul>
        </section>

        {/* 3. Account Responsibilities & Acceptable Use */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading">
            3. Account Responsibilities & Acceptable Use
          </h2>
          <div className="space-y-3 text-xs md:text-sm">
            <p>
              When creating an account, you agree to provide truthful information. You are responsible for safeguarding your login credentials.
            </p>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Upload malicious files, scripts, or corrupted documents to the Resume Analyzer.</li>
              <li>Attempt to gain unauthorized access to administrative APIs, other student accounts, or backend infrastructure.</li>
              <li>Scrape, overload, or disrupt the platform via automated scripts or denial-of-service attempts.</li>
            </ul>
          </div>
        </section>

        {/* 4. External Links & Third-Party Listings */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading">
            4. External Internship Opportunities & Third-Party Links
          </h2>
          <p className="text-xs md:text-sm">
            Internship listings and external learning resources link to third-party domains (including employers, job boards, and documentation providers). EngineerPath is not responsible for the content, privacy policies, expiration dates, or hiring practices of third-party websites. Users should verify details directly on the original employer portal.
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <span>5. Limitation of Liability</span>
          </h2>
          <p className="text-xs md:text-sm">
            EngineerPath is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis without warranties of any kind, whether express or implied. In no event shall EngineerPath or its contributors be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform.
          </p>
        </section>

        {/* 6. Changes & Contact */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs md:text-sm">
          <h3 className="font-bold text-white text-sm">6. Contact & Updates</h3>
          <p>
            We may update these terms periodically. Continued use of the platform constitutes acceptance of revised terms. For questions, reach out to{' '}
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

export default Terms;
