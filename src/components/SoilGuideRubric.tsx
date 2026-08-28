import React from 'react';
import { BookOpen, Droplets, Thermometer, FlaskConical } from 'lucide-react';

export const SoilGuideRubric: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#4D8B43]" />
        <p className="text-xs text-[#6E7D6A] font-semibold">
          Gagabay sa mga magsasaka: Alamin ang ibig sabihin ng kondisyon ng bawat sensor at solusyon sa bukid.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* 1. Moisture Column */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2EAD8]">
            <div className="p-1.5 bg-[#E8F5E4] rounded-lg text-[#32642B]">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C3E2D]">1. Moisture (Tubig sa Lupa)</h3>
              <span className="text-[11px] font-semibold text-[#6E7D6A]">Lebel ng halumigmig sa ugat</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#BE123C]">Dry (&lt; 20%)</span>
              <span className="text-[10px] font-bold uppercase bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded border border-[#FECDD3]">Kulang sa Tubig</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Tuyot ang lupa. Nanganganib malanta at matuyo ang pananim.<br />
              <strong>Solusyon:</strong> Magdilig agad (irrigation / drip) sa root zone bago sumikat ang matinding araw.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#C8DBC0] bg-[#F4FAF0] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#32642B]">Moist (20% – 65%)</span>
              <span className="text-[10px] font-bold uppercase bg-[#E8F5E4] text-[#32642B] px-1.5 py-0.5 rounded border border-[#C8DBC0]">Tamang-tama</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Sakto ang moisture. Malulusog ang mga ugat at mabilis sumipsip ng pataba.<br />
              <strong>Solusyon:</strong> Panatilihin ang kasalukuyang iskedyul ng patubig.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#B45309]">Wet (&gt; 65%)</span>
              <span className="text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#B45309] px-1.5 py-0.5 rounded border border-[#FDE68A]">Babad sa Tubig</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Sobrang basa at nagtubig. Panganib ang pagkabulok ng ugat (root rot).<br />
              <strong>Solusyon:</strong> Ipa-direct sunlight o gumawa ng kanal/drainage para maalis ang labis na tubig.
            </p>
          </div>
        </div>

        {/* 2. Temperature Column */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2EAD8]">
            <div className="p-1.5 bg-[#FEF3C7] rounded-lg text-[#B45309]">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C3E2D]">2. Temperature (Temperatura)</h3>
              <span className="text-[11px] font-semibold text-[#6E7D6A]">Init o lamig sa root zone</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#0369A1]">Cold (&lt; 15°C)</span>
              <span className="text-[10px] font-bold uppercase bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded border border-[#BAE6FD]">Malamig</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Mababa ang temperatura ng lupa. Mabagal tumubo ang binhi at humihina ang absorption.<br />
              <strong>Solusyon:</strong> Maglagay ng organic mulch o plastic mulch upang ma-trap ang init.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#C8DBC0] bg-[#F4FAF0] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#32642B]">Optimal (15°C – 32°C)</span>
              <span className="text-[10px] font-bold uppercase bg-[#E8F5E4] text-[#32642B] px-1.5 py-0.5 rounded border border-[#C8DBC0]">Tamang-tama</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Magandang biological activity ng mga kapaki-pakinabang na mikrobyo sa lupa.<br />
              <strong>Solusyon:</strong> Mainam para sa patuloy na paglago ng halaman.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#BE123C]">Hot (&gt; 32°C)</span>
              <span className="text-[10px] font-bold uppercase bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded border border-[#FECDD3]">Napakainit</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Sobrang init sa ugat, nagiging dahilan ng heat stress at pagkalanta.<br />
              <strong>Solusyon:</strong> Maglagay ng dayami (mulch), maglagay ng shade netting, o magdilig sa hapon.
            </p>
          </div>
        </div>

        {/* 3. Soil pH Column */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E2EAD8]">
            <div className="p-1.5 bg-[#E0F2FE] rounded-lg text-[#0284C7]">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C3E2D]">3. Soil pH (Acidity / Alkalinity)</h3>
              <span className="text-[11px] font-semibold text-[#6E7D6A]">Balanse ng asim at alkali</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#BE123C]">Acidic (&lt; 5.5 pH)</span>
              <span className="text-[10px] font-bold uppercase bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded border border-[#FECDD3]">Maasim na Lupa</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Ma-asim ang lupa. Hindi ma-absorb ng halaman ang Phosphorus at Potassium.<br />
              <strong>Solusyon:</strong> Maglagay ng agricultural lime (apog) o dolomite para pataasin ang pH.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#C8DBC0] bg-[#F4FAF0] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#32642B]">Optimal (5.5 – 7.5 pH)</span>
              <span className="text-[10px] font-bold uppercase bg-[#E8F5E4] text-[#32642B] px-1.5 py-0.5 rounded border border-[#C8DBC0]">Tamang Balanse</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Neutral at balanseng lebel. Madaling ma-absorb ang lahat ng sustansya (NPK).<br />
              <strong>Solusyon:</strong> Panatilihin gamit ang organic compost o balanseng pataba.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-xs text-[#B45309]">Alkaline (&gt; 7.5 pH)</span>
              <span className="text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#B45309] px-1.5 py-0.5 rounded border border-[#FDE68A]">Alkaline / Maalat</span>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              <strong>Kahulugan:</strong> Mataas ang alkali/chalk. Nagkukulang ang halaman sa Iron, Zinc, at Manganese.<br />
              <strong>Solusyon:</strong> Maglagay ng elemental sulfur, peat moss, o organic compost upang ibaba ang pH.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

