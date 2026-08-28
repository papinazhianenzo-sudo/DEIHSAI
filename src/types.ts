export type ConditionLevel = 'ok' | 'warn' | 'bad';

export type MoistureCondition = 'dry' | 'moist' | 'wet';
export type TempCondition = 'cold' | 'optimal' | 'hot';
export type PhCondition = 'acidic' | 'optimal' | 'alkaline';

export interface MetricAssessment {
  condition: string;
  level: ConditionLevel;
  actionText: string;
  detail: string;
}

export interface SoilClassificationResult {
  moisture: MetricAssessment;
  temp: MetricAssessment;
  ph: MetricAssessment;
  overall: ConditionLevel;
}

export interface TelemetryReading {
  id: string;
  date: string;
  time: string;
  fullDateTime: string;
  timestamp: number;
  moisture: number; // 0 - 100%
  temp: number;     // -5 - 45 °C
  ph: number;       // 3.0 - 9.5
  classification: SoilClassificationResult;
  cropPreset?: string;
  cropName?: string;
  cropIcon?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CropPreset {
  id: string;
  name: string;
  tagalogName: string;
  icon: string;
  optimalMoisture: [number, number];
  optimalTemp: [number, number];
  optimalPh: [number, number];
}
