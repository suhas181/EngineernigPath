interface GradientWaveLinesProps {
  labels?: string[];
  className?: string;
}

export function GradientWaveLines({
  labels = ['clarity', 'roadmap', 'growth', 'mastery', 'unity'],
  className = '',
}: GradientWaveLinesProps) {
  return (
    <div className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg
        className="w-full h-[280px] md:h-[360px] opacity-70"
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D946EF" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D946EF" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Wave Path 1 */}
        <path
          d="M 0 180 Q 300 80, 600 220 T 1200 160"
          stroke="url(#waveGrad1)"
          strokeWidth="3"
          fill="none"
          className="motion-reduce:animate-none"
          style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}
        />

        {/* Wave Path 2 */}
        <path
          d="M 0 240 Q 350 340, 700 140 T 1200 280"
          stroke="url(#waveGrad2)"
          strokeWidth="2.5"
          fill="none"
          style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.3))' }}
        />

        {/* Wave Path 3 */}
        <path
          d="M 0 100 Q 400 260, 800 80 T 1200 220"
          stroke="url(#waveGrad3)"
          strokeWidth="2"
          strokeDasharray="6 6"
          fill="none"
        />
      </svg>

      {/* Floating Content Label Pills */}
      <div className="absolute top-[25%] left-[18%] eterna-badge-pill bg-slate-950/80 backdrop-blur-md border-white/10 text-xs shadow-lg">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span>{labels[0] || 'clarity'}</span>
      </div>

      <div className="absolute top-[48%] left-[45%] eterna-badge-pill bg-slate-950/80 backdrop-blur-md border-purple-500/30 text-xs shadow-lg">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <span>{labels[1] || 'roadmap'}</span>
      </div>

      <div className="absolute top-[20%] right-[22%] eterna-badge-pill bg-slate-950/80 backdrop-blur-md border-pink-500/30 text-xs shadow-lg">
        <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        <span>{labels[2] || 'growth'}</span>
      </div>

      <div className="absolute bottom-[22%] right-[12%] eterna-badge-pill bg-slate-950/80 backdrop-blur-md border-amber-500/30 text-xs shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>{labels[3] || 'mastery'}</span>
      </div>
    </div>
  );
}

export default GradientWaveLines;
