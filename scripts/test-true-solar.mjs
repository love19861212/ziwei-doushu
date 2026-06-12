#!/usr/bin/env node
// 5 case 自动化测试 — 真太阳时口径跟文默天机对齐
// 用法: node scripts/test-true-solar.mjs
// 退出码: 0=全过, 1=有失败

import { calcTrueSolarBranch, calcTrueSolarHM, toDayOfYear } from '../lib/ziwei/share.ts';

const SHICHEN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 5 case (跟文默天机截图实测对齐 — 2026-06-12 验证)
const cases = [
  {
    label: '1️⃣ 王二 公历 1987-01-11 16:00 + 104.38°E (跟文默实测 100% 一致)',
    clockHour: 16, clockMin: 0, longitude: 104.38333,
    year: 1987, month: 1, day: 11,
    expectHour: 7, expectWuxingJu: '金四局', expectMingGong: 6,
    expectTrueSolarHM: '14:50',
  },
  {
    label: '2️⃣ 赵太年 农历 1986-12-12 申时 (公历 1987-01-11, 12h mode)',
    clockHour: 15, clockMin: 0, longitude: 104.40,  // 申时→15:00
    year: 1987, month: 1, day: 11,
    expectHour: 7, expectWuxingJu: '金四局', expectMingGong: 6,
    expectTrueSolarHM: '13:50',
  },
  {
    label: '3️⃣ 新疆 1995-06-16 11:30 + 79.92°E (跨时辰)',
    clockHour: 11, clockMin: 30, longitude: 79.92,
    year: 1995, month: 6, day: 16,
    expectHour: 4, expectWuxingJu: '土五局', expectMingGong: 2,
    expectTrueSolarHM: '08:49',
  },
  {
    label: '4️⃣ 早子 1987-01-12 00:30 + 104.40°E (算次日, 倪海夏派)',
    clockHour: 0, clockMin: 30, longitude: 104.40,
    year: 1987, month: 1, day: 12,
    expectHour: 0, expectWuxingJu: '土五局', expectMingGong: 1,
    expectTrueSolarHM: '23:19',  // 0:30 - 62.4 + (-8.23) = -40.63 → 23:19 (前一天)
  },
  {
    label: '5️⃣ 晚子 1987-01-11 23:30 + 104.40°E (当天, 倪海夏派)',
    clockHour: 23, clockMin: 30, longitude: 104.40,
    year: 1987, month: 1, day: 11,
    expectHour: 11, expectWuxingJu: '木三局', expectMingGong: 2,
    expectTrueSolarHM: '22:20',
  },
];

let pass = 0, fail = 0;
const errors = [];

for (const c of cases) {
  const dayOfYear = toDayOfYear(c.year, c.month, c.day);
  const hour = calcTrueSolarBranch(c.clockHour, c.clockMin, c.longitude, dayOfYear);
  const trueSolar = calcTrueSolarHM(c.clockHour, c.clockMin, c.longitude, dayOfYear);

  const okHour = hour === c.expectHour;
  const okSolar = trueSolar === c.expectTrueSolarHM;

  if (okHour && okSolar) {
    pass++;
    console.log(`✓ ${c.label}`);
    console.log(`    hour=${hour} (${SHICHEN[hour]}) trueSolar=${trueSolar}`);
  } else {
    fail++;
    const errs = [];
    if (!okHour) errs.push(`hour 期望 ${c.expectHour} (${SHICHEN[c.expectHour]}), 实际 ${hour} (${SHICHEN[hour]})`);
    if (!okSolar) errs.push(`真太阳时 期望 ${c.expectTrueSolarHM}, 实际 ${trueSolar}`);
    console.log(`✗ ${c.label}`);
    errs.forEach(e => console.log(`    ❌ ${e}`));
    errors.push({ case: c.label, errs });
  }
}

console.log('');
console.log('═'.repeat(60));
console.log(`总计: ${pass} 通过, ${fail} 失败`);
console.log('═'.repeat(60));

if (fail > 0) {
  console.log('\n失败详情:');
  errors.forEach(e => {
    console.log(`  ${e.case}`);
    e.errs.forEach(err => console.log(`    - ${err}`));
  });
  process.exit(1);
}
process.exit(0);
