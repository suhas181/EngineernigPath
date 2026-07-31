import { Link } from 'react-router-dom';
import { GraduationCap, Github, Linkedin, Twitter, Heart } from 'lucide-react';
import { FooterIllustrations } from './eterna/FooterIllustrations';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Roadmap', to: '/roadmaps' },
    { label: 'Learning Hub', to: '/resources' },
    { label: 'Planner', to: '/planner' },
    { label: 'Resume Analyzer', to: '/resume' },
  ];

  const companyLinks = [
    { label: 'About Us', to: '#' },
    { label: 'Contact', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ];

  const socialLinks = [
    { icon: <Github className="h-4.5 w-4.5" />, href: '#', label: 'GitHub' },
    { icon: <Linkedin className="h-4.5 w-4.5" />, href: '#', label: 'LinkedIn' },
    { icon: <Twitter className="h-4.5 w-4.5" />, href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="relative bg-[var(--bg-dark)] border-t border-white/10 mt-auto pt-8 pb-8 overflow-hidden">
      {/* Decorative Botanical Illustrations */}
      <FooterIllustrations className="absolute bottom-0 inset-x-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-1.5 rounded-full bg-[var(--gradient-signature)] flex items-center justify-center">
                <div className="bg-slate-950 p-1.5 rounded-full">
                  <GraduationCap className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                Engineer<span className="text-gradient">Path</span>
              </span>
            </Link>

            <p className="text-sm text-[var(--text-on-dark-muted)] leading-relaxed">
              AI-powered career guidance platform for engineering students. Navigate your unifying framework from college to placement.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-on-dark-muted)] hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--text-on-dark-muted)] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--text-on-dark-muted)] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90">Stay Updated</h4>
            <p className="text-sm text-[var(--text-on-dark-muted)] leading-relaxed">
              Get career tips, roadmap updates, and internship alerts delivered to your inbox.
            </p>
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full p-1.5 focus-within:border-purple-500/50">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-transparent px-3 py-1 text-sm text-white placeholder:text-[var(--text-on-dark-muted)] focus:outline-none"
              />
              <button className="eterna-btn-primary !py-1.5 !px-4 !text-xs">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-on-dark-muted)]">
            © {currentYear} EngineerPath. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-on-dark-muted)] flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-purple-400 fill-purple-400" />
            <span>for engineering students</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
