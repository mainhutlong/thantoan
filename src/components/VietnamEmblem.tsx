import React from 'react';

interface VietnamEmblemProps {
  className?: string;
  size?: number;
}

export const VietnamEmblem: React.FC<VietnamEmblemProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Quốc huy Việt Nam"
    >
      {/* Outer gold rim */}
      <circle cx="50" cy="50" r="48" fill="#DA251D" stroke="#FFCD00" strokeWidth="2.5" />
      
      {/* Golden gear / cog wheel at the bottom */}
      <circle cx="50" cy="74" r="14" fill="#FFCD00" />
      <circle cx="50" cy="74" r="8" fill="#DA251D" />
      {/* Cog teeth */}
      <rect x="47.5" y="58" width="5" height="4" fill="#FFCD00" />
      <rect x="47.5" y="86" width="5" height="4" fill="#FFCD00" />
      <rect x="34" y="71.5" width="4" height="5" fill="#FFCD00" />
      <rect x="62" y="71.5" width="4" height="5" fill="#FFCD00" />
      <rect x="38" y="62" width="4.5" height="4.5" fill="#FFCD00" transform="rotate(45 40 64)" />
      <rect x="58" y="82" width="4.5" height="4.5" fill="#FFCD00" transform="rotate(45 60 84)" />
      <rect x="38" y="82" width="4.5" height="4.5" fill="#FFCD00" transform="rotate(-45 40 84)" />
      <rect x="58" y="62" width="4.5" height="4.5" fill="#FFCD00" transform="rotate(-45 60 64)" />

      {/* Rice sheaves wreath (Bông lúa) on left and right */}
      {/* Left wreath arc */}
      <path
        d="M 24 72 C 16 58 16 38 30 22 C 34 26 31 38 27 50 C 25 58 26 66 28 72 Z"
        fill="#FFCD00"
      />
      {/* Rice grains left */}
      <ellipse cx="21" cy="62" rx="4" ry="2.2" fill="#FFE169" transform="rotate(-30 21 62)" />
      <ellipse cx="18" cy="52" rx="4" ry="2.2" fill="#FFE169" transform="rotate(-15 18 52)" />
      <ellipse cx="18" cy="42" rx="4" ry="2.2" fill="#FFE169" transform="rotate(10 18 42)" />
      <ellipse cx="22" cy="32" rx="4" ry="2.2" fill="#FFE169" transform="rotate(35 22 32)" />
      <ellipse cx="28" cy="24" rx="3.5" ry="2" fill="#FFE169" transform="rotate(55 28 24)" />

      {/* Right wreath arc */}
      <path
        d="M 76 72 C 84 58 84 38 70 22 C 66 26 69 38 73 50 C 75 58 74 66 72 72 Z"
        fill="#FFCD00"
      />
      {/* Rice grains right */}
      <ellipse cx="79" cy="62" rx="4" ry="2.2" fill="#FFE169" transform="rotate(30 79 62)" />
      <ellipse cx="82" cy="52" rx="4" ry="2.2" fill="#FFE169" transform="rotate(15 82 52)" />
      <ellipse cx="82" cy="42" rx="4" ry="2.2" fill="#FFE169" transform="rotate(-10 82 42)" />
      <ellipse cx="78" cy="32" rx="4" ry="2.2" fill="#FFE169" transform="rotate(-35 78 32)" />
      <ellipse cx="72" cy="24" rx="3.5" ry="2" fill="#FFE169" transform="rotate(-55 72 24)" />

      {/* Red banner ribbon wrapping the bottom */}
      <path
        d="M 28 76 Q 50 85 72 76 L 75 84 Q 50 93 25 84 Z"
        fill="#C4161C"
        stroke="#FFCD00"
        strokeWidth="1"
      />
      {/* Golden ribbon tie center */}
      <circle cx="50" cy="84" r="3" fill="#FFCD00" />

      {/* Five-pointed gold star in center */}
      <polygon
        points="50,26 54.5,39 68,39 57,47.5 61,60.5 50,52.5 39,60.5 43,47.5 32,39 45.5,39"
        fill="#FFFF00"
        stroke="#E5B200"
        strokeWidth="0.8"
      />
    </svg>
  );
};
