import React from 'react';
import { Volume2, CheckCircle2, AlertTriangle, AlertOctagon, Sparkles } from 'lucide-react';
import { SoilClassificationResult } from '../types';
import { playChime, speakImmediate } from '../utils/audio';

interface AdvisoryPanelProps {
  classification: SoilClassificationResult | null;
  moisture: number;
  temp: number;
  ph: number;
  voiceEnabled: boolean;
  onAskGuide: (question: string) => void;
  language: 'taglish' | 'english';
}

export const AdvisoryPanel: React.FC<AdvisoryPanelProps> = ({
  classification,
  moisture,
  temp,
  ph,
  voiceEnabled,
  onAskGuide,
  language,
}) => {
  if (!classification) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-[#F9FBF8] rounded-2xl border border-dashed border-[#DCE8D5]">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E4] border border-[#C8DBC0] flex items-center justify-center text-2xl mb-3 shadow-xs">
          🌱
        </div>
        <div className="font-display font-bold text-base text-[#2C3E2D] mb-1">
          Nakahanda ang Sensor Probe
        </div>
        <p className="text-xs font-semibold text-[#6E7D6A] max-w-sm leading-relaxed">
          {language === 'taglish'
            ? 'Walang natatanggap na datos. Pindutin ang "Connect Drone" o "Scan Soil Probe" para lumapag ang sensor at magbasa ng kondisyon ng lupa.'
            : 'No telemetry data received yet. Click "Connect Drone" or "Scan Soil Probe" to deploy probe and receive live field telemetry.'}
        </p>
      </div>
    );
  }

  const overallDetails = {
    ok: {
      label: language === 'taglish' ? 'Field Condition Normal' : 'Field Condition Normal',
      sublabel: language === 'taglish' ? 'Maayos at malusog ang lahat ng lebel sa lupa' : 'All root parameters within healthy ranges',
      color: '#32642B',
      bg: 'bg-[#E8F5E4]',
      border: 'border-[#C8DBC0]',
      badge: 'bg-[#DCF0D8] text-[#32642B] border-[#BCD2B5]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#4D8B43]" />,
    },
    warn: {
      label: language === 'taglish' ? 'Attention Recommended' : 'Attention Recommended',
      sublabel: language === 'taglish' ? 'May ilang lebel na kailangan i-adjust' : 'Minor agronomy adjustments recommended',
      color: '#B45309',
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FDE68A]',
      badge: 'bg-[#FDE68A] text-[#B45309] border-[#FCD34D]',
      icon: <AlertTriangle className="w-5 h-5 text-[#D97706]" />,
    },
    bad: {
      label: language === 'taglish' ? 'Action Required' : 'Action Required',
      sublabel: language === 'taglish' ? 'Kailangan ng agarang lunas sa lupa' : 'Critical soil imbalance detected',
      color: '#BE123C',
      bg: 'bg-[#FFE4E6]',
      border: 'border-[#FECDD3]',
      badge: 'bg-[#FECDD3] text-[#BE123C] border-[#FDA4AF]',
      icon: <AlertOctagon className="w-5 h-5 text-[#E11D48]" />,
    },
  }[classification.overall];

  const handleSpeakSummary = () => {
    playChime([660, 880]);
    const summary =
      classification.overall === 'ok'
        ? language === 'taglish'
          ? 'Maganda at malusog ang kondisyon ng lupa! Normal ang moisture, temperatura, at pH level.'
          : 'Soil conditions are healthy and optimal across all telemetry sensors.'
        : `${language === 'taglish' ? 'Rekomendasyon para sa lupa:' : 'Soil telemetry advisory:'} ${
            classification.moisture.level !== 'ok'
              ? `Kondisyon ng moisture: ${classification.moisture.condition}. Dapat gawin: ${classification.moisture.actionText}. `
              : ''
          }${
            classification.temp.level !== 'ok'
              ? `Kondisyon ng temperatura: ${classification.temp.condition}. Dapat gawin: ${classification.temp.actionText}. `
              : ''
          }${
            classification.ph.level !== 'ok'
              ? `Kondisyon ng pH level: ${classification.ph.condition}. Dapat gawin: ${classification.ph.actionText}.`
              : ''
          }`;
    speakImmediate(summary, voiceEnabled);
  };

  return (
    <div className="space-y-3.5">
      {/* Overall Summary Card */}
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border ${overallDetails.bg} ${overallDetails.border} shadow-xs`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-xs border border-white/80">{overallDetails.icon}</div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#6E7D6A]">Overall Field Status</div>
            <div className="font-display text-base md:text-lg font-bold" style={{ color: overallDetails.color }}>
              {overallDetails.label}
            </div>
            <div className="text-xs font-semibold text-[#6E7D6A]">{overallDetails.sublabel}</div>
          </div>
        </div>

        <button
          id="readAdvisoryAloudBtn"
          onClick={handleSpeakSummary}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full bg-white hover:bg-[#F4FAF0] text-[#32642B] border border-[#C8DBC0] shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Basahin nang malakas / Speak advisory aloud"
        >
          <Volume2 className="w-4 h-4 text-[#4D8B43]" />
          <span>Basahin (Audio)</span>
        </button>
      </div>

      {/* 1. Moisture Block */}
      <div
        className={`p-4 rounded-2xl border transition-all shadow-xs ${
          classification.moisture.level === 'ok'
            ? 'bg-[#F4FAF0] border-[#D4E6CE]'
            : classification.moisture.level === 'warn'
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : 'bg-[#FFF1F2] border-[#FECDD3]'
        }`}
      >
        <div className="space-y-1.5">
          <div className="text-[13.5px] font-semibold text-[#2C3E2D] flex items-center justify-between">
            <div>
              <span className="text-[#6E7D6A] font-medium">Condition of soil moisture: </span>
              <strong className="capitalize text-[#2C3E2D] font-bold">
                {classification.moisture.condition} ({moisture}% RH)
              </strong>
            </div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                classification.moisture.level === 'ok'
                  ? 'bg-[#E8F5E4] text-[#32642B] border-[#C8DBC0]'
                  : classification.moisture.level === 'warn'
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                  : 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]'
              }`}
            >
              {classification.moisture.level === 'ok' ? 'Optimal' : classification.moisture.condition}
            </span>
          </div>

          <div className="text-[13.5px] font-semibold text-[#2C3E2D] flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[#6E7D6A] font-medium">Should do : </span>
              <strong className="capitalize text-[#32642B] font-bold underline decoration-[#4D8B43]/30 underline-offset-2">
                {classification.moisture.actionText}
              </strong>
            </div>
            <button
              onClick={() => onAskGuide(`Paano gawin step-by-step ang "${classification.moisture.actionText}" para sa lupa na ${classification.moisture.condition} ang moisture?`)}
              className="text-xs font-bold text-[#4D8B43] hover:text-[#32642B] hover:underline inline-flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#D4E6CE] shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Paano gawin? (Ask Guide)
            </button>
          </div>

          <p className="text-xs font-medium text-[#6E7D6A] leading-relaxed pt-1">
            {classification.moisture.detail}
          </p>
        </div>
      </div>

      {/* 2. Temperature Block */}
      <div
        className={`p-4 rounded-2xl border transition-all shadow-xs ${
          classification.temp.level === 'ok'
            ? 'bg-[#F4FAF0] border-[#D4E6CE]'
            : classification.temp.level === 'warn'
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : 'bg-[#FFF1F2] border-[#FECDD3]'
        }`}
      >
        <div className="space-y-1.5">
          <div className="text-[13.5px] font-semibold text-[#2C3E2D] flex items-center justify-between">
            <div>
              <span className="text-[#6E7D6A] font-medium">Condition of soil temperature: </span>
              <strong className="capitalize text-[#2C3E2D] font-bold">
                {classification.temp.condition} ({temp}°C)
              </strong>
            </div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                classification.temp.level === 'ok'
                  ? 'bg-[#E8F5E4] text-[#32642B] border-[#C8DBC0]'
                  : classification.temp.level === 'warn'
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                  : 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]'
              }`}
            >
              {classification.temp.level === 'ok' ? 'Optimal' : classification.temp.condition}
            </span>
          </div>

          <div className="text-[13.5px] font-semibold text-[#2C3E2D] flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[#6E7D6A] font-medium">Should do : </span>
              <strong className="capitalize text-[#32642B] font-bold underline decoration-[#4D8B43]/30 underline-offset-2">
                {classification.temp.actionText}
              </strong>
            </div>
            <button
              onClick={() => onAskGuide(`Paano gawin step-by-step ang "${classification.temp.actionText}" para sa temperatura ng lupa na ${classification.temp.condition} (${temp}°C)?`)}
              className="text-xs font-bold text-[#4D8B43] hover:text-[#32642B] hover:underline inline-flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#D4E6CE] shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Paano gawin? (Ask Guide)
            </button>
          </div>

          <p className="text-xs font-medium text-[#6E7D6A] leading-relaxed pt-1">
            {classification.temp.detail}
          </p>
        </div>
      </div>

      {/* 3. Soil pH Block */}
      <div
        className={`p-4 rounded-2xl border transition-all shadow-xs ${
          classification.ph.level === 'ok'
            ? 'bg-[#F4FAF0] border-[#D4E6CE]'
            : classification.ph.level === 'warn'
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : 'bg-[#FFF1F2] border-[#FECDD3]'
        }`}
      >
        <div className="space-y-1.5">
          <div className="text-[13.5px] font-semibold text-[#2C3E2D] flex items-center justify-between">
            <div>
              <span className="text-[#6E7D6A] font-medium">Condition of soil pH level: </span>
              <strong className="capitalize text-[#2C3E2D] font-bold">
                {classification.ph.condition} ({ph.toFixed(1)} pH)
              </strong>
            </div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                classification.ph.level === 'ok'
                  ? 'bg-[#E8F5E4] text-[#32642B] border-[#C8DBC0]'
                  : classification.ph.level === 'warn'
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                  : 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]'
              }`}
            >
              {classification.ph.level === 'ok' ? 'Optimal' : classification.ph.condition}
            </span>
          </div>

          <div className="text-[13.5px] font-semibold text-[#2C3E2D] flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[#6E7D6A] font-medium">Should do : </span>
              <strong className="capitalize text-[#32642B] font-bold underline decoration-[#4D8B43]/30 underline-offset-2">
                {classification.ph.actionText}
              </strong>
            </div>
            <button
              onClick={() => onAskGuide(`Paano gawin step-by-step ang "${classification.ph.actionText}" para sa lupa na ${classification.ph.condition} (pH ${ph.toFixed(1)})?`)}
              className="text-xs font-bold text-[#4D8B43] hover:text-[#32642B] hover:underline inline-flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#D4E6CE] shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Paano gawin? (Ask Guide)
            </button>
          </div>

          <p className="text-xs font-medium text-[#6E7D6A] leading-relaxed pt-1">
            {classification.ph.detail}
          </p>
        </div>
      </div>
    </div>
  );
};

