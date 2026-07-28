import { Link } from 'react-router-dom';
import { GraduationCap, Github, Linkedin, Twitter, Heart } from 'lucide-react';

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
    <footer className="glass-panel border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-7 w-7 text-blue-500" />
              <span className="font-heading font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                EngineerPath
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered career guidance platform for engineering students. Navigate your journey from college to placement.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80">Stay Updated</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get career tips, new features, and internship alerts delivered to your inbox.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition"
              />
              <button className="bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm px-4 py-2 rounded-lg transition shadow-md">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} EngineerPath. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-400 fill-red-400" />
            <span>for engineering students</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
