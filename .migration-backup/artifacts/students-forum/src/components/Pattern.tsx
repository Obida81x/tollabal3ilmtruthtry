type PatternProps = { className?: string; opacity?: number };

export function GeometricPattern({ className = "", opacity = 0.08 }: PatternProps) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern
          id="islamicStar"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.8"
            opacity={opacity}
          >
            <path d="M40 4 L52 28 L76 28 L56 44 L64 68 L40 54 L16 68 L24 44 L4 28 L28 28 Z" />
            <circle cx="40" cy="40" r="14" />
            <path d="M40 26 L54 40 L40 54 L26 40 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamicStar)" />
    </svg>
  );
}

export function ArabesqueDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-secondary ${className}`}
      aria-hidden
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-current opacity-40" />
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <path
          d="M2 8 Q8 2 16 8 Q24 14 30 8"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          opacity="0.7"
        />
        <circle cx="16" cy="8" r="2" fill="currentColor" opacity="0.7" />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-current opacity-40" />
    </div>
  );
}
