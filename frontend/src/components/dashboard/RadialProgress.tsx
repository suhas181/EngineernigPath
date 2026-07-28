import React, { useEffect, useState } from 'react';

interface RadialProgressProps {
  progress: number; // 0 to 100
  size?: number; // size in px (e.g. 64, 80)
  strokeWidth?: number;
  colorClass?: string;
  trailColorClass?: string;
  children?: React.ReactNode;
  className?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  progress,
  size = 72,
  strokeWidth = 6,
  colorClass = 'text-blue-500',
  trailColorClass = 'text-white/10',
  children,
  className = '',
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate fill on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(100, Math.max(0, progress)));
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Trail Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`stroke-current ${trailColorClass}`}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`stroke-current ${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Centered Children/Value Label */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default RadialProgress;
