import { SoilClassificationResult, ConditionLevel, CropPreset } from '../types';

export const DEFAULT_CROP_PRESETS: CropPreset[] = [
  {
    id: 'general',
    name: 'General Crops',
    tagalogName: 'Pangkalahatang Pananim',
    icon: '🌱',
    optimalMoisture: [35, 65],
    optimalTemp: [18, 30],
    optimalPh: [6.0, 7.2],
  },
  {
    id: 'rice',
    name: 'Rice Paddy (Palay)',
    tagalogName: 'Palayan',
    icon: '🌾',
    optimalMoisture: [60, 85],
    optimalTemp: [22, 32],
    optimalPh: [5.5, 6.8],
  },
  {
    id: 'vegetables',
    name: 'Vegetables (Gulay)',
    tagalogName: 'Mga Gulay',
    icon: '🥬',
    optimalMoisture: [40, 65],
    optimalTemp: [16, 28],
    optimalPh: [6.0, 7.0],
  },
  {
    id: 'corn',
    name: 'Corn (Mais)',
    tagalogName: 'Maisan',
    icon: '🌽',
    optimalMoisture: [35, 60],
    optimalTemp: [20, 32],
    optimalPh: [5.8, 7.0],
  },
  {
    id: 'coffee',
    name: 'Coffee / Cacao',
    tagalogName: 'Kape at Kakaw',
    icon: '☕',
    optimalMoisture: [45, 70],
    optimalTemp: [18, 27],
    optimalPh: [5.5, 6.5],
  },
];

export const CROP_PRESETS = DEFAULT_CROP_PRESETS;

export const POPULAR_CROP_TEMPLATES: Array<Omit<CropPreset, 'id'>> = [
  {
    name: 'Banana (Saging)',
    tagalogName: 'Sagingan',
    icon: '🍌',
    optimalMoisture: [50, 75],
    optimalTemp: [20, 30],
    optimalPh: [5.5, 7.0],
  },
  {
    name: 'Tomato (Kamatis)',
    tagalogName: 'Kamatisan',
    icon: '🍅',
    optimalMoisture: [45, 65],
    optimalTemp: [18, 28],
    optimalPh: [6.0, 6.8],
  },
  {
    name: 'Onion (Sibuyas)',
    tagalogName: 'Sibuyasan',
    icon: '🧅',
    optimalMoisture: [35, 55],
    optimalTemp: [18, 26],
    optimalPh: [6.0, 7.0],
  },
  {
    name: 'Eggplant (Talong)',
    tagalogName: 'Talong',
    icon: '🍆',
    optimalMoisture: [45, 65],
    optimalTemp: [21, 30],
    optimalPh: [5.8, 6.8],
  },
  {
    name: 'Chili (Siling Labuyo)',
    tagalogName: 'Silihan',
    icon: '🌶️',
    optimalMoisture: [35, 55],
    optimalTemp: [20, 32],
    optimalPh: [6.0, 6.8],
  },
  {
    name: 'Sugarcane (Tubo)',
    tagalogName: 'Tubuhan',
    icon: '🎋',
    optimalMoisture: [50, 75],
    optimalTemp: [22, 32],
    optimalPh: [6.0, 7.5],
  },
  {
    name: 'Pineapple (Pinya)',
    tagalogName: 'Pinyahan',
    icon: '🍍',
    optimalMoisture: [30, 55],
    optimalTemp: [20, 30],
    optimalPh: [4.5, 6.0],
  },
  {
    name: 'Cassava (Kamoteng Kahoy)',
    tagalogName: 'Kamoteng Kahoy',
    icon: '🥔',
    optimalMoisture: [30, 55],
    optimalTemp: [22, 32],
    optimalPh: [5.5, 6.5],
  },
];

