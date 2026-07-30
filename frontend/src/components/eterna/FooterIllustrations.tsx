interface FooterIllustrationsProps {
  className?: string;
}

export function FooterIllustrations({ className = '' }: FooterIllustrationsProps) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg
        className="w-full h-24 md:h-32 opacity-40"
        viewBox="0 0 1000 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="floralGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
          <linearGradient id="floralGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D946EF" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Left Floral Stem & Leaves */}
        <g stroke="url(#floralGradLeft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 50 120 C 80 80, 120 60, 180 50 C 220 40, 260 70, 300 30" fill="none" />
          {/* Leaves Left */}
          <path d="M 90 75 Q 110 55, 120 70 Q 100 80, 90 75 Z" fill="url(#floralGradLeft)" fillOpacity="0.2" />
          <path d="M 160 55 Q 185 35, 195 55 Q 175 65, 160 55 Z" fill="url(#floralGradLeft)" fillOpacity="0.2" />
          <path d="M 230 48 Q 255 25, 265 45 Q 245 55, 230 48 Z" fill="url(#floralGradLeft)" fillOpacity="0.2" />
          {/* Flower Dot Petals */}
          <circle cx="300" cy="30" r="5" fill="#D946EF" />
          <circle cx="290" cy="20" r="3" fill="#8B5CF6" />
          <circle cx="310" cy="20" r="3" fill="#8B5CF6" />
          <circle cx="300" cy="15" r="3" fill="#3B82F6" />
        </g>

        {/* Right Floral Stem & Leaves */}
        <g stroke="url(#floralGradRight)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 950 120 C 920 80, 880 60, 820 50 C 780 40, 740 70, 700 30" fill="none" />
          {/* Leaves Right */}
          <path d="M 910 75 Q 890 55, 880 70 Q 900 80, 910 75 Z" fill="url(#floralGradRight)" fillOpacity="0.2" />
          <path d="M 840 55 Q 815 35, 805 55 Q 825 65, 840 55 Z" fill="url(#floralGradRight)" fillOpacity="0.2" />
          <path d="M 770 48 Q 745 25, 735 45 Q 755 55, 770 48 Z" fill="url(#floralGradRight)" fillOpacity="0.2" />
          {/* Flower Dot Petals */}
          <circle cx="700" cy="30" r="5" fill="#F97316" />
          <circle cx="710" cy="20" r="3" fill="#FBBF24" />
          <circle cx="690" cy="20" r="3" fill="#FBBF24" />
          <circle cx="700" cy="15" r="3" fill="#D946EF" />
        </g>
      </svg>
    </div>
  );
}

export default FooterIllustrations;
