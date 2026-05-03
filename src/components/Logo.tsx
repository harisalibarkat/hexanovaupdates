interface Props {
  size?: number;
  className?: string;
}

export function HexaLogo({ size = 36, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="HexaNovaUpdates logo"
    >
      <defs>
        <linearGradient id="hex-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Hexagon */}
      <path
        d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
        fill="url(#hex-grad)"
      />
      {/* Lightning bolt / spark — "Nova" */}
      <path
        d="M23 8L13 22H20.5L17 32L28 18H20.5L23 8Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  );
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <HexaLogo size={32} />
      <span className="font-extrabold text-xl tracking-tight leading-none">
        <span className="text-brand">Hexa</span>
        <span className="text-foreground">Nova</span>
        <span className="text-muted-foreground font-normal text-lg">Updates</span>
      </span>
    </span>
  );
}
