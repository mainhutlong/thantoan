import React from 'react';

interface TDUEmblemProps {
  className?: string;
  size?: number;
}

export const TDUEmblem: React.FC<TDUEmblemProps> = ({ className = '', size = 30 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Logo Đại học Tây Đô (TDU)"
    >
      {/* Outer Circle Ring */}
      <circle cx="50" cy="50" r="48" fill="#005325" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="44" fill="#004720" stroke="#FFD700" strokeWidth="1.5" />

      {/* Golden Laurel / Rice / Knowledge ring */}
      <circle cx="50" cy="50" r="41" fill="none" stroke="#FFD700" strokeWidth="0.8" strokeDasharray="3 2" />

      {/* Open Book of Knowledge in Center */}
      <path
        d="M 50 56 C 42 50 30 51 22 55 L 22 75 C 30 71 42 70 50 75 C 58 70 70 71 78 75 L 78 55 C 70 51 58 50 50 56 Z"
        fill="#FFFFFF"
      />
      {/* Book Center Line */}
      <line x1="50" y1="56" x2="50" y2="75" stroke="#005325" strokeWidth="1.5" />

      {/* Graduation Cap / Torch / Rising Sun above book */}
      {/* Golden Rising Sun Rays */}
      <circle cx="50" cy="38" r="14" fill="#FFD700" />
      {/* Academic Torch flame in center */}
      <path
        d="M 50 22 C 46 29 45 34 50 40 C 55 34 54 29 50 22 Z"
        fill="#E11D48"
      />
      <circle cx="50" cy="33" r="3" fill="#FFED4A" />

      {/* Text TDU in white bold inside */}
      <text
        x="50"
        y="51"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="13"
        letterSpacing="1"
      >
        TDU
      </text>

      {/* Small star below */}
      <polygon
        points="50,78 51.5,82 56,82 52.5,84.5 54,88.5 50,86 46,88.5 47.5,84.5 44,82 48.5,82"
        fill="#FFD700"
      />
    </svg>
  );
};