export function classifySoil(
  moisture: number,
  temp: number,
  ph: number,
  cropId: string = 'general',
  lang: 'taglish' | 'english' = 'taglish',
  availableCrops: CropPreset[] = DEFAULT_CROP_PRESETS
): SoilClassificationResult {
  const crop =
    availableCrops.find((c) => c.id === cropId) ||
    availableCrops[0] ||
    DEFAULT_CROP_PRESETS[0];

  // 1. Moisture classification
  let mCond: string;
  let mLevel: ConditionLevel;
  let mDo: string;
  let mDetail: string;

  if (moisture < crop.optimalMoisture[0]) {
    mCond = 'dry';
    mLevel = 'bad';
    mDo = lang === 'taglish' ? 'irrigate' : 'irrigate root zone';
    mDetail =
      lang === 'taglish'
        ? `Mababa ang moisture (${moisture}%) para sa ${crop.name}. Mag-schedule ng patubig o drip irrigation sa ugat.`
        : `Moisture is low (${moisture}%). Schedule drip irrigation directly to the root zone.`;
  } else if (moisture > crop.optimalMoisture[1]) {
    mCond = 'wet';
    mLevel = 'warn';
    mDo = lang === 'taglish' ? 'direct sunlight / drain' : 'improve drainage';
    mDetail =
      lang === 'taglish'
        ? `Sobrang basa ang lupa (${moisture}%). Gumawa ng drainage canals at patuyuin sa sikat ng araw upang maiwasan ang root rot.`
        : `Soil is waterlogged (${moisture}%). Open drainage channels and avoid watering to prevent root asphyxiation.`;
  } else {
    mCond = 'moist';
    mLevel = 'ok';
    mDo = lang === 'taglish' ? 'maintain schedule' : 'maintain schedule';
    mDetail =
      lang === 'taglish'
        ? `Nasa tamang lebel ang tubig (${moisture}%). Ituloy ang kasalukuyang watering routine.`
        : `Optimal moisture range (${moisture}%). Keep regular watering intervals.`;
  }

  // 2. Temperature classification
  let tCond: string;
  let tLevel: ConditionLevel;
  let tDo: string;
  let tDetail: string;

  if (temp < crop.optimalTemp[0]) {
    tCond = 'cold';
    tLevel = 'bad';
    tDo = lang === 'taglish' ? 'delay planting / mulch' : 'apply thermal mulch';
    mDetail =
      lang === 'taglish'
        ? `Malamig ang lupa (${temp}°C). Mabagal ang nutrient uptake. Maglagay ng mulch o plastic cover para uminit.`
        : `Soil temperature is low (${temp}°C). Delay seeding or apply plastic mulching to trap thermal heat.`;
  } else if (temp > crop.optimalTemp[1]) {
    tCond = 'hot';
    tLevel = 'warn';
    tDo = lang === 'taglish' ? 'add shade / mulch' : 'install shade netting';
    tDetail =
      lang === 'taglish'
        ? `Mataas ang temperatura ng lupa (${temp}°C). Maglagay ng 2-3 pulgadang dayami (mulch) o shade net para protektahan ang ugat.`
        : `High soil temperature (${temp}°C). Apply organic straw mulch and deploy 50% shade netting.`;
  } else {
    tCond = 'optimal';
    tLevel = 'ok';
    tDo = lang === 'taglish' ? 'continue as planned' : 'optimal conditions';
    tDetail =
      lang === 'taglish'
        ? `Nasa mainam na temperatura (${temp}°C) ang root zone para sa malusog na paglago.`
        : `Soil temperature (${temp}°C) is in the prime physiological growth bracket.`;
  }

  // 3. pH classification
  let pCond: string;
  let pLevel: ConditionLevel;
  let pDo: string;
  let pDetail: string;

  const phVal = Number(ph.toFixed(1));
  if (phVal < crop.optimalPh[0]) {
    pCond = 'acidic';
    pLevel = 'bad';
    pDo = lang === 'taglish' ? 'apply agricultural lime' : 'apply agricultural lime (calcite)';
    pDetail =
      lang === 'taglish'
        ? `Maasim ang lupa (pH ${phVal}). Nahihirapan ang ugat kumuha ng phosphorus. Maglagay ng agricultural lime (apog) para itaas ang pH.`
        : `Soil is acidic (pH ${phVal}). Phosphorus availability is restricted. Broadcast agricultural lime (CaCO3) to elevate pH.`;
  } else if (phVal > crop.optimalPh[1]) {
    pCond = 'alkaline';
    pLevel = 'warn';
    pDo = lang === 'taglish' ? 'add sulfur / compost' : 'amend with elemental sulfur / compost';
    pDetail =
      lang === 'taglish'
        ? `Alkaline ang lupa (pH ${phVal}). Maaaring magkulang sa iron at zinc. Maghalo ng organic compost o elemental sulfur para bumaba ang pH.`
        : `Soil is alkaline (pH ${phVal}). Micronutrient lockup may occur. Incorporate compost or elemental sulfur to lower pH.`;
  } else {
    pCond = 'optimal';
    pLevel = 'ok';
    pDo = lang === 'taglish' ? 'no correction needed' : 'balanced pH';
    pDetail =
      lang === 'taglish'
        ? `Balanseng pH (${phVal}). Mabilis ma-absorb ng ${crop.name} ang mga sustansya.`
        : `Balanced pH (${phVal}). Excellent nutrient bioavailability for crop roots.`;
  }

  // Overall calculation
  const levels = [mLevel, tLevel, pLevel];
  let overall: ConditionLevel = 'ok';
  if (levels.includes('bad')) {
    overall = 'bad';
  } else if (levels.includes('warn')) {
    overall = 'warn';
  }

  return {
    moisture: { condition: mCond, level: mLevel, actionText: mDo, detail: mDetail },
    temp: { condition: tCond, level: tLevel, actionText: tDo, detail: tDetail },
    ph: { condition: pCond, level: pLevel, actionText: pDo, detail: pDetail },
    overall,
  };
}

export function buildSpokenSummary(result: SoilClassificationResult, lang: 'taglish' | 'english' = 'taglish'): string {
  if (result.overall === 'ok') {
    return lang === 'taglish'
      ? 'Maganda at normal ang kondisyon ng lupa ngayon! Walang kailangang agarang aksyon.'
      : 'Soil conditions are healthy and optimal. No immediate corrections required.';
  }

  const parts: string[] = [];
  if (result.moisture.level !== 'ok') {
    parts.push(
      lang === 'taglish'
        ? `Ang moisture ay ${result.moisture.condition}. Dapat pong ${result.moisture.actionText}.`
        : `Soil moisture is ${result.moisture.condition}. Action: ${result.moisture.actionText}.`
    );
  }
  if (result.temp.level !== 'ok') {
    parts.push(
      lang === 'taglish'
        ? `Ang temperatura ay ${result.temp.condition}. Dapat pong ${result.temp.actionText}.`
        : `Temperature is ${result.temp.condition}. Action: ${result.temp.actionText}.`
    );
  }
  if (result.ph.level !== 'ok') {
    parts.push(
      lang === 'taglish'
        ? `Ang pH ay ${result.ph.condition}. Dapat pong ${result.ph.actionText}.`
        : `Soil pH is ${result.ph.condition}. Action: ${result.ph.actionText}.`
    );
  }

  return parts.join(' ');
}
