import React from 'react';
import { StampConfig } from '../types/meeting';

interface StampBadgeProps {
  config: StampConfig;
  className?: string;
  onClick?: () => void;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  config,
  className = '',
  onClick,
}) => {
  // If custom uploaded stamp image exists, render it
  if (config.customStampImage) {
    return (
      <div
        onClick={onClick}
        style={{
          width: `${config.size}px`,
          height: `${config.size}px`,
          transform: `rotate(${config.rotation}deg)`,
        }}
        className={`relative inline-flex items-center justify-center select-none transition-transform ${className}`}
      >
        <img
          src={config.customStampImage}
          alt="Stempel Dinas RT"
          className="w-full h-full object-contain filter drop-shadow-xs"
        />
      </div>
    );
  }

  const size = config.size || 105;
  const color = config.color || '#4338ca';
  const rotation = config.rotation !== undefined ? config.rotation : -12;

  // SVG dimensions
  const center = 60;
  const outerR = 56;
  const innerR = 38;

  return (
    <div
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
      }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform ${className}`}
      title="Klik untuk mengubah stempel dinas"
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        style={{ color: color }}
      >
        <defs>
          {/* Top text curved path */}
          <path
            id="stampTopArc"
            d="M 16 60 A 44 44 0 0 1 104 60"
            fill="none"
          />
          {/* Bottom text curved path */}
          <path
            id="stampBottomArc"
            d="M 104 60 A 44 44 0 0 1 16 60"
            fill="none"
          />
        </defs>

        {/* Outer Circle */}
        <circle
          cx={center}
          cy={center}
          r={outerR}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeDasharray="1200"
          className="opacity-95"
        />

        {/* Inner Outer Thin Circle */}
        <circle
          cx={center}
          cy={center}
          r={outerR - 3.5}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="opacity-90"
        />

        {/* Inner Inner Circle */}
        <circle
          cx={center}
          cy={center}
          r={innerR}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-90"
        />

        {/* Top Text */}
        <text
          fill="currentColor"
          fontSize="8.5"
          fontWeight="900"
          letterSpacing="1.2"
          className="uppercase select-none"
        >
          <textPath
            href="#stampTopArc"
            startOffset="50%"
            textAnchor="middle"
          >
            {config.textTop || 'PENGURUS RUKUN TETANGGA'}
          </textPath>
        </text>

        {/* Bottom Text */}
        <text
          fill="currentColor"
          fontSize="7.5"
          fontWeight="800"
          letterSpacing="1"
          className="uppercase select-none"
        >
          <textPath
            href="#stampBottomArc"
            startOffset="50%"
            textAnchor="middle"
          >
            {config.textBottom || 'KELURAHAN SUKAMAJU'}
          </textPath>
        </text>

        {/* Middle Divider Lines */}
        <line
          x1="22"
          y1="51"
          x2="98"
          y2="51"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <line
          x1="22"
          y1="69"
          x2="98"
          y2="69"
          stroke="currentColor"
          strokeWidth="1.4"
        />

        {/* Middle Center Text */}
        <text
          x={center}
          y="62"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          fontWeight="900"
          letterSpacing="1.5"
          dominantBaseline="central"
          className="uppercase select-none"
        >
          ★ {config.textMiddle || 'RW 008'} ★
        </text>
      </svg>
    </div>
  );
};
