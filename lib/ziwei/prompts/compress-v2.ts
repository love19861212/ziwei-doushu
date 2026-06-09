/**
 * 命运钥匙 compressChart v2 (W1 + W2 合并, 2026-06-09)
 *
 * W1 改进 (6 段):
 * - 结构化输出, 术语 100% 用 52 数组池
 * - 必带大限流年 + 12 格局识别
 *
 * W2 改进 (新增 3 段 = 9 段总):
 * - 三方四正: 命宫 + 对宫 + 三方(地支六合/三合) 一并暴露
 * - 流年触发宫: 当年地支 → 流年宫 → 触发该宫事件主题
 * - 大限+流年叠加: 当前大限 + 流年 = 当年重点宫
 *
 * 文档: /root/.openclaw/workspace/docs/wenmo-input/文默天机-UPD-AI提示词-v13.md
 */

import type { ZiweiChart, Palace } from '../types';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_BUREAU,
  PALACE_NAMES,
  getPalaceByBranch,
} from '../wenmo';

const GENDER_TEXT = { male: '男', female: '女' } as const;

/**
 * 取当前北京时间
 */
function getBeijingNow(): Date {
  const now = new Date();
  // UTC + 8h = 北京
  return new Date(now.getTime() + 8 * 3600 * 1000);
}

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
 * 12 格局识别
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
 * W2-1: 三方四正 (命宫 + 对宫 + 三方)
 *
 * 命宫 = branch
 * 对宫 = (branch + 6) % 12  (地支对冲)
 * 三方 = 命宫地支的三合局
 *   - 申子辰 → 三方 申(0)/子(8)/辰(4) 顺时针
 *   - 寅午戌 → 三方 寅(2)/午(6)/戌(10)
 *   - 巳酉丑 → 三方 巳(5)/酉(9)/丑(1)
 *   - 亥卯未 → 三方 亥(11)/卯(3)/未(7)
 */
function formatSanFang(mingGongBranch: number, palaces: Palace[]): string {
  // 三合局 (branch % 4 分组, 起始 2/6/10/... = 寅午戌, ...)
  // 寅=2 午=6 戌=10
  // 巳=5 酉=9 丑=1
  // 申=8 子=0 辰=4
  // 亥=11 卯=3 未=7
  const triGroups: Record<number, [number, number, number]> = {
    2: [2, 6, 10],   // 寅午戌
    5: [5, 9, 1],    // 巳酉丑
    8: [8, 0, 4],    // 申子辰
    11: [11, 3, 7],  // 亥卯未
  };
  const dui = (mingGongBranch + 6) % 12;
  // 找命宫所在的三合组
  const triKey = [2, 5, 8, 11].find(k => triGroups[k].includes(mingGongBranch));
  const tri = triKey ? triGroups[triKey] : [];

  const labels: string[] = [];
  labels.push(`命宫 ${EARTHLY_BRANCHES[mingGongBranch]}`);
  labels.push(`对宫 ${EARTHLY_BRANCHES[dui]}`);
  if (tri.length > 0) {
    tri.forEach(b => {
      if (b !== mingGongBranch) labels.push(`三方 ${EARTHLY_BRANCHES[b]}`);
    });
  }
  return labels.join(' / ');
}

/**
 * W2-2: 流年触发宫识别
 *
 * 算法 (锁定 2020 庚子年 = branch 0 作为锚点):
 * - 2020 庚子 = branch 0 (子)
 * - 2021 辛丑 = branch 1
 * - 2026 丙午 = branch 6 (午)
 * - 公式: branch = (currentYear - 2020) % 12
 *
 * (2026-06-09 修: 之前用 2024 错 - 2024 实际是甲辰年 branch 4, 不是甲子)
 */
function getLiuNianBranch(currentYear: number): number {
  return ((currentYear - 2020) % 12 + 12) % 12;
}

