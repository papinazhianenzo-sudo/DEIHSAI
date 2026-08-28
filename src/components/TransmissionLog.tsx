import React, { useState, useMemo } from 'react';
import {
  Download,
  Trash2,
  Database,
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Droplets,
  Thermometer,
  FlaskConical,
  RotateCcw,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';
import { TelemetryReading } from '../types';

interface TransmissionLogProps {
  entries: TelemetryReading[];
  onClearLog: () => void;
  onLoadReading?: (reading: TelemetryReading) => void;
  onAskEastee?: (prompt: string) => void;
}

export const TransmissionLog: React.FC<TransmissionLogProps> = ({
  entries,
  onClearLog,
  onLoadReading,
  onAskEastee,
}) => {
  const [selectedReading, setSelectedReading] = useState<TelemetryReading | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'warn' | 'bad'>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Extract unique dates for filtering
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    entries.forEach((e) => {
      if (e.date) dates.add(e.date);
    });
    return Array.from(dates);
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.classification.overall !== statusFilter) {
        return false;
      }
      // Date filter
      if (dateFilter !== 'all' && item.date !== dateFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = (item.date || '').toLowerCase().includes(q);
        const matchesTime = (item.time || '').toLowerCase().includes(q);
        const matchesCrop = (item.cropName || item.cropPreset || '').toLowerCase().includes(q);
        const matchesOverall = (item.classification.overall || '').toLowerCase().includes(q);
        const matchesMoisture = item.classification.moisture.actionText.toLowerCase().includes(q);
        const matchesPh = item.classification.ph.actionText.toLowerCase().includes(q);
        return (
          matchesDate ||
          matchesTime ||
          matchesCrop ||
          matchesOverall ||
          matchesMoisture ||
          matchesPh
        );
      }
      return true;
    });
  }, [entries, statusFilter, dateFilter, searchQuery]);

  const exportCsv = () => {
    if (entries.length === 0) return;
    const headers = [
      'Petsa (Date)',
      'Oras (Time)',
      'Full Timestamp',
      'Pananim (Crop)',
      'Moisture (% RH)',
      'Moisture Condition',
      'Moisture Rekomendasyon',
      'Temperature (°C)',
      'Temp Condition',
      'Temp Rekomendasyon',
      'Soil pH',
      'pH Condition',
      'pH Rekomendasyon',
      'Pangkalahatang Kalagayan (Status)',
    ];

    const rows = entries.map((e) => [
      `"${e.date || ''}"`,
      `"${e.time || ''}"`,
      `"${e.fullDateTime || ''}"`,
      `"${e.cropName || e.cropPreset || 'Pangkalahatan'}"`,
      e.moisture,
      `"${e.classification.moisture.condition}"`,
      `"${e.classification.moisture.actionText}"`,
      e.temp,
      `"${e.classification.temp.condition}"`,
      `"${e.classification.temp.actionText}"`,
      e.ph.toFixed(1),
      `"${e.classification.ph.condition}"`,
      `"${e.classification.ph.actionText}"`,
      `"${e.classification.overall.toUpperCase()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `eastai-soil-history-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadges = {
    ok: {
      pill: 'bg-[#E8F5E4] text-[#32642B] border-[#C8DBC0]',
      label: 'Optimal / Maayos',
      icon: CheckCircle2,
    },
    warn: {
      pill: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
      label: 'May Babala',
      icon: AlertTriangle,
    },
    bad: {
      pill: 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]',
      label: 'Kailangan ng Aksyon',
      icon: AlertOctagon,
    },
  };

  return (
    <div className="space-y-4">
      {/* Header controls & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E2EAD8]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#E8F5E4] rounded-lg text-[#32642B]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-[#2C3E2D] font-bold">
              Kasaysayan ng mga Naitalang Telemetry Packets
            </p>
            <p className="text-[11px] text-[#6E7D6A] font-semibold">
              Maaaring i-check at buksan anumang oras ang mga naunang sukat at solusyon.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {entries.length > 0 && (
            <>
              <button
                id="exportCsvBtn"
                onClick={exportCsv}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-[#F4FAF0] text-[#32642B] border border-[#DCE8D5] shadow-2xs transition-colors cursor-pointer"
                title="I-download ang kumpletong report sa CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#4D8B43]" /> Export CSV
              </button>
              <button
                id="clearLogBtn"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#FFE4E6] text-[#6E7D6A] hover:text-[#BE123C] border border-[#DCE8D5] hover:border-[#FECDD3] transition-colors cursor-pointer shadow-2xs bg-white"
                title="Burahin ang kasaysayan"
              >
                <Trash2 className="w-3.5 h-3.5" /> Burahin
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation modal for clearing history */}
      {showClearConfirm && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-between gap-3">
          <div className="text-xs text-[#BE123C] font-semibold">
            Sigurado ka bang nais mong burahin ang lahat ng {entries.length} naitalang telemetry history?
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClearLog();
                setShowClearConfirm(false);
                setSelectedReading(null);
              }}
              className="px-3 py-1 bg-[#BE123C] text-white rounded-lg text-xs font-bold hover:bg-[#9F1239] transition-colors cursor-pointer"
            >
              Oo, Burahin
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 bg-white text-[#4A5568] border border-[#FECDD3] rounded-lg text-xs font-bold hover:bg-[#F9FBF8] transition-colors cursor-pointer"
            >
              Kanselahin
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#F9FBF8] p-2.5 rounded-2xl border border-[#E2EAD8]">
          {/* Search box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#8C9B88] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Maghanap ayon sa oras, pananim, o aksyon..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-white border border-[#DCE8D5] rounded-xl text-[#2C3E2D] placeholder:text-[#8C9B88] focus:outline-none focus:ring-1 focus:ring-[#4D8B43]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#8C9B88] hover:text-[#2C3E2D] text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#6E7D6A] shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs font-semibold bg-white border border-[#DCE8D5] rounded-xl text-[#2C3E2D] focus:outline-none focus:ring-1 focus:ring-[#4D8B43]"
            >
              <option value="all">Lahat ng Petsa ({entries.length})</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  📅 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#6E7D6A] shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs font-semibold bg-white border border-[#DCE8D5] rounded-xl text-[#2C3E2D] focus:outline-none focus:ring-1 focus:ring-[#4D8B43]"
            >
              <option value="all">Lahat ng Kalagayan</option>
              <option value="ok">🟢 Optimal / Maayos Lamang</option>
              <option value="warn">🟡 May Babala Lamang</option>
              <option value="bad">🔴 May Aksyon / Alerto Lamang</option>
            </select>
          </div>
        </div>
      )}

      {/* Main List Display */}
      {entries.length === 0 ? (
        <div className="py-8 px-4 text-center bg-[#F9FBF8] rounded-2xl border border-dashed border-[#DCE8D5] space-y-2">
          <Database className="w-8 h-8 text-[#A0AEC0] mx-auto stroke-1" />
          <p className="text-xs text-[#2C3E2D] font-bold">Wala pang nakatalang readings sa kasaysayan</p>
          <p className="text-xs text-[#6E7D6A] font-medium max-w-md mx-auto">
            I-connect ang drone at i-press ang <strong>"Simulan ang Scan"</strong> o <strong>"Live Continuous"</strong> upang awtomatikong mag-record ng mga telemetry packets.
          </p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <p className="text-xs text-[#6E7D6A] font-medium py-6 text-center bg-[#F9FBF8] rounded-2xl border border-[#DCE8D5]">
          Walang nakitang reading na tumutugma sa filter o search query.
        </p>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {filteredEntries.map((item) => {
            const badge = statusBadges[item.classification.overall] || statusBadges.ok;
            const isSelected = selectedReading?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedReading(item)}
                className={`group p-3 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-[#F4FAF0] border-[#4D8B43] ring-2 ring-[#4D8B43]/20'
                    : 'bg-[#F9FBF8] hover:bg-white border-[#E2EAD8] hover:border-[#BCD2B5]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                  {/* Left: Date, Time, Status, Crop */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badge.pill}`}
                    >
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-[#2C3E2D] font-bold">
                      <Calendar className="w-3 h-3 text-[#6E7D6A]" />
                      <span>{item.date || 'Ngayon'}</span>
                      <span className="text-[#A0AEC0]">•</span>
                      <Clock className="w-3 h-3 text-[#6E7D6A]" />
                      <span className="font-mono text-[#4D8B43]">{item.time}</span>
                    </div>

                    {item.cropName && (
                      <span className="text-[11px] font-bold text-[#6E7D6A] bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-full">
                        {item.cropIcon || '🌱'} {item.cropName}
                      </span>
                    )}
                  </div>

                  {/* Center/Right: Sensor Numbers & Inspect button */}
                  <div className="flex items-center gap-2 justify-between md:justify-end flex-wrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span
                        className="bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-md text-[#32642B] font-bold shadow-2xs"
                        title="Moisture reading"
                      >
                        💧 {item.moisture}% RH
                      </span>
                      <span
                        className="bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-md text-[#B45309] font-bold shadow-2xs"
                        title="Temperature reading"
                      >
                        🌡️ {item.temp}°C
                      </span>
                      <span
                        className="bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-md text-[#0284C7] font-bold shadow-2xs"
                        title="pH reading"
                      >
                        🧪 pH {item.ph.toFixed(1)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReading(item);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white group-hover:bg-[#E8F5E4] text-[#32642B] border border-[#DCE8D5] group-hover:border-[#C8DBC0] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3 h-3 text-[#4D8B43]" /> Suriin
                      <ChevronRight className="w-3 h-3 text-[#6E7D6A]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED SNAPSHOT MODAL / INSPECTOR */}
      {selectedReading && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#DCE8D5] rounded-3xl p-5 md:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2EAD8]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      statusBadges[selectedReading.classification.overall]?.pill
                    }`}
                  >
                    {statusBadges[selectedReading.classification.overall]?.label}
                  </span>
                  <span className="text-xs font-semibold text-[#6E7D6A]">
                    ID: {selectedReading.id.slice(-8)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#2C3E2D] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4D8B43]" />
                  {selectedReading.fullDateTime || `${selectedReading.date} - ${selectedReading.time}`}
                </h3>
              </div>

              <button
                onClick={() => setSelectedReading(null)}
                className="p-1.5 rounded-full bg-[#F4FAF0] text-[#6E7D6A] hover:text-[#2C3E2D] hover:bg-[#E8F5E4] transition-colors cursor-pointer"
                title="Isara"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Pananim Badge */}
            {selectedReading.cropName && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F9FBF8] border border-[#E2EAD8] text-xs text-[#2C3E2D] font-semibold">
                <span className="text-base">{selectedReading.cropIcon || '🌱'}</span>
                <span>
                  Pananim noong sinusukat: <strong>{selectedReading.cropName}</strong>
                </span>
              </div>
            )}

            {/* 3 Metric Detail Cards with Exact Readings and Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E7D6A]">
                Detalye ng mga Sukat at Solusyon sa Bukid:
              </h4>

              {/* Moisture Card */}
              <div className="p-3 rounded-2xl bg-[#F9FBF8] border border-[#E2EAD8] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-[#32642B]" />
                    <span className="text-xs font-bold text-[#2C3E2D]">1. Moisture (Tubig sa Lupa)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#32642B] bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-md">
                    {selectedReading.moisture}% RH
                  </span>
                </div>
                <div className="text-xs text-[#4A5568] space-y-0.5">
                  <p>
                    <strong>Kondisyon:</strong> {selectedReading.classification.moisture.condition}
                  </p>
                  <p className="text-[#2C3E2D] font-medium">
                    <strong>Gagawin:</strong> {selectedReading.classification.moisture.actionText}
                  </p>
                </div>
              </div>

              {/* Temperature Card */}
              <div className="p-3 rounded-2xl bg-[#F9FBF8] border border-[#E2EAD8] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-[#B45309]" />
                    <span className="text-xs font-bold text-[#2C3E2D]">2. Temperature (Temperatura)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B45309] bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-md">
                    {selectedReading.temp}°C
                  </span>
                </div>
                <div className="text-xs text-[#4A5568] space-y-0.5">
                  <p>
                    <strong>Kondisyon:</strong> {selectedReading.classification.temp.condition}
                  </p>
                  <p className="text-[#2C3E2D] font-medium">
                    <strong>Gagawin:</strong> {selectedReading.classification.temp.actionText}
                  </p>
                </div>
              </div>

              {/* pH Card */}
              <div className="p-3 rounded-2xl bg-[#F9FBF8] border border-[#E2EAD8] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#0284C7]" />
                    <span className="text-xs font-bold text-[#2C3E2D]">3. Soil pH (Acidity / Alkalinity)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0284C7] bg-white border border-[#DCE8D5] px-2 py-0.5 rounded-md">
                    pH {selectedReading.ph.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-[#4A5568] space-y-0.5">
                  <p>
                    <strong>Kondisyon:</strong> {selectedReading.classification.ph.condition}
                  </p>
                  <p className="text-[#2C3E2D] font-medium">
                    <strong>Gagawin:</strong> {selectedReading.classification.ph.actionText}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E2EAD8] flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  if (onLoadReading) {
                    onLoadReading(selectedReading);
                    setSelectedReading(null);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-[#E8F5E4] hover:bg-[#DCF0D8] text-[#32642B] border border-[#C8DBC0] transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> I-load ang Sukat na Ito sa Dashboard
              </button>

              <button
                onClick={() => {
                  if (onAskEastee) {
                    const prompt = `Noong ${selectedReading.date || 'kamakailan'} ganito ang sukat ng lupa: Moisture ${selectedReading.moisture}%, Temp ${selectedReading.temp}°C, pH ${selectedReading.ph.toFixed(1)}. Paano ko ito aayusin nang sunod-sunod?`;
                    onAskEastee(prompt);
                    setSelectedReading(null);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-[#4D8B43] hover:bg-[#3E7436] text-white transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Itanong kay Eastee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
