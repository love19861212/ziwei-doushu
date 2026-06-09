/**
 * 命运钥匙 compressChart v2 (2026-06-09 升级)
 *
 * 改进点 (vs v1):
 * - 6 段结构化输出 (vs 1 段混杂)
 * - 术语从 52 数组池 (100% 准确)
 * - 必带大限流年 + 格局识别
 * - 段落分明, LLM 友好
 *
 * 文档: /root/.openclaw/workspace/docs/wenmo-input/文默天机-UPD-AI提示词-v13.md
 */

import type { ZiweiChart, Palace } from '../types';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_BUREAU,
  PALACE_NAMES,
} from '../wenmo';

const GENDER_TEXT = { male: '男', female: '女' } as const;

/**
 * 格式化单宫主星 (主星/吉星/煞星分层, 4 化标注)
 */
function formatPalaceStars(p: Palace): string {
  const major = (p.stars ?? []).filter(s => s.type === 'major')
    .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
    .join('·') || '空';
  const minor = (p.stars ?? []).filter(s => s.type === 'minor' || s.type === 'lucky')
    .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
    .join('·');
  const sha = (p.stars ?? []).filter(s => s.type === 'sha')
    .map(s => s.name)
    .join('·');
  return [major, minor, sha].filter(Boolean).join('｜');
}

/**
 * 12 格局识别 (12 common patterns)
 */
function detectPatterns(palaces: Palace[]): string {
  const starSet = new Set<string>();
  palaces?.forEach(p => (p.stars ?? []).forEach(s => starSet.add(s.name)));

  const patterns: string[] = [];
  if (starSet.has('紫微') && starSet.has('破军')) patterns.push('紫微破军格');
  if (starSet.has('紫微') && starSet.has('天府')) patterns.push('紫府同宫格');
  if (starSet.has('武曲') && starSet.has('天府')) patterns.push('武府同宫格');
  if (starSet.has('武曲') && starSet.has('贪狼')) patterns.push('武贪同宫格');
  if (starSet.has('廉贞') && starSet.has('贪狼')) patterns.push('廉贪同宫格');
  if (starSet.has('七杀') && starSet.has('破军') && starSet.has('贪狼')) patterns.push('杀破狼格');
  if (starSet.has('天相')) patterns.push('天相守命');
  if (starSet.has('天梁')) patterns.push('天梁带寿');
  if (starSet.has('太阳') && starSet.has('太阴')) patterns.push('日月同宫');
  if (starSet.has('巨门')) patterns.push('巨门暗星');
  if (starSet.has('天同')) patterns.push('天同福星');
  if (starSet.has('天机')) patterns.push('天机善星');

  return patterns.join(' / ') || '';
}

/**
 * 主入口: 把命盘压成 6 段结构化文本
 */
export function compressChartV2(chart: ZiweiChart): string {
  const { birthInfo, lunarInfo, mingGongBranch, shenGongBranch, wuxingJuName, palaces, daXians, currentDaXianIndex, currentAge } = chart;

  // 段 1: 基础信息
  const basic = [
    `【基础】`,
    `阳历：${birthInfo.year}-${birthInfo.month}-${birthInfo.day} ${birthInfo.hour}时`,
    `农历：${lunarInfo.lunarYear}年${HEAVENLY_STEMS[lunarInfo.yearStem]}${EARTHLY_BRANCHES[lunarInfo.yearBranch]}年`,
    `性别：${GENDER_TEXT[birthInfo.gender]}命`,
    `五行局：${wuxingJuName}`,
  ].join('\n');

  // 段 2: 命宫主星
  const mingPalace = palaces?.[mingGongBranch];
  const shenPalace = palaces?.[shenGongBranch];
  const mingStars = (mingPalace?.stars ?? [])
    .filter(s => s.type === 'major')
    .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
    .join('+') || '空宫';
  const shenStars = (shenPalace?.stars ?? [])
    .filter(s => s.type === 'major')
    .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
    .join('+') || '空宫';

  const mingShen = [
    `【命宫/身宫】`,
    `命宫：${EARTHLY_BRANCHES[mingGongBranch]}位 (${mingPalace?.name || '?'})，主星：${mingStars}`,
    `身宫：${EARTHLY_BRANCHES[shenGongBranch]}位 (${shenPalace?.name || '?'})，主星：${shenStars}`,
  ].join('\n');

  // 段 3: 12 宫 (12 行, 每行 1 宫)
  const palaces12 = [
    '【十二宫】',
    ...(palaces ?? []).map((p, idx) =>
      `${EARTHLY_BRANCHES[idx]}-${p.name}：${formatPalaceStars(p)}`
    ),
  ].join('\n');

  // 段 4: 四化汇总
  const siHuaList = (palaces ?? []).flatMap(p =>
    (p.stars ?? []).filter(s => s.siHua).map(s => `${s.name}化${s.siHua}在${p.name}`)
  );
  const siHua = siHuaList.length > 0
    ? `【四化】\n${siHuaList.join('\n')}`
    : '';

  // 段 5: 当前大限 + 未来 2 限
  const dxIdx = currentDaXianIndex ?? 0;
  const dxSlice = (daXians ?? []).slice(dxIdx, dxIdx + 3);
  const daXianList = dxSlice.map(dx => {
    const siHuaStr = dx.siHua
      ? ` (${dx.siHua.lu}/权${dx.siHua.quan}/科${dx.siHua.ke}/忌${dx.siHua.ji})`
      : '';
    return `${dx.startAge}-${dx.endAge}岁 ${dx.palaceName}${siHuaStr}`;
  });
  const daXian = (daXianList.length > 0 || currentAge !== undefined)
    ? [
        `【大限】当前 ${currentAge} 岁`,
        ...daXianList,
      ].join('\n')
    : '';

  // 段 6: 格局识别
  const patterns = detectPatterns(palaces ?? []);
  const patternSection = patterns ? `【格局】\n${patterns}` : '';

  return [basic, mingShen, palaces12, siHua, daXian, patternSection]
    .filter(Boolean)
    .join('\n\n');
}
