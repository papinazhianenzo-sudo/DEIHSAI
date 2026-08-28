/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mascot } from './components/Mascot';
import { DroneRig } from './components/DroneRig';
import { SensorArray } from './components/SensorArray';
import { AdvisoryPanel } from './components/AdvisoryPanel';
import { SoilGuideRubric } from './components/SoilGuideRubric';
import { TransmissionLog } from './components/TransmissionLog';
import { ChatGuide } from './components/ChatGuide';
import { CropManagerModal } from './components/CropManagerModal';
import { TelemetryReading, SoilClassificationResult, CropPreset } from './types';
import { classifySoil, buildSpokenSummary, DEFAULT_CROP_PRESETS } from './utils/soilClassifier';
import { Radio, Volume2, VolumeX, Sparkles, Sprout, Settings2 } from 'lucide-react';import { supabase } from './supabase';
  playChime,
  playConnectedSound,
  playSensorLandedSound,
  queueSpeech,
  speakImmediate,
  stopSpeech,
} from './utils/audio';
import { Radio, Volume2, VolumeX, Sparkles, Sprout, Settings2 } from 'lucide-react';

export default function App() {
  // Clock state
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');

  // Audio Voice preference
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Language preference
  const [language, setLanguage] = useState<'taglish' | 'english'>('taglish');

  // Crop presets with localStorage persistence
  const [crops, setCrops] = useState<CropPreset[]>(() => {
    try {
      const saved = localStorage.getItem('eastai_crops_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load crops from localStorage:', e);
    }
    return DEFAULT_CROP_PRESETS;
  });

  const [isCropManagerOpen, setIsCropManagerOpen] = useState<boolean>(false);

  // Selected crop type
  const [selectedCrop, setSelectedCrop] = useState<string>(() => {
    return crops[0]?.id || 'general';
  });

  // Save crops to localStorage
  const handleSaveCrops = (updatedCrops: CropPreset[]) => {
    setCrops(updatedCrops);
    try {
      localStorage.setItem('eastai_crops_v1', JSON.stringify(updatedCrops));
    } catch (e) {
      console.error('Failed to save crops to localStorage:', e);
    }
    playChime([523.25, 659.25, 783.99]);
  };

  // Manual tuning toggle
  const [manualOverride, setManualOverride] = useState<boolean>(false);

  // Drone connection state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLanded, setIsLanded] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);

  // Sensor reading values
  const [moisture, setMoisture] = useState<number>(38);
  const [temp, setTemp] = useState<number>(24);
  const [ph, setPh] = useState<number>(6.5);

  // Classification results
  const [classification, setClassification] = useState<SoilClassificationResult | null>(null);

  // Transmission logs with localStorage persistence and realistic initial sample records
  const [logEntries, setLogEntries] = useState<TelemetryReading[]>(() => {
    try {
      const saved = localStorage.getItem('eastai_packet_history_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load transmission history:', e);
    }

    // Default sample past records with realistic dates so history is immediately checkable
    const now = new Date();
    const todayStr = now.toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' });

    const sample1Result = classifySoil(42, 25, 6.4, 'rice', 'taglish');
    const sample2Result = classifySoil(18, 33, 5.2, 'corn', 'taglish');
    const sample3Result = classifySoil(74, 21, 7.8, 'vegetables', 'taglish');

    return [
      {
        id: `sample-${now.getTime() - 3600000}`,
        date: todayStr,
        time: '09:15:30 AM',
        fullDateTime: `${todayStr} • 09:15:30 AM`,
        timestamp: now.getTime() - 3600000,
        moisture: 42,
        temp: 25,
        ph: 6.4,
        classification: sample1Result,
        cropPreset: 'rice',
        cropName: 'Palay / Rice',
        cropIcon: '🌾',
      },
      {
        id: `sample-${now.getTime() - 7200000}`,
        date: todayStr,
        time: '08:20:10 AM',
        fullDateTime: `${todayStr} • 08:20:10 AM`,
        timestamp: now.getTime() - 7200000,
        moisture: 18,
        temp: 33,
        ph: 5.2,
        classification: sample2Result,
        cropPreset: 'corn',
        cropName: 'Mais / Corn',
        cropIcon: '🌽',
      },
      {
        id: `sample-${yesterday.getTime() - 14400000}`,
        date: yesterdayStr,
        time: '04:45:00 PM',
        fullDateTime: `${yesterdayStr} • 04:45:00 PM`,
        timestamp: yesterday.getTime() - 14400000,
        moisture: 74,
        temp: 21,
        ph: 7.8,
        classification: sample3Result,
        cropPreset: 'vegetables',
        cropName: 'Gulay / Vegetables',
        cropIcon: '🥬',
      },
    ];
  });

  // Save log entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('eastai_packet_history_v2', JSON.stringify(logEntries));
    } catch (e) {
      console.error('Failed to save transmission history:', e);
    }
  }, [logEntries]);

  // Live drone telemetry status
  const [isLive, setIsLive] = useState<boolean>(false);
  const [signalState, setSignalState] = useState<'idle' | 'connecting' | 'sensing' | 'landed'>('idle');
  const [statusText, setStatusText] = useState<string>('Naghihintay ng koneksyon');

  // External trigger for chat prompt
  const [chatPromptTrigger, setChatPromptTrigger] = useState<string | undefined>(undefined);

  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);
