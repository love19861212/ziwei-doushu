/**
 * 三方四正 + 夹宫 智能计算
 *
 * 三方四正 = 本宫 + 对宫 + 三合方（顺4 + 逆4 共4宫位）
 *   例: 命宫在子 → 申子辰 三合
 *     - 本宫: 子
 *     - 对宫: 午 (子+6)
 *     - 三合: 辰 (子+4)、申 (子+8)
 *   总计4宫位
 *
 * 夹宫 = 本宫前一位 + 后一位
 *   例: 命宫在子 → 亥、丑
 *   重要格局: 辅弼夹命、昌曲夹命、魁钺夹命、阳梁昌禄、廉贞羊、廉贞陀...
 *
 * 用于:
 *  - 宫位点击弹窗: 显示"本宫三方四正吉星汇总"
 *  - AI 解读: 把三方四正的星曜作为论断依据
 *  - 格局识别: 依赖三方四正
 */

import type { ZiweiChart, Palace, Star } from './types';

export interface SanFangResult {
  /** 本宫 */
  origin: Palace;
  /** 对宫 */
  duiGong?: Palace;
  /** 三合方 (顺时针+4 和 -4) */
  sanHe: Palace[];
  /** 全部三方四正宫位 */
  allPalaces: Palace[];
  /** 夹宫（前后两宫） */
  jiaGong: { prev?: Palace; next?: Palace };
  /** 三方四正所有主星 */
  majorStars: Array<{ star: Star; palace: Palace; fromPalace: '本宫' | '对宫' | '三合' | '夹宫' }>;
  /** 三方四正所有辅星 */
  luckyStars: Array<{ star: Star; palace: Palace; fromPalace: '本宫' | '对宫' | '三合' | '夹宫' }>;
  /** 三方四正所有煞星 */
  shaStars: Array<{ star: Star; palace: Palace; fromPalace: '本宫' | '对宫' | '三合' | '夹宫' }>;
  /** 汇总标签 */
  summary: {
    吉: string[];
    煞: string[];
    化: string[];
    庙: string[];
  };
}

function getPalaceByBranch(chart: ZiweiChart, branch: number): Palace | undefined {
  return chart.palaces.find(p => p.branch === branch);
}

function findPalace(chart: ZiweiChart, name: string): Palace | undefined {
  return chart.palaces.find(p => p.name === name);
}

/**
 * 计算指定宫位的三方四正
 * @param chart 命盘
 * @param targetBranchOrName 地支索引(0-11) 或 宫位名("命宫")
 */
