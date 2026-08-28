import React from 'react';
import {
  Play,
  Square,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Radio,
  CheckCircle2,
  Settings2,
} from 'lucide-react';
import { CropPreset } from '../types';

interface SensorArrayProps {
  moisture: number;
  temp: number;
  ph: number;
  onMoistureChange: (val: number) => void;
  onTempChange: (val: number) => void;
  onPhChange: (val: number) => void;
  isLive: boolean;
  onToggleLive: () => void;
  onScanOnce: () => void;
  selectedCrop: string;
  onSelectCrop: (cropId: string) => void;
  crops: CropPreset[];
  onOpenCropManager: () => void;
  manualOverride: boolean;
  onToggleManualOverride: () => void;
  onApplyScenario: (m: number, t: number, p: number) => void;
  hasData: boolean;
  isConnected: boolean;
  isLanded: boolean;
  onConnectDrone: () => void;
  onLandSensor: () => void;
}

export const SensorArray: React.FC<SensorArrayProps> = ({
  moisture,
  temp,
  ph,
  onMoistureChange,
  onTempChange,
  onPhChange,
  isLive,
  onToggleLive,
  onScanOnce,
  selectedCrop,
  onSelectCrop,
  crops,
  onOpenCropManager,
  manualOverride,
  onToggleManualOverride,
  onApplyScenario,
  hasData,
  isConnected,
  isLanded,
  onConnectDrone,
  onLandSensor,
}) => {
  const currentCrop = crops.find((c) => c.id === selectedCrop) || crops[0];

  return (
    <div className="space-y-4">
      {/* Target Crop Selector & Crop Editor Trigger */}
      <div className="p-3 bg-[#F9FBF8] border border-[#E2EAD8] rounded-2xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label htmlFor="cropSelect" className="text-xs font-bold text-[#6E7D6A] uppercase tracking-wider flex items-center gap-1.5">
            <span>Uri ng Pananim (Target Crop):</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              id="cropSelect"
              value={selectedCrop}
              onChange={(e) => onSelectCrop(e.target.value)}
              aria-label="Select target crop type"
              className="text-xs font-bold bg-white border border-[#DCE8D5] rounded-xl px-3 py-1.5 text-[#2C3E2D] focus:outline-none focus:ring-2 focus:ring-[#4D8B43] shadow-2xs cursor-pointer"
            >
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id} className="bg-white text-[#2C3E2D]">
                  {crop.icon} {crop.name}
                </option>
              ))}
            </select>

            <button
              id="openCropManagerBtn"
              type="button"
              onClick={onOpenCropManager}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white hover:bg-[#E8F5E4] text-[#32642B] border border-[#DCE8D5] hover:border-[#BCD2B5] transition-colors cursor-pointer shadow-2xs"
              title="I-edit, magdagdag o baguhin ang mga thresholds ng pananim"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#4D8B43]" />
              <span>I-edit ang Pananim</span>
            </button>
          </div>
        </div>

        {/* Current Crop Target Thresholds Ribbon */}
        {currentCrop && (
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#E8F0E4] text-[11.5px] font-medium text-[#4A5568]">
            <span className="text-[#2C3E2D] font-bold">
              {currentCrop.icon} Ideal para sa {currentCrop.name}:
            </span>
            <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
              <span className="bg-white px-2 py-0.5 rounded-md border border-[#DCE8D5] text-[#32642B] font-semibold">
                💧 {currentCrop.optimalMoisture[0]}-{currentCrop.optimalMoisture[1]}% RH
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-[#DCE8D5] text-[#B45309] font-semibold">
                🌡️ {currentCrop.optimalTemp[0]}-{currentCrop.optimalTemp[1]}°C
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-[#DCE8D5] text-[#0284C7] font-semibold">
                🧪 pH {currentCrop.optimalPh[0]}-{currentCrop.optimalPh[1]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drone Hardware Quick-Connect Action Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          id="connectDroneBtn"
          onClick={onConnectDrone}
          className={`flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
            isConnected
              ? 'bg-[#E8F5E4] text-[#32642B] border-[#BCD2B5] shadow-xs'
              : 'bg-white text-[#6E7D6A] border-[#DCE8D5] hover:bg-[#F4FAF0] hover:text-[#2C3E2D]'
          }`}
          title="Connect Bluetooth / Drone Telemetry Signal"
        >
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-[#4D8B43] animate-pulse' : ''}`} />
          <span>{isConnected ? 'Drone: Connected' : 'Connect Drone Signal'}</span>
        </button>

        <button
          id="landSensorBtn"
          onClick={onLandSensor}
          className={`flex items-center justify-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
            isLanded
              ? 'bg-[#E8F5E4] text-[#32642B] border-[#BCD2B5] shadow-xs'
              : 'bg-white text-[#6E7D6A] border-[#DCE8D5] hover:bg-[#F4FAF0] hover:text-[#2C3E2D]'
          }`}
          title="Lower sensor probe into soil"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isLanded ? 'text-[#4D8B43]' : ''}`} />
          <span>{isLanded ? 'Probe: In Soil (Landed)' : 'Land Sensor in Soil'}</span>
        </button>
      </div>

      {/* Sensor Sliders Container */}
      <div className="space-y-2.5">
        {/* Moisture */}
        <div className="border border-[#E2EAD8] rounded-2xl p-3.5 bg-white grid grid-cols-[auto_1fr_auto] gap-3.5 items-center transition-all shadow-xs hover:border-[#BCD2B5]">
          <div className="min-w-[105px]">
            <span className="block font-display font-bold text-sm text-[#2C3E2D]">💧 Moisture</span>
            <span className="text-[11.5px] text-[#6E7D6A] font-medium">water content</span>
          </div>
          <div className="flex items-center px-1">
            <input
              type="range"
              id="moistureRange"
              min={0}
              max={100}
              value={moisture}
              onChange={(e) => onMoistureChange(Number(e.target.value))}
              disabled={!manualOverride && isLive}
              aria-label="Soil moisture slider"
              className="w-full accent-[#4D8B43] cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <div className="font-mono text-base font-bold min-w-[72px] text-right text-[#32642B]">
            {hasData ? moisture : '--'}
            <span className="text-xs text-[#6E7D6A] font-normal">&nbsp;%</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="border border-[#E2EAD8] rounded-2xl p-3.5 bg-white grid grid-cols-[auto_1fr_auto] gap-3.5 items-center transition-all shadow-xs hover:border-[#BCD2B5]">
          <div className="min-w-[105px]">
            <span className="block font-display font-bold text-sm text-[#2C3E2D]">🌡️ Temperature</span>
            <span className="text-[11.5px] text-[#6E7D6A] font-medium">root zone</span>
          </div>
          <div className="flex items-center px-1">
            <input
              type="range"
              id="tempRange"
              min={-5}
              max={45}
              value={temp}
              onChange={(e) => onTempChange(Number(e.target.value))}
              disabled={!manualOverride && isLive}
              aria-label="Soil temperature slider"
              className="w-full accent-[#D97706] cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <div className="font-mono text-base font-bold min-w-[72px] text-right text-[#B45309]">
            {hasData ? temp : '--'}
            <span className="text-xs text-[#6E7D6A] font-normal">&nbsp;°C</span>
          </div>
        </div>

        {/* pH */}
        <div className="border border-[#E2EAD8] rounded-2xl p-3.5 bg-white grid grid-cols-[auto_1fr_auto] gap-3.5 items-center transition-all shadow-xs hover:border-[#BCD2B5]">
          <div className="min-w-[105px]">
            <span className="block font-display font-bold text-sm text-[#2C3E2D]">⚗️ Soil pH</span>
            <span className="text-[11.5px] text-[#6E7D6A] font-medium">acidity / alkali</span>
          </div>
          <div className="flex items-center px-1">
            <input
              type="range"
              id="phRange"
              min={30}
              max={95}
              value={Math.round(ph * 10)}
              onChange={(e) => onPhChange(Number(e.target.value) / 10)}
              disabled={!manualOverride && isLive}
              aria-label="Soil pH level slider"
              className="w-full accent-[#0284C7] cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <div className="font-mono text-base font-bold min-w-[72px] text-right text-[#0284C7]">
            {hasData ? ph.toFixed(1) : '--'}
            <span className="text-xs text-[#6E7D6A] font-normal">&nbsp;pH</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <button
          id="toggleLiveBtn"
          onClick={onToggleLive}
          className={`flex items-center gap-2 text-[13.5px] font-bold px-4 py-2.5 rounded-full transition-all duration-150 shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${
            isLive
              ? 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-rose-200'
              : 'bg-[#4D8B43] hover:bg-[#3E7436] text-white shadow-emerald-200'
          }`}
        >
          {isLive ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              Stop Live Sensing
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Start Live Sensing
            </>
          )}
        </button>

        <button
          id="scanOnceBtn"
          onClick={onScanOnce}
          disabled={isLive}
          className="flex items-center gap-1.5 text-[13px] font-bold px-3.5 py-2.5 rounded-full bg-white hover:bg-[#F4FAF0] border border-[#DCE8D5] text-[#2C3E2D] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#4D8B43]" />
          Scan Soil Probe
        </button>

        <button
          id="toggleManualBtn"
          onClick={onToggleManualOverride}
          className={`flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-2 rounded-full border transition-all cursor-pointer shadow-2xs ${
            manualOverride
              ? 'bg-[#E8F5E4] border-[#BCD2B5] text-[#32642B]'
              : 'bg-white border-[#DCE8D5] text-[#6E7D6A] hover:text-[#2C3E2D] hover:bg-[#F4FAF0]'
          }`}
          title="Toggle manual slider adjustments"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#4D8B43]" />
          {manualOverride ? 'Manual Tuning: Active' : 'Manual Tuning (Unlock)'}
        </button>
      </div>

      {/* Quick Test Scenarios */}
      <div className="pt-2">
        <div className="text-[11.5px] font-bold text-[#6E7D6A] mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          Quick Field Simulations / Test Presets:
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            id="scenarioOptimalBtn"
            onClick={() => onApplyScenario(52, 24, 6.5)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#E8F5E4] hover:bg-[#DCF0D8] text-[#32642B] border border-[#C8DBC0] cursor-pointer transition-colors shadow-2xs"
          >
            🌾 Optimal Field (52%, 24°C, pH 6.5)
          </button>
          <button
            id="scenarioDroughtBtn"
            onClick={() => onApplyScenario(14, 35, 6.8)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] border border-[#FDE68A] cursor-pointer transition-colors shadow-2xs"
          >
            ☀️ Dry &amp; Hot (14%, 35°C, pH 6.8)
          </button>
          <button
            id="scenarioAcidicBtn"
            onClick={() => onApplyScenario(40, 22, 4.8)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#BE123C] border border-[#FECDD3] cursor-pointer transition-colors shadow-2xs"
          >
            🍋 Acidic Soil (40%, 22°C, pH 4.8)
          </button>
          <button
            id="scenarioFloodBtn"
            onClick={() => onApplyScenario(88, 16, 7.8)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#BAE6FD] cursor-pointer transition-colors shadow-2xs"
          >
            🌧️ Waterlogged &amp; Alkaline (88%, 16°C, pH 7.8)
          </button>
        </div>
      </div>

      <p className="text-[12px] text-[#6E7D6A] font-medium leading-relaxed">
        {isLive
          ? '● Live telemetry is active — probe updates continuous root-zone conditions in real time.'
          : hasData
          ? '● Latest sensor readings displayed. Click "Scan Soil Probe" for an updated snapshot.'
          : '● Walang data pa: Ikonekta ang drone signal at ipatong/ilapag ang sensor probe sa lupa.'}
      </p>
    </div>
  );
};

