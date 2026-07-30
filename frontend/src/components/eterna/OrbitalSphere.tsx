interface OrbitalSphereProps {
  size?: number;
  className?: string;
}

export function OrbitalSphere({ size = 280, className = '' }: OrbitalSphereProps) {
  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Glowing White Core */}
      <div
        className="absolute inset-[38%] rounded-full blur-[3px]"
        style={{
          background: 'radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)',
          boxShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(139, 92, 246, 0.5)',
        }}
      />

      {/* Orbit Rings at varying tilt angles */}
      {[0, 35, 70, 110].map((rotate, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-white/20"
          style={{
            transform: `rotateX(${rotate}deg) rotateY(${rotate * 0.5}deg)`,
            boxShadow: i % 2 === 0 ? '0 0 15px rgba(255, 255, 255, 0.05)' : 'none',
          }}
        />
      ))}

      {/* Outer Rotating Conic Gradient Ring */}
      <div
        className="absolute inset-0 rounded-full animate-[spin_20s_linear_infinite] motion-reduce:animate-none"
        style={{
          border: '2px solid transparent',
          background: 'var(--gradient-signature) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          filter: 'drop-shadow(0 0 10px rgba(217, 70, 239, 0.4))',
        }}
      />

      {/* Scattered background stars / dots */}
      <div className="absolute top-[10%] left-[15%] w-1.5 h-1.5 rounded-full bg-blue-400/80 blur-[0.5px]" />
      <div className="absolute bottom-[20%] right-[10%] w-2 h-2 rounded-full bg-pink-400/80 blur-[0.5px]" />
      <div className="absolute top-[60%] left-[5%] w-1 h-1 rounded-full bg-amber-300/80" />
      <div className="absolute bottom-[10%] left-[30%] w-1.5 h-1.5 rounded-full bg-purple-300/70" />
    </div>
  );
}

export default OrbitalSphere;