function formatLiuNian(currentYear: number, palaces: Palace[]): string {
  const branch = getLiuNianBranch(currentYear);
  const p = getPalaceByBranch(palaces, branch);
  if (!p) return `${currentYear}年流年宫：${EARTHLY_BRANCHES[branch]}位`;

  const stars = (p.stars ?? [])
    .filter(s => s.type === 'major')
    .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
    .join('+') || '空';

  return `${currentYear}年（${EARTHLY_BRANCHES[branch]}位）流年落 ${p.name}，主星：${stars}`;
}

/**
 * W2-3: 大限+流年叠加 (当年重点)
 *
 * 当前大限宫 + 流年宫 = 共同触发的事件
 */
function formatDaXianLiuNianCross(
  currentDaXian: ZiweiChart['daXians'][0] | undefined,
  currentYear: number,
  palaces: Palace[]
): string {
  if (!currentDaXian) return '';

  const liuNianBranch = getLiuNianBranch(currentYear);
  const liuNianPalace = getPalaceByBranch(palaces, liuNianBranch);
  const liuNianName = liuNianPalace?.name || EARTHLY_BRANCHES[liuNianBranch];

  // 大限宫
  const dxPalace = getPalaceByBranch(palaces, currentDaXian.palaceBranch);
  const dxName = dxPalace?.name || EARTHLY_BRANCHES[currentDaXian.palaceBranch];

  // 关系: 同行(同地支) / 三方 / 对宫 / 其他
  const diff = Math.abs(currentDaXian.palaceBranch - liuNianBranch);
  const relation =
    diff === 0 ? '同行(同宫触发)' :
    diff === 6 ? '对冲(冲突大)' :
    [4, 8].includes(diff) ? '三合(助力强)' :
    [3, 9].includes(diff) ? '六合(和谐)' :
    '相邻(渐进)';

  return `大限在 ${dxName} + 流年在 ${liuNianName} = ${relation}`;
}

/**
 * 主入口: 把命盘压成 9 段结构化文本 (W1 + W2 合并)
 */
export function compressChartV2(chart: ZiweiChart): string {
  const {
    birthInfo, lunarInfo, mingGongBranch, shenGongBranch,
    wuxingJuName, palaces, daXians, currentDaXianIndex, currentAge,
  } = chart;

  const currentYear = getBeijingNow().getUTCFullYear();

  // 段 1: 基础信息
  const basic = [
    `【基础】`,
    `阳历：${birthInfo.year}-${birthInfo.month}-${birthInfo.day} ${birthInfo.hour}时`,
    `农历：${lunarInfo.lunarYear}年${HEAVENLY_STEMS[lunarInfo.yearStem]}${EARTHLY_BRANCHES[lunarInfo.yearBranch]}年`,
    `性别：${GENDER_TEXT[birthInfo.gender]}命`,
    `五行局：${wuxingJuName}`,
  ].join('\n');

  // 段 2: 命宫/身宫
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
      ? ` (化禄${dx.siHua.lu}/权${dx.siHua.quan}/科${dx.siHua.ke}/忌${dx.siHua.ji})`
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

  // 段 7 (W2-1): 三方四正
  const sanFangSection = `【三方四正】\n${formatSanFang(mingGongBranch, palaces ?? [])}`;

  // 段 8 (W2-2): 流年触发宫
  const liuNianSection = `【流年】\n${formatLiuNian(currentYear, palaces ?? [])}`;

  // 段 9 (W2-3): 大限+流年叠加
  const currentDaXian = (daXians ?? [])[dxIdx];
  const crossSection = currentDaXian
    ? `【大限流年】\n${formatDaXianLiuNianCross(currentDaXian, currentYear, palaces ?? [])}`
    : '';

  return [
    basic,
    mingShen,
    palaces12,
    siHua,
    daXian,
    patternSection,
    sanFangSection,
    liuNianSection,
    crossSection,
  ].filter(Boolean).join('\n\n');
}
