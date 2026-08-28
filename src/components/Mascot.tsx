import React from 'react';

interface MascotProps {
  className?: string;
  isSensing?: boolean;
  mood?: 'happy' | 'thinking' | 'alert';
}

export const Mascot: React.FC<MascotProps> = ({ className = 'w-16 h-16', isSensing = false, mood = 'happy' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F5E4] via-[#F4FAF0] to-[#FFEFE8] border border-[#DCE8D5] shadow-sm ${className}`}
      title="Eastee — EastAi Drone Mascot & Field Guide"
    >
      <svg viewBox="0 0 100 100" className={`w-full h-full p-1.5 transition-transform duration-300 ${isSensing ? 'scale-105' : ''}`}>
        {/* Top Antenna & Sprout */}
        <line x1="50" y1="24" x2="50" y2="8" stroke="#788874" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 8c-7-2-10 2-10 7 5 1 9-1 10-7z" fill="#4D8B43" />
        <path d="M50 8c7-1 10 3 9 8-6 0-8-2-9-8z" fill="#71B364" />

        {/* Side Propellers */}
        <g className={isSensing ? 'animate-spin origin-[14px_38px]' : ''}>
          <circle cx="14" cy="38" r="9" fill="#E8F5E4" stroke="#BCD2B5" strokeWidth="2" />
          <circle cx="14" cy="38" r="3" fill="#4D8B43" />
        </g>
        <g className={isSensing ? 'animate-spin origin-[86px_38px]' : ''}>
          <circle cx="86" cy="38" r="9" fill="#E8F5E4" stroke="#BCD2B5" strokeWidth="2" />
          <circle cx="86" cy="38" r="3" fill="#4D8B43" />
        </g>

        {/* Main Cute Body */}
        <rect x="17" y="26" width="66" height="58" rx="26" fill="#FFFFFF" stroke="#C8DBC0" strokeWidth="2.5" />

        {/* Blush Cheeks */}
        <ellipse cx="30" cy="63" rx="6.5" ry="4.2" fill="#FFAAA6" opacity="0.85" />
        <ellipse cx="70" cy="63" rx="6.5" ry="4.2" fill="#FFAAA6" opacity="0.85" />

        {/* Eyes */}
        {mood === 'alert' ? (
          <>
            <circle cx="38" cy="53" r="7.5" fill="#E11D48" />
            <circle cx="62" cy="53" r="7.5" fill="#E11D48" />
            <circle cx="40" cy="51" r="2.2" fill="#ffffff" />
            <circle cx="64" cy="51" r="2.2" fill="#ffffff" />
          </>
        ) : isSensing ? (
          <>
            {/* Winking / Scanning eyes */}
            <path d="M32 54 Q38 47 44 54" fill="none" stroke="#2C3E2D" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="62" cy="53" r="6.5" fill="#2C3E2D" />
            <circle cx="64.3" cy="50.5" r="2" fill="#ffffff" />
          </>
        ) : (
          <>
            <circle cx="38" cy="53" r="6.5" fill="#2C3E2D" />
            <circle cx="62" cy="53" r="6.5" fill="#2C3E2D" />
            <circle cx="40.3" cy="50.5" r="2" fill="#ffffff" />
            <circle cx="64.3" cy="50.5" r="2" fill="#ffffff" />
          </>
        )}

        {/* Cute Smiling Mouth */}
        <path
          d={mood === 'alert' ? 'M43 68 Q50 63 57 68' : 'M43 66 Q50 72 57 66'}
          fill="none"
          stroke="#2C3E2D"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

