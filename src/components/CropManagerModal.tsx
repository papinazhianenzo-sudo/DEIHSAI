import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  Droplets,
  Thermometer,
  FlaskConical,
  AlertCircle,
} from 'lucide-react';
import { CropPreset } from '../types';
import { DEFAULT_CROP_PRESETS, POPULAR_CROP_TEMPLATES } from '../utils/soilClassifier';

interface CropManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: CropPreset[];
  onSaveCrops: (updatedCrops: CropPreset[]) => void;
  selectedCropId: string;
  onSelectCrop: (cropId: string) => void;
}

const COMMON_EMOJIS = ['🌱', '🌾', '🌽', '🥬', '☕', '🍌', '🍅', '🧅', '🍆', '🌶️', '🎋', '🍍', '🥔', '🍓', '🥭', '🍉', '🥜', '🌿', '🌻', '🧄'];

export const CropManagerModal: React.FC<CropManagerModalProps> = ({
  isOpen,
  onClose,
  crops,
  onSaveCrops,
  selectedCropId,
  onSelectCrop,
}) => {
  const [editingCrop, setEditingCrop] = useState<CropPreset | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Form states for creating/editing
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    tagalogName: string;
    icon: string;
    minMoisture: number;
    maxMoisture: number;
    minTemp: number;
    maxTemp: number;
    minPh: number;
    maxPh: number;
  }>({
    id: '',
    name: '',
    tagalogName: '',
    icon: '🌱',
    minMoisture: 40,
    maxMoisture: 70,
    minTemp: 20,
    maxTemp: 30,
    minPh: 6.0,
    maxPh: 7.0,
  });

  if (!isOpen) return null;

  const startEdit = (crop: CropPreset) => {
    setErrorMessage('');
    setIsCreatingNew(false);
    setEditingCrop(crop);
    setFormData({
      id: crop.id,
      name: crop.name,
      tagalogName: crop.tagalogName,
      icon: crop.icon || '🌱',
      minMoisture: crop.optimalMoisture[0],
      maxMoisture: crop.optimalMoisture[1],
      minTemp: crop.optimalTemp[0],
      maxTemp: crop.optimalTemp[1],
      minPh: crop.optimalPh[0],
      maxPh: crop.optimalPh[1],
    });
  };

  const startCreate = () => {
    setErrorMessage('');
    setEditingCrop(null);
    setIsCreatingNew(true);
    setFormData({
      id: `custom-${Date.now()}`,
      name: '',
      tagalogName: '',
      icon: '🌱',
      minMoisture: 40,
      maxMoisture: 65,
      minTemp: 20,
      maxTemp: 30,
      minPh: 6.0,
      maxPh: 7.0,
    });
  };

  const applyTemplate = (template: Omit<CropPreset, 'id'>) => {
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      tagalogName: template.tagalogName,
      icon: template.icon,
      minMoisture: template.optimalMoisture[0],
      maxMoisture: template.optimalMoisture[1],
      minTemp: template.optimalTemp[0],
      maxTemp: template.optimalTemp[1],
      minPh: template.optimalPh[0],
      maxPh: template.optimalPh[1],
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Pakilagay ang pangalan ng pananim (Crop Name is required).');
      return;
    }

    if (formData.minMoisture >= formData.maxMoisture) {
      setErrorMessage('Ang Pinakamababang Moisture ay dapat mas mababa kaysa sa Pinakamataas.');
      return;
    }

    if (formData.minTemp >= formData.maxTemp) {
      setErrorMessage('Ang Pinakamababang Temperatura ay dapat mas mababa kaysa sa Pinakamataas.');
      return;
    }

    if (formData.minPh >= formData.maxPh) {
      setErrorMessage('Ang Pinakamababang pH ay dapat mas mababa kaysa sa Pinakamataas.');
      return;
    }

    const updatedPreset: CropPreset = {
      id: formData.id,
      name: formData.name.trim(),
      tagalogName: formData.tagalogName.trim() || formData.name.trim(),
      icon: formData.icon.trim() || '🌱',
      optimalMoisture: [Number(formData.minMoisture), Number(formData.maxMoisture)],
      optimalTemp: [Number(formData.minTemp), Number(formData.maxTemp)],
      optimalPh: [Number(formData.minPh), Number(formData.maxPh)],
    };

    let updatedList: CropPreset[];
    if (isCreatingNew) {
      updatedList = [...crops, updatedPreset];
      onSelectCrop(updatedPreset.id);
    } else {
      updatedList = crops.map((c) => (c.id === updatedPreset.id ? updatedPreset : c));
    }

    onSaveCrops(updatedList);
    setEditingCrop(null);
    setIsCreatingNew(false);
  };

  const handleDeleteCrop = (cropId: string) => {
    if (crops.length <= 1) {
      setErrorMessage('Kailangang may kahit isang (1) uri ng pananim na manatili.');
      return;
    }
    const updatedList = crops.filter((c) => c.id !== cropId);
    onSaveCrops(updatedList);
    if (selectedCropId === cropId && updatedList.length > 0) {
      onSelectCrop(updatedList[0].id);
    }
    if (editingCrop?.id === cropId) {
      setEditingCrop(null);
      setIsCreatingNew(false);
    }
  };

  const handleResetDefaults = () => {
    onSaveCrops(DEFAULT_CROP_PRESETS);
    onSelectCrop(DEFAULT_CROP_PRESETS[0].id);
    setShowResetConfirm(false);
    setEditingCrop(null);
    setIsCreatingNew(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-[#DCE8D5] rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2EAD8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E8F5E4] rounded-xl text-[#32642B] font-bold text-lg shadow-2xs">
              🌾
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C3E2D]">
                Pamahalaan at I-edit ang mga Uri ng Pananim
              </h2>
              <p className="text-xs text-[#6E7D6A] font-medium">
                I-customize ang pangalan, icon, at ideal na Moisture, Temp, at pH ng iyong tanim.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F4FAF0] text-[#6E7D6A] hover:text-[#2C3E2D] hover:bg-[#E8F5E4] transition-colors cursor-pointer"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl flex items-center gap-2 text-xs text-[#BE123C] font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="p-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-[#B45309] font-semibold">
              Ibalik ang mga pananim sa orihinal na listahan (Palay, Mais, Gulay, Kape, General)?
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1 bg-[#D97706] text-white rounded-lg text-xs font-bold hover:bg-[#B45309] transition-colors cursor-pointer"
              >
                Oo, I-reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 bg-white text-[#4A5568] border border-[#FDE68A] rounded-lg text-xs font-bold hover:bg-[#F9FBF8] transition-colors cursor-pointer"
              >
                Kanselahin
              </button>
            </div>
          </div>
        )}

        {/* FORM (Editing or Creating New) */}
        {(editingCrop || isCreatingNew) && (
          <form
            onSubmit={handleSaveForm}
            className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#4D8B43]/30 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#E2EAD8] pb-2">
              <h3 className="text-sm font-bold text-[#2C3E2D] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#4D8B43]" />
                {isCreatingNew ? 'Magdagdag ng Bagong Pananim' : `I-edit: ${formData.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCrop(null);
                  setIsCreatingNew(false);
                  setErrorMessage('');
                }}
                className="text-xs font-bold text-[#6E7D6A] hover:text-[#2C3E2D] cursor-pointer"
              >
                Kanselahin
              </button>
            </div>

            {/* Quick Templates (only when creating or user wants ideas) */}
            {isCreatingNew && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E7D6A] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D97706]" />
                  Pumili sa mga Popular na Pananim sa Pilipinas:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {POPULAR_CROP_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-[#E8F5E4] text-[#2C3E2D] border border-[#DCE8D5] hover:border-[#BCD2B5] transition-colors cursor-pointer shadow-2xs"
                    >
                      {tmpl.icon} {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs: Name, Tagalog Name, Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Icon selection */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-[#2C3E2D]">Icon / Emoji</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl p-2 bg-white border border-[#DCE8D5] rounded-xl flex items-center justify-center min-w-[48px]">
                    {formData.icon}
                  </span>
                  <div className="flex-1">
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full text-xs font-bold py-2 px-2 bg-white border border-[#DCE8D5] rounded-xl text-[#2C3E2D] focus:ring-1 focus:ring-[#4D8B43]"
                    >
                      {COMMON_EMOJIS.map((em) => (
                        <option key={em} value={em}>
                          {em} Emoji
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Crop Name */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold text-[#2C3E2D]">
                  Pangalan ng Pananim (Crop Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hal. Saging (Banana)"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-[#DCE8D5] rounded-xl text-[#2C3E2D] focus:outline-none focus:ring-2 focus:ring-[#4D8B43]"
                />
              </div>

              {/* Tagalog/Local Name */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-[#2C3E2D]">Local / Tagalog Label</label>
                <input
                  type="text"
                  value={formData.tagalogName}
                  onChange={(e) => setFormData({ ...formData, tagalogName: e.target.value })}
                  placeholder="Hal. Sagingan"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-[#DCE8D5] rounded-xl text-[#2C3E2D] focus:outline-none focus:ring-2 focus:ring-[#4D8B43]"
                />
              </div>
            </div>

            {/* Threshold Ranges (Moisture, Temp, pH) */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E7D6A]">
                Tamang Kondisyon (Optimal Agronomy Range):
              </h4>

              {/* Moisture Range */}
              <div className="p-3 rounded-xl bg-white border border-[#E2EAD8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-[#32642B]" />
                    <span className="text-xs font-bold text-[#2C3E2D]">Ideal Moisture (% RH)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#32642B] bg-[#E8F5E4] px-2 py-0.5 rounded-md">
                    {formData.minMoisture}% - {formData.maxMoisture}% RH
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6E7D6A]">Min (Pinakamababa %)</label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={formData.minMoisture}
                      onChange={(e) =>
                        setFormData({ ...formData, minMoisture: Number(e.target.value) })
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F9FBF8] border border-[#DCE8D5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6E7D6A]">Max (Pinakamataas %)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.maxMoisture}
                      onChange={(e) =>
                        setFormData({ ...formData, maxMoisture: Number(e.target.value) })
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F9FBF8] border border-[#DCE8D5] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Temperature Range */}
              <div className="p-3 rounded-xl bg-white border border-[#E2EAD8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-[#B45309]" />
                    <span className="text-xs font-bold text-[#2C3E2D]">Ideal Temperature (°C)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                    {formData.minTemp}°C - {formData.maxTemp}°C
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6E7D6A]">Min (Pinakamababa °C)</label>
                    <input
                      type="number"
                      min={-5}
                      max={40}
                      value={formData.minTemp}
                      onChange={(e) =>
                        setFormData({ ...formData, minTemp: Number(e.target.value) })
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F9FBF8] border border-[#DCE8D5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6E7D6A]">Max (Pinakamataas °C)</label>
                    <input
                      type="number"
                      min={0}
                      max={45}
                      value={formData.maxTemp}
                      onChange={(e) =>
                        setFormData({ ...formData, maxTemp: Number(e.target.value) })
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F9FBF8] border border-[#DCE8D5] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Soil pH Range */}
              <div className="p-3 rounded-xl bg-white border border-[#E2EAD8] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#0284C7]" />
                    <span className="text-xs font-bold text-[#2C3E2D]">Ideal Soil pH Level</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md">
                    pH {formData.minPh.toFixed(1)} - {formData.maxPh.toFixed(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6E7D6A]">Min (Pinakamababa pH)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={3.0}
                      max={9.0}
                      value={formData.minPh}
                      onChange={(e) =>
                        setFormData({ ...formData, minPh: Number(parseFloat(e.target.value).toFixed(1)) })
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F9FBF8] border border-[#DCE8D5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6E7D6A]">Max (Pinakamataas pH)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={3.5}
                      max={9.5}
                      value={formData.maxPh}
                      onChange={(e) =>
                        setFormData({ ...formData, maxPh: Number(parseFloat(e.target.value).toFixed(1)) })
                      }
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-[#F9FBF8] border border-[#DCE8D5] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Cancel buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCrop(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2 rounded-full border border-[#DCE8D5] bg-white text-xs font-bold text-[#6E7D6A] hover:bg-[#F9FBF8] cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#4D8B43] hover:bg-[#3E7436] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {isCreatingNew ? 'I-save ang Bagong Pananim' : 'I-update ang Pananim'}
              </button>
            </div>
          </form>
        )}

        {/* LIST OF CROPS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6E7D6A]">
              Kasalukuyang mga Pananim ({crops.length})
            </span>
            {!isCreatingNew && !editingCrop && (
              <button
                type="button"
                onClick={startCreate}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#4D8B43] hover:bg-[#3E7436] text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Magdagdag ng Pananim
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {crops.map((crop) => {
              const isSelected = selectedCropId === crop.id;
              return (
                <div
                  key={crop.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#F4FAF0] border-[#4D8B43] shadow-xs ring-1 ring-[#4D8B43]/20'
                      : 'bg-[#F9FBF8] border-[#E2EAD8] hover:bg-white hover:border-[#BCD2B5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white rounded-xl border border-[#DCE8D5] shadow-2xs">
                      {crop.icon || '🌱'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2C3E2D]">{crop.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#DCF0D8] text-[#32642B] border border-[#BCD2B5]">
                            Aktibong Pananim
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6E7D6A] font-medium">{crop.tagalogName}</p>

                      {/* Thresholds Badges */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap font-mono text-[11px]">
                        <span className="bg-white border border-[#DCE8D5] px-1.5 py-0.5 rounded text-[#32642B] font-bold">
                          💧 {crop.optimalMoisture[0]}-{crop.optimalMoisture[1]}%
                        </span>
                        <span className="bg-white border border-[#DCE8D5] px-1.5 py-0.5 rounded text-[#B45309] font-bold">
                          🌡️ {crop.optimalTemp[0]}-{crop.optimalTemp[1]}°C
                        </span>
                        <span className="bg-white border border-[#DCE8D5] px-1.5 py-0.5 rounded text-[#0284C7] font-bold">
                          🧪 pH {crop.optimalPh[0]}-{crop.optimalPh[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this crop */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => onSelectCrop(crop.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-[#E8F5E4] text-[#32642B] border border-[#DCE8D5] transition-colors cursor-pointer shadow-2xs"
                      >
                        Piliin
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(crop)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F4FAF0] text-[#4A5568] hover:text-[#2C3E2D] border border-[#DCE8D5] transition-colors cursor-pointer shadow-2xs"
                      title="I-edit ang pananim na ito"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#4D8B43]" />
                    </button>
                    {crops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCrop(crop.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#FFE4E6] text-[#6E7D6A] hover:text-[#BE123C] border border-[#DCE8D5] hover:border-[#FECDD3] transition-colors cursor-pointer shadow-2xs"
                        title="Burahin ang pananim na ito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Reset Option */}
        <div className="pt-3 border-t border-[#E2EAD8] flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#6E7D6A] hover:text-[#B45309] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ibalik sa Default na mga Pananim
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#4D8B43] hover:bg-[#3E7436] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Tapos Na
          </button>
        </div>
      </div>
    </div>
  );
};
