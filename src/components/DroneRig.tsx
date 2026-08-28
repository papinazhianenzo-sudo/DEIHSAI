import React from 'react';

interface DroneRigProps {
  isSensing: boolean;
  signalState: 'idle' | 'connecting' | 'sensing' | 'landed';
}

export const DroneRig: React.FC<DroneRigProps> = ({ isSensing, signalState }) => {
  return (
    <div className="relative w-full h-[160px] bg-gradient-to-b from-[#F0F7EE] to-[#E5F1E1] rounded-2xl border border-[#DCE8D5] overflow-hidden p-2 flex flex-col justify-between select-none shadow-inner">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4D8B43 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <svg viewBox="0 0 300 145" preserveAspectRatio="none" className="w-full h-full relative z-10">
        {/* Drone Rig Head Assembly */}
        <g transform="translate(150, 18)">
          {/* Drone Body */}
          <rect x="-30" y="-8" width="60" height="16" rx="8" fill="#FFFFFF" stroke="#BCD2B5" strokeWidth="2" />
          {/* Propeller Mounts */}
          <circle cx="-34" cy="-8" r="6" fill="#E8F5E4" stroke="#4D8B43" strokeWidth="1.5" />
          <circle cx="34" cy="-8" r="6" fill="#E8F5E4" stroke="#4D8B43" strokeWidth="1.5" />
          <circle cx="-34" cy="8" r="6" fill="#E8F5E4" stroke="#4D8B43" strokeWidth="1.5" />
          <circle cx="34" cy="8" r="6" fill="#E8F5E4" stroke="#4D8B43" strokeWidth="1.5" />
          {/* Status Indicator LED on Drone */}
          <circle
            cx="0"
            cy="0"
            r="4"
            fill={isSensing ? '#4D8B43' : signalState === 'connecting' ? '#D97706' : '#94A3B8'}
            className={isSensing ? 'animate-ping origin-center' : ''}
          />
          <circle
            cx="0"
            cy="0"
            r="4"
            fill={isSensing ? '#4D8B43' : signalState === 'connecting' ? '#D97706' : '#94A3B8'}
          />
        </g>

        {/* Telemetry Multi-Spectral Sensor Beams */}
        <line
          x1="120"
          y1="28"
          x2="85"
          y2="108"
          stroke="#0284C7"
          strokeWidth="2"
          strokeDasharray="4 6"
          className={`transition-opacity duration-300 ${isSensing ? 'opacity-90 animate-beam' : 'opacity-25'}`}
        />
        <line
          x1="150"
          y1="28"
          x2="150"
          y2="108"
          stroke="#D97706"
          strokeWidth="2"
          strokeDasharray="4 6"
          className={`transition-opacity duration-300 ${isSensing ? 'opacity-90 animate-beam' : 'opacity-25'}`}
        />
        <line
          x1="180"
          y1="28"
          x2="215"
          y2="108"
          stroke="#4D8B43"
          strokeWidth="2"
          strokeDasharray="4 6"
          className={`transition-opacity duration-300 ${isSensing ? 'opacity-90 animate-beam' : 'opacity-25'}`}
        />

        {/* Traveling Particle Dots during Active Scan */}
        {isSensing && (
          <>
            <circle cx="120" cy="28" r="3.5" fill="#0284C7" className="animate-travel shadow-sm" />
            <circle cx="150" cy="28" r="3.5" fill="#D97706" className="animate-travel [animation-delay:0.2s]" />
            <circle cx="180" cy="28" r="3.5" fill="#4D8B43" className="animate-travel [animation-delay:0.4s]" />
          </>
        )}

        {/* Soil Surface Divider */}
        <line x1="15" y1="108" x2="285" y2="108" stroke="#BCD2B5" strokeWidth="2" strokeDasharray="3 3" />

        {/* Soil Stratum Layer (0 - 15cm) */}
        <rect x="15" y="108" width="270" height="30" rx="8" fill="#F4F8F1" stroke="#D0DFCA" strokeWidth="1.5" />

        {/* Root Zone Depth Grid */}
        <line x1="105" y1="110" x2="105" y2="136" stroke="#D0DFCA" strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="195" y1="110" x2="195" y2="136" stroke="#D0DFCA" strokeWidth="1.2" strokeDasharray="2 2" />

        <text x="24" y="128" fill="#5A6D56" fontSize="9.5" fontWeight="700" fontFamily="Quicksand, sans-serif">
          🌱 SOIL PROFILE · ROOT DEPTH 0–15 CM
        </text>

        <text
          x="232"
          y="128"
          fill={isSensing ? '#32642B' : '#6E7D6A'}
          fontSize="9"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {isSensing ? '● SENSING' : 'IDLE'}
        </text>
      </svg>
    </div>
  );
};

