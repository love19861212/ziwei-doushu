#!/usr/bin/env node
// 部署后验证: 直接调 share.ts.formToBirthInfo (前端真实算法, 走 timeMode 分流)
// 用法: npx tsx scripts/verify-deploy.mjs
//
// 用途: 铁律 2 第 4 步 — curl 验证线上后, 再用此脚本验证前端算法层
//   - curl 直接传 body.hour, 绕过 share.ts.formToBirthInfo, 测不出算法
//   - 本脚本直接调 formToBirthInfo, 走完整前端算法分流 (12h/24h)
//   - 2026-06-14 加: 部署后必跑, 确认 timeMode 分流在线上真生效

import * as share from '../lib/ziwei/share.ts';
const { formToBirthInfo } = share;

const SHICHEN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const cases = [
  {
    label: '1️⃣ 王二 12h mode 申时 (期望 钟表=申 8, 命宫 5 巳)',
    form: { year: '1987', month: '1', day: '11', clockHour: '8', clockMinute: '0',
            unknownTime: false, longitude: 104.40, timeMode: '12h', province: '四川省', city: '德阳市',
            gender: 'male', name: '王二12h' },
    expectHour: 8, expectTrueSolarHM: '',
  },
  {
    label: '2️⃣ 王二 24h mode 16:00 (期望 真太阳时 14:50=未 7, 跨时辰)',
    form: { year: '1987', month: '1', day: '11', clockHour: '16', clockMinute: '0',
            unknownTime: false, longitude: 104.40, timeMode: '24h', province: '四川省', city: '德阳市',
            gender: 'male', name: '王二24h' },
    expectHour: 7, expectTrueSolarHM: '14:50',
  },
  {
    label: '3️⃣ 新疆 24h mode 11:30 (期望 真太阳时 08:49=辰 4, 跨时辰大)',
    form: { year: '1995', month: '6', day: '16', clockHour: '11', clockMinute: '30',
            unknownTime: false, longitude: 79.92, timeMode: '24h', province: '新疆', city: '喀什',
            gender: 'male', name: '新疆' },
    expectHour: 4, expectTrueSolarHM: '08:49',
  },
  {
    label: '4️⃣ 王二 default (没 timeMode) (期望 24h 默认, 真太阳时 14:50=未 7)',
    form: { year: '1987', month: '1', day: '11', clockHour: '16', clockMinute: '0',
            unknownTime: false, longitude: 104.40, province: '四川省', city: '德阳市',
            gender: 'male', name: '王二default' },
    expectHour: 7, expectTrueSolarHM: '14:50',
  },
  {
    label: '5️⃣ 12h 早子 00:00 (期望 钟表=子 0, 算当晚)',
    form: { year: '1987', month: '1', day: '11', clockHour: '0', clockMinute: '0',
            unknownTime: false, longitude: 104.40, timeMode: '12h', province: '四川省', city: '德阳市',
            gender: 'male', name: '早子12h' },
    expectHour: 0, expectTrueSolarHM: '',
  },
];

let pass = 0, fail = 0;

for (const c of cases) {
  const info = formToBirthInfo(c.form);
  const okHour = info.hour === c.expectHour;
  const okSolar = (info.trueSolarHM || '') === (c.expectTrueSolarHM || '');
  const timeModeMatch = !c.form.timeMode || info.timeMode === c.form.timeMode;
  if (okHour && okSolar && timeModeMatch) {
    pass++;
    console.log(`✓ ${c.label}`);
    console.log(`    hour=${info.hour} (${SHICHEN[info.hour]}) trueSolar=${info.trueSolarHM || '∅'} timeMode=${info.timeMode || '∅'}`);
  } else {
    fail++;
    console.log(`✗ ${c.label}`);
    if (!okHour) console.log(`    ❌ hour 期望 ${c.expectHour} (${SHICHEN[c.expectHour]}), 实际 ${info.hour} (${SHICHEN[info.hour]})`);
    if (!okSolar) console.log(`    ❌ trueSolarHM 期望 '${c.expectTrueSolarHM}', 实际 '${info.trueSolarHM}'`);
    if (!timeModeMatch) console.log(`    ❌ timeMode 期望 ${c.form.timeMode}, 实际 ${info.timeMode}`);
  }
}

console.log('');
console.log('═'.repeat(60));
console.log(`总计: ${pass} 通过, ${fail} 失败`);
console.log('═'.repeat(60));

if (fail > 0) process.exit(1);
process.exit(0);
