import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Database, Cloud, Lock, FileText, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import { siteConfig } from '../config/siteConfig';

export function PrivacyPolicy() {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-heading tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: {siteConfig.legal.lastUpdated}
          </p>
        </section>

        {/* Introduction */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <Lock className="h-5 w-5 text-teal-400" />
            <span>1. Overview & Commitment</span>
          </h2>
          <p>
            EngineerPath (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;) is an open educational and career roadmap platform for engineering students. We believe in transparency and data minimization. This Privacy Policy details the exact types of information we collect, how it is used to deliver platform functionality, and the third-party infrastructure providers involved in service delivery.
          </p>
        </section>

        {/* Information Collected */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-400" />
            <span>2. Information We Collect</span>
          </h2>
          <div className="space-y-3 text-xs md:text-sm">
            <div>
              <strong className="text-white font-semibold block">A. Account Information:</strong>
              When you register on EngineerPath, we store your full name, email address, securely salted password hash (bcrypt), and academic profile details (college name, engineering branch, graduation year, semester, and target career track).
            </div>
            <div>
              <strong className="text-white font-semibold block">B. Resume & Career Documents:</strong>
              When you utilize the Resume Analyzer, your uploaded files (PDF, DOCX, TXT) are parsed to extract candidate skills, project descriptions, education history, and formatting structure for automated ATS score calculation.
            </div>
            <div>
              <strong className="text-white font-semibold block">C. Platform Activity & History:</strong>
              To provide continuous learning, we store your recently viewed resources, saved internship bookmarks, roadmap milestone progress, and custom study planner entries scoped strictly to your authenticated account.
            </div>
            <div>
              <strong className="text-white font-semibold block">D. Authentication Tokens:</strong>
              We utilize short-lived JSON Web Tokens (stored strictly in client memory during your session) and secure, encrypted HttpOnly cookies for session refresh. We do not store authentication credentials in unencrypted browser localStorage.
            </div>
          </div>
        </section>

        {/* Third-Party Service Providers */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            <span>3. Third-Party Infrastructure & Service Providers</span>
          </h2>
          <p className="text-xs md:text-sm">
            EngineerPath relies on established industry infrastructure providers to safely host and process data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs md:text-sm pl-2">
            <li>
              <strong className="text-white">MongoDB Atlas:</strong> Managed cloud database for user profiles, curriculum content, and platform activity data.
            </li>
            <li>
              <strong className="text-white">Cloudinary:</strong> Secure cloud asset storage used for persisting uploaded resume files in production.
            </li>
            <li>
              <strong className="text-white">Adzuna Job API:</strong> Aggregated search engine used for fetching external internship opportunities. No user personal data is transmitted to Adzuna.
            </li>
            <li>
              <strong className="text-white">AI Services (Google Gemini / NVIDIA NIM):</strong> Utilized for resume OCR extraction and dynamic curriculum generation.
            </li>
            <li>
              <strong className="text-white">Hosting Platforms (Render / Vercel):</strong> Application backend runtime execution and global frontend content delivery.
            </li>
          </ul>
        </section>

        {/* Data Ownership & Security */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#0D131F] border border-white/10 space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-white font-heading flex items-center space-x-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>4. User Control & Data Retention</span>
          </h2>
          <p className="text-xs md:text-sm">
            You retain ownership of your resume documents and academic data. You may update your academic preferences in Profile Settings at any time. If you wish to delete your account or stored resume analysis history, you can contact our support team at{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-teal-400 hover:underline">
              {siteConfig.contactEmail}
            </a>.
          </p>
        </section>

        {/* Contact Information */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs md:text-sm">
          <h3 className="font-bold text-white text-sm">Questions Regarding Privacy</h3>
          <p>
            For any inquiries regarding this Privacy Policy, contact us at{' '}
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

export default PrivacyPolicy;