// Fetch latest sensor data from Supabase
useEffect(() => {
  const fetchLatestReading = async () => {
    const { data } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setMoisture(data[0].moisture);
      setTemp(data[0].temperature);
      setPh(data[0].ph);
      setHasData(true);
      setIsConnected(true);
      setIsLanded(true);
      setSignalState('landed');
      setStatusText('May datos mula sa drone!');
    }
  };

  fetchLatestReading();
  const interval = setInterval(fetchLatestReading, 5000);
  return () => clearInterval(interval);
}, []);
  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update classification whenever sensors or crop preset change (only if data exists)
  useEffect(() => {
    if (hasData) {
      const result = classifySoil(moisture, temp, ph, selectedCrop, language, crops);
      setClassification(result);
    }
  }, [moisture, temp, ph, selectedCrop, language, hasData, crops]);

  // Helper to create rich telemetry reading object
  const createTelemetryPacket = (
    mVal: number,
    tVal: number,
    pVal: number,
    cropId: string,
    result: SoilClassificationResult
  ): TelemetryReading => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullDateStr = `${now.toLocaleDateString('fil-PH', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })} • ${timeStr}`;

    const cropObj = crops.find((c) => c.id === cropId);

    return {
      id: `packet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: dateStr,
      time: timeStr,
      fullDateTime: fullDateStr,
      timestamp: Date.now(),
      moisture: mVal,
      temp: tVal,
      ph: pVal,
      classification: result,
      cropPreset: cropId,
      cropName: cropObj?.name || 'Pangkalahatan',
      cropIcon: cropObj?.icon || '🌱',
    };
  };

  // Execute a sensing cycle when sensor touches soil
  const runSensingPass = (mVal?: number, tVal?: number, pVal?: number) => {
    setSignalState('sensing');
    setStatusText('Bumababa ang sensor sa root zone…');

    setTimeout(() => {
      // If manual values weren't provided, simulate realistic field variance
      const newMoisture = mVal !== undefined ? mVal : Math.round(15 + Math.random() * 75);
      const newTemp = tVal !== undefined ? tVal : Math.round(18 + Math.random() * 18);
      const newPh = pVal !== undefined ? pVal : Number((4.8 + Math.random() * 3.4).toFixed(1));

      setMoisture(newMoisture);
      setTemp(newTemp);
      setPh(newPh);
      setHasData(true);
      setIsLanded(true);

      const result = classifySoil(newMoisture, newTemp, newPh, selectedCrop, language, crops);
      setClassification(result);

      // Add to transmission log
      const reading = createTelemetryPacket(newMoisture, newTemp, newPh, selectedCrop, result);
      setLogEntries((prev) => [reading, ...prev.slice(0, 49)]);

      setSignalState('landed');
      setStatusText('Sensor landed! May datos na');

      // Auditory cue & speech
      playSensorLandedSound(voiceEnabled, language);
      if (voiceEnabled) {
        setTimeout(() => {
          const spoken = buildSpokenSummary(result, language);
          queueSpeech(spoken, voiceEnabled);
        }, 1200);
      }

      // Schedule next irregular aerial pass if live sensing is active
      if (isLive) {
        const nextDelay = 6000 + Math.random() * 3000;
        liveTimerRef.current = setTimeout(() => {
          runSensingPass();
        }, nextDelay);
      }
    }, 1000);
  };

  // Connect Drone Action
  const handleConnectDrone = () => {
    if (isConnected) return;
    setSignalState('connecting');
    setStatusText('Kumokonekta sa drone...');
    playConnectedSound(voiceEnabled, language);

    setTimeout(() => {
      setIsConnected(true);
      setSignalState('idle');
      setStatusText('Connected! Handa nang magbasa ang sensor');
    }, 1000);
  };

  // Land Sensor Action (Sensing into soil)
  const handleLandSensor = () => {
    if (!isConnected) {
      handleConnectDrone();
      setTimeout(() => {
        runSensingPass();
      }, 1200);
      return;
    }
    runSensingPass();
  };

  // Toggle Live Sensing
  const handleToggleLive = () => {
    if (isLive) {
      // Stop live
      setIsLive(false);
      setSignalState(isLanded ? 'landed' : 'idle');
      setStatusText(isLanded ? 'Naka-standby ang probe' : 'Naka-pause ang link');
      if (liveTimerRef.current) {
        clearTimeout(liveTimerRef.current);
      }
      stopSpeech();
    } else {
      // Start live
      setIsLive(true);
      if (!isConnected) {
        setIsConnected(true);
        playConnectedSound(voiceEnabled, language);
      }
      setSignalState('connecting');
      setStatusText('Kumokonekta para sa live continuous monitoring...');

      setTimeout(() => {
        runSensingPass();
      }, 1000);
    }
  };

  // Single Immediate Scan
  const handleScanOnce = () => {
    if (isLive) return;
    if (!isConnected) {
      setIsConnected(true);
      playConnectedSound(voiceEnabled, language);
      setTimeout(() => {
        runSensingPass();
      }, 800);
      return;
    }
    runSensingPass();
  };

  // Apply scenario preset
  const handleApplyScenario = (m: number, t: number, p: number) => {
    setIsConnected(true);
    setIsLanded(true);
    setHasData(true);
    setMoisture(m);
    setTemp(t);
    setPh(p);
    setSignalState('landed');
    setStatusText('Na-load ang kondisyon ng lupa');

    const result = classifySoil(m, t, p, selectedCrop, language, crops);
    setClassification(result);

    const reading = createTelemetryPacket(m, t, p, selectedCrop, result);
    setLogEntries((prev) => [reading, ...prev.slice(0, 49)]);

    playChime([660, 880]);
    if (voiceEnabled) {
      const spoken = buildSpokenSummary(result, language);
      speakImmediate(spoken, voiceEnabled);
    }
  };

  // Load a historical reading snapshot back into the active dashboard
  const handleLoadReadingFromHistory = (reading: TelemetryReading) => {
    setIsConnected(true);
    setIsLanded(true);
    setHasData(true);
    setMoisture(reading.moisture);
    setTemp(reading.temp);
    setPh(reading.ph);
    if (reading.cropPreset) {
      setSelectedCrop(reading.cropPreset);
    }
    setClassification(reading.classification);
    setSignalState('landed');
    setStatusText(`Na-load ang tala mula ${reading.date || 'nakaraan'}`);

    playChime([523.25, 659.25, 783.99]);
    if (voiceEnabled) {
      const cropName = reading.cropName || 'nakaraang pananim';
      queueSpeech(`Na-load ang reading noong ${reading.date || 'nakaraan'} para sa ${cropName}.`, voiceEnabled);
    }

    // Scroll to dashboard sensors smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ask Eastee AI about a specific historical reading
  const handleAskEasteeFromHistory = (prompt: string) => {
    setChatPromptTrigger(prompt);
    // Smooth scroll to chat section
    const chatSection = document.getElementById('chatSectionContainer');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clear all transmission logs
  const handleClearLog = () => {
    setLogEntries([]);
    try {
      localStorage.removeItem('eastai_packet_history_v2');
    } catch (e) {
      console.error('Failed to remove history from localStorage:', e);
    }
    playChime([440, 330]);
  };

  // Toggle Voice
  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (!next) {
      stopSpeech();
    } else {
      playChime([660, 880]);
      queueSpeech('Voice guide activated!', true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] text-[#2C3E2D] py-6 px-4 md:px-8 pb-20 selection:bg-[#E8F5E4]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2EAD8]">
          {/* Brand & Mascot */}
          <div className="flex items-center gap-3.5">
            <div
              className="animate-bob cursor-pointer"
              onClick={() => playChime([520, 680, 960])}
              title="I-click si Eastee para batiin ka!"
            >
              <Mascot className="w-13 h-13 md:w-15 md:h-15" isSensing={signalState === 'sensing'} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[#2C3E2D] tracking-tight m-0">
                  EastAi
                </h1>
                <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5E4] text-[#32642B] border border-[#C8DBC0]">
                  AGRI-PROBE
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#6E7D6A] font-semibold m-0">
                Drone Soil Telemetry &amp; Gabay para sa Magsasaka
              </p>
            </div>
          </div>

          {/* Status Cluster & Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Live Indicator Pill */}
            <div className="flex items-center gap-2 bg-white border border-[#DCE8D5] px-3.5 py-1.5 rounded-full shadow-2xs">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isLive
                    ? 'bg-[#4D8B43] animate-pulse-ring'
                    : signalState === 'connecting'
                    ? 'bg-[#D97706] animate-pulse'
                    : isConnected
                    ? 'bg-[#4D8B43]'
                    : 'bg-[#A0AEC0]'
                }`}
              />
              <span className="font-bold text-[#2C3E2D]">{statusText}</span>
            </div>

            {/* Drone Unit Badge */}
            <div className="bg-white border border-[#DCE8D5] px-3 py-1.5 rounded-full shadow-2xs text-[#6E7D6A]">
              Unit <span className="font-bold text-[#32642B]">DR-01</span>
            </div>

            {/* Live Clock */}
            <div className="bg-white border border-[#DCE8D5] px-3 py-1.5 rounded-full shadow-2xs font-mono text-[#6E7D6A]">
              {currentTime}
            </div>

            {/* Manage Crops Button */}
            <button
              id="headerCropManagerBtn"
              onClick={() => setIsCropManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DCE8D5] bg-white hover:bg-[#E8F5E4] text-xs font-bold text-[#32642B] transition-all shadow-2xs cursor-pointer"
              title="Pamahalaan o i-edit ang mga pananim at agronomy thresholds"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#4D8B43]" />
              <span className="hidden sm:inline">Mga Pananim ({crops.length})</span>
              <span className="sm:hidden">Pananim</span>
            </button>

            {/* Voice Toggle Button */}
            <button
              id="voiceToggleHeaderBtn"
              onClick={handleToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                voiceEnabled
                  ? 'bg-[#E8F5E4] border-[#C8DBC0] text-[#32642B] hover:bg-[#DCF0D8]'
                  : 'bg-[#FFE4E6] border-[#FECDD3] text-[#BE123C]'
              }`}
              title="I-on / I-off ang cute voice assistant"
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {voiceEnabled ? 'Cute Voice: On' : 'Voice: Muted'}
            </button>
          </div>
        </header>

        {/* MAIN TELEMETRY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Rig & Sensors (7 Cols) */}
          <section className="lg:col-span-7 bg-white border border-[#E2EAD8] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAD8]">
              <h2 className="font-display text-base font-bold text-[#2C3E2D] flex items-center gap-2 m-0">
                <Radio className="w-4 h-4 text-[#4D8B43]" /> Sensor Array — Drone Probe
              </h2>
              <span className="text-[11px] font-semibold text-[#6E7D6A] bg-[#F4FAF0] border border-[#DCE8D5] px-2.5 py-0.5 rounded-full">
                Lalim sa Lupa: 0–15cm
              </span>
            </div>

            {/* Visual Drone Scanning Rig */}
            <DroneRig isSensing={signalState === 'sensing'} signalState={signalState} />

            {/* Sensors Controls & Real-time lifecycle */}
            <SensorArray
              moisture={moisture}
              temp={temp}
              ph={ph}
              onMoistureChange={(m) => setMoisture(m)}
              onTempChange={(t) => setTemp(t)}
              onPhChange={(p) => setPh(p)}
              isLive={isLive}
              onToggleLive={handleToggleLive}
              onScanOnce={handleScanOnce}
              selectedCrop={selectedCrop}
              onSelectCrop={(crop) => setSelectedCrop(crop)}
              crops={crops}
              onOpenCropManager={() => setIsCropManagerOpen(true)}
              manualOverride={manualOverride}
              onToggleManualOverride={() => setManualOverride(!manualOverride)}
              onApplyScenario={handleApplyScenario}
              isConnected={isConnected}
              isLanded={isLanded}
              hasData={hasData}
              onConnectDrone={handleConnectDrone}
              onLandSensor={handleLandSensor}
            />
          </section>

          {/* RIGHT: Advisory & Recommendation (5 Cols) */}
          <section className="lg:col-span-5 bg-white border border-[#E2EAD8] rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAD8]">
              <h2 className="font-display text-base font-bold text-[#2C3E2D] flex items-center gap-2 m-0">
                <Sprout className="w-4 h-4 text-[#4D8B43]" /> Gabay sa Kalagayan ng Lupa
              </h2>
              <span className="text-xs font-bold text-[#32642B] bg-[#E8F5E4] border border-[#C8DBC0] px-2.5 py-0.5 rounded-full">
                {crops.find((c) => c.id === selectedCrop)?.name || 'Pangkalahatan'}
              </span>
            </div>

            <AdvisoryPanel
              classification={classification}
              moisture={moisture}
              temp={temp}
              ph={ph}
              voiceEnabled={voiceEnabled}
              language={language}
              onAskGuide={(q) => setChatPromptTrigger(q)}
            />
          </section>
        </div>

        {/* BOTTOM SECTION 1: Soil Rubric Reference Guide */}
        <section className="bg-white border border-[#E2EAD8] rounded-3xl p-5 md:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAD8]">
            <h2 className="font-display text-base font-bold text-[#2C3E2D] flex items-center gap-2 m-0">
              <span>📖</span> Rubric &amp; Kahulugan ng 3 Sensors
            </h2>
            <span className="text-xs font-bold text-[#6E7D6A] bg-[#F4FAF0] px-2.5 py-1 rounded-full border border-[#DCE8D5]">
              Agronomy Standards
            </span>
          </div>

          <SoilGuideRubric />
        </section>

        {/* BOTTOM SECTION 2: AI Field Guide (Eastee Gemini Chat) */}
        <section
          id="chatSectionContainer"
          className="bg-white border border-[#E2EAD8] rounded-3xl p-5 md:p-6 shadow-sm space-y-3 scroll-mt-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAD8]">
            <div className="flex items-center gap-2.5">
              <Mascot className="w-8 h-8" />
              <div>
                <h2 className="font-display text-base font-bold text-[#2C3E2D] m-0 flex items-center gap-1.5">
                  Tulong Mula kay Eastee <Sparkles className="w-4 h-4 text-[#D97706]" />
                </h2>
                <p className="text-[11px] text-[#6E7D6A] font-semibold m-0">
                  Itanong kung paano isasagawa ang mga rekomendasyon (Voice &amp; Text Chat)
                </p>
              </div>
            </div>
          </div>

          <ChatGuide
            classification={classification}
            moisture={moisture}
            temp={temp}
            ph={ph}
            selectedCrop={selectedCrop}
            voiceEnabled={voiceEnabled}
            language={language}
            onLanguageToggle={() => setLanguage(language === 'taglish' ? 'english' : 'taglish')}
            externalQuestionPrompt={chatPromptTrigger}
            onClearExternalPrompt={() => setChatPromptTrigger(undefined)}
          />
        </section>

        {/* BOTTOM SECTION 3: Historical Telemetry Transmission Log */}
        <section className="bg-white border border-[#E2EAD8] rounded-3xl p-5 md:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EAD8]">
            <h2 className="font-display text-base font-bold text-[#2C3E2D] flex items-center gap-2 m-0">
              <span>🗂️</span> Kasaysayan ng Telemetry (Packets Log)
            </h2>
            <span className="text-xs font-mono font-bold text-[#32642B] bg-[#E8F5E4] px-2.5 py-0.5 rounded-full border border-[#C8DBC0]">
              {logEntries.length} talaan
            </span>
          </div>

          <TransmissionLog
            entries={logEntries}
            onClearLog={handleClearLog}
            onLoadReading={handleLoadReadingFromHistory}
            onAskEastee={handleAskEasteeFromHistory}
          />
        </section>

        {/* CROP MANAGER MODAL */}
        <CropManagerModal
          isOpen={isCropManagerOpen}
          onClose={() => setIsCropManagerOpen(false)}
          crops={crops}
          onSaveCrops={handleSaveCrops}
          selectedCropId={selectedCrop}
          onSelectCrop={(id) => setSelectedCrop(id)}
        />

        {/* FOOTER */}
        <footer className="pt-6 border-t border-[#E2EAD8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C9B88] font-semibold">
          <div>EASTAI AGRI-TELEMETRY — Drone Soil Sensor System para sa mga Magsasaka</div>
          <div className="flex items-center gap-1.5">
            <span>Pinatatakbo ng Google Gemini AI &amp; Web Audio</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

