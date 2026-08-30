import React from 'react';
import { Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Mail,
  Zap,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Disclaimer', to: '/disclaimer' },
  ];

  // Map of supported official social channels with their respective icons and config URLs
  const socialChannels = [
    {
      id: 'github',
      name: 'GitHub',
      url: siteConfig.socialLinks.github,
      icon: <Github className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: siteConfig.socialLinks.linkedin,
      icon: <Linkedin className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: siteConfig.socialLinks.instagram,
      icon: <Instagram className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'twitter',
      name: 'X',
      url: siteConfig.socialLinks.twitter,
      icon: <Twitter className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: siteConfig.socialLinks.youtube,
      icon: <Youtube className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: siteConfig.socialLinks.whatsapp,
      icon: <MessageCircle className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  // Filter only social channels that have a valid configured URL
  const activeSocials = socialChannels.filter(
    (item) => typeof item.url === 'string' && item.url.trim() !== '' && item.url !== '#'
  );

  return (
    <footer
      role="contentinfo"
      className="bg-[#0B101B] border-t border-white/10 text-slate-400 text-sm mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 flex flex-col items-center text-center space-y-5">
        {/* Brand & Tagline */}
        <div className="space-y-1.5">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-white font-heading font-extrabold text-lg tracking-tight hover:text-teal-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg px-2 py-1"
          >
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Zap className="h-4 w-4" aria-hidden="true" />
            </div>
            <span>
              Engineer<span className="text-teal-400">Path</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {siteConfig.tagline}
          </p>
        </div>

        {/* Navigation & Legal Links */}
        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs md:text-sm font-medium"
        >
          {legalLinks.map((link, idx) => (
            <React.Fragment key={link.to}>
              <Link
                to={link.to}
                className="text-slate-300 hover:text-teal-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded px-1.5 py-0.5"
              >
                {link.label}
              </Link>
              {idx < legalLinks.length - 1 && (
                <span className="text-slate-600 select-none hidden sm:inline" aria-hidden="true">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Social / Community Links */}
        {activeSocials.length > 0 && (
          <div
            aria-label="Official Social Channels"
            className="flex flex-wrap justify-center items-center gap-2.5 pt-1"
          >
            {activeSocials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit EngineerPath on ${social.name} (opens in new tab)`}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-teal-500/10 hover:border-teal-500/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {social.icon}
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Official Contact Info */}
        <div className="pt-1 flex items-center justify-center space-x-1.5 text-xs text-slate-400">
          <Mail className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          <span>Contact:</span>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="text-teal-400 hover:text-teal-300 underline-offset-2 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded px-1"
          >
            {siteConfig.contactEmail}
          </a>
        </div>

        {/* Copyright */}
        <div className="pt-2 border-t border-white/5 w-full max-w-md">
          <p className="text-xs text-slate-400">
            © {currentYear} EngineerPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
