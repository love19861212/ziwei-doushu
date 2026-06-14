#!/usr/bin/env node
// 准备: 用 Spencer 1971 (NOAA 太阳表标准, 秒级精度) 重算 5 case 期望值
// 用法: npx tsx scripts/verify-spencer.mjs
//
// 跟当前 EoT 公式对比, 看 Spencer 1971 算出啥
//   当前公式: 9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B) (Meeus 简化变种, 符号反)
//   Spencer 1971: 229.18 * [0.000075 + 0.001868 cos(γ) - 0.032077 sin(γ) - 0.014615 cos(2γ) - 0.040849 sin(2γ)]
//                  γ = 2π/365 * (N - 1)

const SHICHEN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// Spencer 1971 完整 EoT (秒级精度)
function spencerEot(dayOfYear) {
  const γ = 2 * Math.PI / 365 * (dayOfYear - 1);
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(γ)
    - 0.032077 * Math.sin(γ)
    - 0.014615 * Math.cos(2 * γ)
    - 0.040849 * Math.sin(2 * γ)
  );
}

function trueSolarHM(clockHour, clockMinute, longitude, dayOfYear) {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;  // 经度差 → 分钟 (平太阳时)
  const eot = spencerEot(dayOfYear);     // Spencer 1971 EoT
  const total = clockMins - offset + eot;
  const solar = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(solar / 60);
  const m = Math.round(solar % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

function trueSolarBranch(clockHour, clockMinute, longitude, dayOfYear) {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;
  const eot = spencerEot(dayOfYear);
  const solarMins = ((clockMins - offset + eot) % 1440 + 1440) % 1440;
  // 23:00-23:59 (1380-1440) 或 00:00-00:59 (0-60) → 子时(0)
  if (solarMins >= 1380 || solarMins < 60) return 0;
  return Math.floor((solarMins - 60) / 120) + 1;
}

function dayOfYear(year, month, day) {
  const d = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

// 5 case 跟 test-true-solar.mjs 一致
const cases = [
  { label: '1️⃣ 王二 16:00 + 104.38°E', y: 1987, m: 1, d: 11, h: 16, mi: 0, lon: 104.38333 },
  { label: '3️⃣ 新疆 11:30 + 79.92°E', y: 1995, m: 6, d: 16, h: 11, mi: 30, lon: 79.92 },
  { label: '4️⃣ 早子 00:30 + 104.40°E', y: 1987, m: 1, d: 12, h: 0, mi: 30, lon: 104.40 },
  { label: '5️⃣ 晚子 23:30 + 104.40°E', y: 1987, m: 1, d: 11, h: 23, mi: 30, lon: 104.40 },
];

console.log('═'.repeat(70));
console.log('Spencer 1971 vs 当前公式 (Meeus 简化变种) 对比');
console.log('═'.repeat(70));

for (const c of cases) {
  const doy = dayOfYear(c.y, c.m, c.d);
  const spencerEotVal = spencerEot(doy);
  // 当前公式
  const B = (2 * Math.PI / 365) * (doy - 81);
  const currentEot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  const spencerHM = trueSolarHM(c.h, c.mi, c.lon, doy);
  const spencerBranch = trueSolarBranch(c.h, c.mi, c.lon, doy);
  console.log(`\n${c.label}`);
  console.log(`  dayOfYear: ${doy}`);
  console.log(`  EoT 当前: ${currentEot.toFixed(2)} min,  Spencer 1971: ${spencerEotVal.toFixed(2)} min,  差: ${(spencerEotVal - currentEot).toFixed(2)} min`);
  console.log(`  Spencer 算: ${spencerHM} (${SHICHEN[spencerBranch]})`);
}

console.log('\n═'.repeat(70));
