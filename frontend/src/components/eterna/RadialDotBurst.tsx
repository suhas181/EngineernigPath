interface RadialDotBurstProps {
  count?: number;
  className?: string;
}

export function RadialDotBurst({ count = 24, className = '' }: RadialDotBurstProps) {
  const colors = ['#3B82F6', '#8B5CF6', '#D946EF', '#F97316', '#FBBF24'];

  return (
    <div
      className={`relative w-full h-[180px] overflow-hidden pointer-events-none select-none flex items-end justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="relative w-full max-w-4xl h-full flex items-end justify-center">
        {Array.from({ length: count }).map((_, i) => {
          const angle = -75 + (i * 150) / (count - 1); // Fan spread -75deg to +75deg
          const color = colors[i % colors.length];
          const height = 90 + (i % 5) * 16;
          const dotSize = 3 + (i % 3) * 1.5;

          return (
            <div
              key={i}
              className="absolute bottom-0 origin-bottom flex flex-col items-center justify-start opacity-70"
              style={{
                height: `${height}px`,
                transform: `rotate(${angle}deg)`,
              }}
            >
              {/* Endpoint Glowing Dot */}
              <div
                className="rounded-full shadow-sm"
                style={{
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                }}
              />
              {/* Radiating Ray Line */}
              <div
                className="w-[1px] flex-1"
                style={{
                  background: `linear-gradient(to top, transparent, ${color}44)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RadialDotBurst;