export function calcSanFang(chart: ZiweiChart, target: number | string): SanFangResult | null {
  // 解析目标宫位
  let origin: Palace | undefined;
  if (typeof target === 'number') {
    origin = getPalaceByBranch(chart, target);
  } else {
    origin = findPalace(chart, target);
  }
  if (!origin) return null;

  // 1. 本宫
  // 2. 对宫: branch+6
  const duiGong = getPalaceByBranch(chart, (origin.branch + 6) % 12);
  // 3. 三合方: branch+4, branch+8
  const sanHe: Palace[] = [];
  const sanHe1 = getPalaceByBranch(chart, (origin.branch + 4) % 12);
  const sanHe2 = getPalaceByBranch(chart, (origin.branch + 8) % 12);
  if (sanHe1) sanHe.push(sanHe1);
  if (sanHe2) sanHe.push(sanHe2);
  // 4. 夹宫: branch-1, branch+1
  const prev = getPalaceByBranch(chart, (origin.branch + 11) % 12);
  const next = getPalaceByBranch(chart, (origin.branch + 1) % 12);

  const allPalaces: Palace[] = [origin];
  if (duiGong) allPalaces.push(duiGong);
  allPalaces.push(...sanHe);

  // 5. 收集所有星曜
  const majorStars: SanFangResult['majorStars'] = [];
  const luckyStars: SanFangResult['luckyStars'] = [];
  const shaStars: SanFangResult['shaStars'] = [];

  for (const palace of allPalaces) {
    const fromPalace: SanFangResult['majorStars'][0]['fromPalace'] = 
      palace === origin ? '本宫' :
      palace === duiGong ? '对宫' : '三合';
    for (const star of palace.stars) {
      if (star.type === 'major') {
        majorStars.push({ star, palace, fromPalace });
      } else if (star.type === 'lucky') {
        luckyStars.push({ star, palace, fromPalace });
      } else if (star.type === 'sha') {
        shaStars.push({ star, palace, fromPalace });
      }
    }
  }

  // 夹宫的星也收集
  if (prev) {
    for (const star of prev.stars) {
      if (star.type === 'lucky') luckyStars.push({ star, palace: prev, fromPalace: '夹宫' });
      if (star.type === 'sha') shaStars.push({ star, palace: prev, fromPalace: '夹宫' });
    }
  }
  if (next) {
    for (const star of next.stars) {
      if (star.type === 'lucky') luckyStars.push({ star, palace: next, fromPalace: '夹宫' });
      if (star.type === 'sha') shaStars.push({ star, palace: next, fromPalace: '夹宫' });
    }
  }

  // 汇总标签
  const summary: SanFangResult['summary'] = {
    吉: [],
    煞: [],
    化: [],
    庙: [],
  };

  // 化禄/化权/化科/化忌
  for (const { star, palace, fromPalace } of majorStars) {
    if (star.siHua) {
      summary.化.push(`${fromPalace}${palace.name}${star.name}化${star.siHua}`);
    }
    if (star.brightness === 'bright') {
      summary.庙.push(`${fromPalace}${palace.name}${star.name}庙旺`);
    }
  }

  // 吉星
  const luckyNames = new Set(luckyStars.map(s => s.star.name));
  if (luckyNames.has('左辅') && luckyNames.has('右弼')) {
    summary.吉.push('左右同会（贵人辅佐）');
  } else {
    if (luckyNames.has('左辅')) summary.吉.push('左辅会照');
    if (luckyNames.has('右弼')) summary.吉.push('右弼会照');
  }
  if (luckyNames.has('文昌') && luckyNames.has('文曲')) {
    summary.吉.push('昌曲同会（才艺双全）');
  } else {
    if (luckyNames.has('文昌')) summary.吉.push('文昌会照');
    if (luckyNames.has('文曲')) summary.吉.push('文曲会照');
  }
  if (luckyNames.has('天魁') || luckyNames.has('天钺')) {
    summary.吉.push('魁钺贵人');
  }
  if (luckyNames.has('禄存')) summary.吉.push('禄存守照');
  if (luckyNames.has('天马')) summary.吉.push('天马加会');

  // 煞星
  const shaNames = new Set(shaStars.map(s => s.star.name));
  if (shaNames.has('擎羊')) summary.煞.push('擎羊会照');
  if (shaNames.has('陀罗')) summary.煞.push('陀罗会照');
  if (shaNames.has('火星')) summary.煞.push('火星会照');
  if (shaNames.has('铃星')) summary.煞.push('铃星会照');
  if (shaNames.has('地空')) summary.煞.push('地空会照');
  if (shaNames.has('地劫')) summary.煞.push('地劫会照');

  // 夹宫的格局
  if (prev && next) {
    const prevNames = new Set(prev.stars.map(s => s.name));
    const nextNames = new Set(next.stars.map(s => s.name));
    if (prevNames.has('左辅') && nextNames.has('右弼')) summary.吉.push('辅弼夹命');
    else if (prevNames.has('右弼') && nextNames.has('左辅')) summary.吉.push('辅弼夹命');
    if (prevNames.has('文昌') && nextNames.has('文曲')) summary.吉.push('昌曲夹命');
    else if (prevNames.has('文曲') && nextNames.has('文昌')) summary.吉.push('昌曲夹命');
    if (prevNames.has('天魁') && nextNames.has('天钺')) summary.吉.push('魁钺夹命');
    if (prevNames.has('擎羊') && nextNames.has('陀罗')) summary.煞.push('羊陀夹命');
  }

  return {
    origin,
    duiGong,
    sanHe,
    allPalaces,
    jiaGong: { prev, next },
    majorStars,
    luckyStars,
    shaStars,
    summary,
  };
}

/**
 * AI 解读辅助: 把三方四正拼成文字描述
 */
export function formatSanFangForAI(sf: SanFangResult): string {
  const parts: string[] = [];
  parts.push(`【${sf.origin.name}三方四正】`);
  
  // 对宫
  if (sf.duiGong) {
    const stars = sf.duiGong.stars.filter(s => s.type === 'major').map(s => s.name).join('、');
    if (stars) parts.push(`对宫${sf.duiGong.name}：${stars}`);
  }
  
  // 三合
  for (const p of sf.sanHe) {
    const stars = p.stars.filter(s => s.type === 'major').map(s => s.name).join('、');
    if (stars) parts.push(`三合方${p.name}：${stars}`);
  }
  
  // 夹宫
  if (sf.jiaGong.prev || sf.jiaGong.next) {
    const prev = sf.jiaGong.prev?.stars.map(s => s.name).join('、') || '';
    const next = sf.jiaGong.next?.stars.map(s => s.name).join('、') || '';
    if (prev || next) parts.push(`夹宫：${prev} | ${next}`);
  }
  
  if (sf.summary.吉.length) parts.push(`吉象：${sf.summary.吉.join('、')}`);
  if (sf.summary.煞.length) parts.push(`凶象：${sf.summary.煞.join('、')}`);
  if (sf.summary.化.length) parts.push(`四化：${sf.summary.化.join('、')}`);
  
  return parts.join('\n');
}
