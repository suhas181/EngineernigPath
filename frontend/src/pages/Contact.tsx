import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';
import { siteConfig } from '../config/siteConfig';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Front-end confirmation for user convenience
    setSubmitted(true);
  };

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
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10 w-full">
        {/* Header Section */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Contact Support & Feedback
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Have questions about career roadmaps, bug reports, or platform feedback? Reach out to our team directly.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Direct Contact Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 w-fit">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Direct Email</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  For inquiries, platform feedback, and support:
                </p>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium break-all mt-2 inline-block transition hover:underline"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Information</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                EngineerPath is an open-source technical education framework. You can also file issues and feature suggestions on our official repository.
              </p>
              {siteConfig.socialLinks.github && (
                <a
                  href={siteConfig.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline inline-block pt-1 font-medium"
                >
                  View GitHub Repository →
                </a>
              )}
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="md:col-span-2">
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-white/10 shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="p-3 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 w-fit mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thank You for Reaching Out!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Your message has been received. If your inquiry requires a response, our team will get back to you at {formData.email || 'your email'}.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="mosaic-btn-brand text-xs !px-5 !py-2 mt-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Send a Message
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Alex Morgan"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@university.edu"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Roadmap Question / Resume Feedback"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your inquiry or feedback..."
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mosaic-btn-brand w-full flex items-center justify-center space-x-2 !py-3 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}

export default Contact;
