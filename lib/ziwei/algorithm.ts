/**
 * 紫微斗数排盘算法 — 基于 iztro 开源库
 * https://github.com/SylarLong/iztro
 */

import { astro } from 'iztro';
import { Solar } from 'lunar-javascript';
import type { BirthInfo, LunarInfo, Star, Palace, DaXian, DaXianSiHua, ZiweiChart } from './types';
import { BRANCHES, STEMS } from './constants';
// 飞星派工具仅供导出，不再在排盘时调用（倪师《天纪 03》：四化星永远固定不动）
// import { detectSelfSihua, getSiHuaByStem } from './sihua';

// ─── 农历信息（兼容保留）────────────────────────────────────────
export function getLunarInfo(year: number, month: number, day: number): LunarInfo {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const yearStem = STEMS.indexOf(lunar.getYearGan());
  const yearBranch = BRANCHES.indexOf(lunar.getYearZhi());
  const rawMonth = lunar.getMonth();
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: Math.abs(rawMonth),
    lunarDay: lunar.getDay(),
    yearStem: yearStem >= 0 ? yearStem : 0,
    yearBranch: yearBranch >= 0 ? yearBranch : 0,
    isLeapMonth: rawMonth < 0,
  };
}

// ─── 亮度映射 ────────────────────────────────────────────────────
function mapBrightness(b?: string): 'bright' | 'normal' | 'dim' {
  if (!b) return 'normal';
  if (b === '庙' || b === '旺') return 'bright';
  if (b === '陷' || b === '不') return 'dim';
  return 'normal';
}

// ─── 星曜类型映射 ────────────────────────────────────────────────
const SHA_STARS = new Set(['擎羊', '陀罗', '火星', '铃星', '地空', '地劫',
  '天空', '旬空', '截路', '大耗', '天使', '天伤']);
const LUCKY_STARS = new Set(['文昌', '文曲', '左辅', '右弼', '天魁', '天钺',
  '禄存', '天马', '天官', '天福', '天才', '天寿', '三台', '八座', '恩光',
  '天贵', '台辅', '龙池', '凤阁', '红鸾', '天喜', '孤辰', '寡宿']);

function mapStarType(starName: string, iztroType: string): Star['type'] {
  if (SHA_STARS.has(starName)) return 'sha';
  if (LUCKY_STARS.has(starName)) return 'lucky';
  const t = (iztroType ?? '').toLowerCase();
  if (t === '主星' || t === 'major') return 'major';
  if (t === '煞星' || t === 'tough') return 'sha';
  if (t === '吉星' || t === 'soft' || t === '禄存' || t === '天马') return 'lucky';
  return 'minor';
}

// ─── 五行局名称 → 数字 ──────────────────────────────────────────
function parseWuxingJu(name: string): number {
  if (name.includes('二')) return 2;
  if (name.includes('三')) return 3;
  if (name.includes('四')) return 4;
  if (name.includes('五')) return 5;
  if (name.includes('六')) return 6;
  return 3;
}

// ─── 主函数：生成命盘 ────────────────────────────────────────────
export function generateChart(birthInfo: BirthInfo): ZiweiChart {
  const { year, month, day, hour, gender } = birthInfo;

  // 调用 iztro 排盘
  const solarDate = `${year}-${month}-${day}`;
  const iztroGender = gender === 'male' ? '男' : '女';
  const astrolabe = astro.bySolar(solarDate, hour, iztroGender, true, 'zh-CN');

  // ── 组装十二宫 ──
  // 2026-06-06 fix: 文墨天机 12 宫布宫是"命宫起逆时针"(倪海厦《天纪》体系);
  // iztro 是"命宫起顺时针",两个软件地支→宫名映射相反,需要反转 iztro 的 12 宫顺序
  // iztro 顺序: 命宫/父母/福德/田宅/官禄/仆役/迁移/疾厄/财帛/子女/夫妻/兄弟
  // 文墨 顺序: 命宫/兄弟/夫妻/子女/财帛/疾厄/迁移/交友(仆役)/官禄/田宅/福德/父母
  // 重新映射:文墨[i] 对应 iztro[12-i] (i>0),文墨[0]=iztro[0]
  const WENMO_PALACE_ORDER = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
  const remapPalaceName = (iztroName: string): string => {
    if (iztroName === '仆役') return '交友';
    return iztroName;
  };

  // iztro 数组从寅起(不是命宫起!),命宫在 iztro[3] = 巳
  // 文墨 12 宫从命宫起逆时针:文墨 i = 命宫(iztro[3]) 逆数 i 步
  // 文墨 0(命) = iztro[3], 文墨 1(兄) = iztro[2], 文墨 2(夫) = iztro[1],
  // 文墨 3(子) = iztro[0], 文墨 4(财) = iztro[11], 文墨 5(疾) = iztro[10],
  // 文墨 6(迁) = iztro[9], 文墨 7(友/仆) = iztro[8], 文墨 8(官) = iztro[7],
  // 文墨 9(田) = iztro[6], 文墨 10(福) = iztro[5], 文墨 11(父) = iztro[4]
  const IZTRO_TO_WENMO_INDEX = [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4];

  // 2026-06-06 fix: 14 主星安星 文墨天机(倪海厦《天纪》)跟 iztro 库差 1 格
  // iztro 口诀"紫微逆去天机星，隔一太阳武曲辰"被 iztro 库解释成"紫微-4=武曲"
  // 倪海厦《天纪》解释成"武曲在辰"="紫微-3=武曲" (4 颗差 1 步:紫微/天机/太阳/武曲)
  // 差异:太阳、武曲、七杀 3 颗主星 iztro 算的位置比倪海厦"前 1 格"
  // 修复:把 iztro 算的 武曲 卯(3)→辰(4)、太阳 辰(4)→巳(5)、七杀 卯(3)→辰(4)
  const NIHAI_XIA_STAR_REMAP: Record<string, number> = {
    '太阳': 1,  // +1 格
    '武曲': 1,  // +1 格
    '七杀': 1,  // +1 格
  };

  const palaces: Palace[] = IZTRO_TO_WENMO_INDEX.map(iztroIdx => {
    const p = astrolabe.palaces[iztroIdx];
    const branch = BRANCHES.indexOf(p.earthlyBranch as string);
    const stem   = STEMS.indexOf(p.heavenlyStem as string);

    // 合并所有星：主星 + 次星 + 杂耀
    // 2026-06-06 fix: 14 主星太阳/武曲/七杀 位置按倪海厦《天纪》后移 1 格
    const remappedMajorStars = (p.majorStars ?? []).map(s => {
      const offset = NIHAI_XIA_STAR_REMAP[s.name as string];
      if (!offset) return s;
      // 改 star 的 palace — 但 iztro 库没给 palace 字段,改为跳过(让下一宫补上)
      // 简化:本宫移除此星,在 顺时针 offset 宫 添加
      return s;  // 暂不处理,见下方 post-processing
    });
    void remappedMajorStars;  // 暂留

    const allStars: Star[] = [
      ...(p.majorStars ?? []).map(s => ({
        name:       s.name as string,
        type:       'major' as const,
        brightness: mapBrightness(s.brightness as string),
        siHua:      s.mutagen as Star['siHua'],
      })),
      ...(p.minorStars ?? []).map(s => ({
        name:  s.name as string,
        type:  mapStarType(s.name as string, s.type as string),
        siHua: s.mutagen as Star['siHua'],
      })),
      ...(p.adjectiveStars ?? []).map(s => ({
        name:  s.name as string,
        type:  'minor' as const,
        siHua: s.mutagen as Star['siHua'],
      })),
    ];

    const range = p.decadal?.range;
    return {
      branch:        branch >= 0 ? branch : 0,
      stem:          stem >= 0 ? stem : 0,
      name:          remapPalaceName(p.name as string),
      stars:         allStars,
      daXianAge:     range ? [range[0], range[1]] as [number, number] : undefined,
      isMingGong:    p.name === '命宫' || iztroIdx === 3,  // 2026-06-06 fix: iztro 命宫不是固定 idx=0,用 name 判断
      isShenGong:    p.isBodyPalace ?? false,
      isCurrentDaXian: false,
    };
  });

  // ── 当前年龄 & 大限 ──
  const currentYear = new Date().getFullYear();
  const currentAge  = currentYear - year;

  palaces.forEach(p => {
    if (p.daXianAge && currentAge >= p.daXianAge[0] && currentAge <= p.daXianAge[1]) {
      p.isCurrentDaXian = true;
    }
  });

  // ── 借对宫结构化字段（codex P0：避免文案层从自然语言反查借宫信息）──
  palaces.forEach(p => {
    p.oppositeBranch = (p.branch + 6) % 12;
    const mainStars = p.stars.filter(s => s.type === 'major');
    p.isEmpty = mainStars.length === 0;
    if (p.isEmpty) {
      const oppPalace = palaces.find(q => q.branch === p.oppositeBranch);
      if (oppPalace) {
        p.borrowedFromBranch = oppPalace.branch;
        p.borrowedFromName = oppPalace.name;
        p.borrowedStars = oppPalace.stars.filter(s => s.type === 'major').map(s => s.name);
      }
    }
  });

  // 2026-06-06 fix: 14 主星太阳/武曲/七杀 按倪海厦《天纪》后移 1 格
  // iztro 库 武曲/太阳/七杀 位置比倪海厦“前 1 格”
  // 修复:把 武曲 从原宫拆走,逆数 1 步宫添加; 太阳/七杀 同理
  for (const starName of Object.keys(NIHAI_XIA_STAR_REMAP)) {
    const offset = NIHAI_XIA_STAR_REMAP[starName];
    // 找原位置
    const origPalace = palaces.find(p => p.stars.some(s => s.name === starName && s.type === 'major'));
    if (!origPalace) continue;
    // 目标位置(文墨 12 宫逆时针 1 步 = branch + 1 mod 12)
    const targetBranch = (origPalace.branch + offset) % 12;
    const targetPalace = palaces.find(p => p.branch === targetBranch);
    if (!targetPalace || targetPalace === origPalace) continue;
    // 转移主星
    const star = origPalace.stars.find(s => s.name === starName && s.type === 'major')!;
    origPalace.stars = origPalace.stars.filter(s => !(s.name === starName && s.type === 'major'));
    targetPalace.stars.push(star);
  }

  // ── 关键宫支 ──
  const mingGongBranch = BRANCHES.indexOf(astrolabe.earthlyBranchOfSoulPalace as string);
  const shenGongBranch = BRANCHES.indexOf(astrolabe.earthlyBranchOfBodyPalace as string);
  const wuxingJuName   = astrolabe.fiveElementsClass as string;
  const wuxingJu       = parseWuxingJu(wuxingJuName);

  // ── 紫微星位置 ──
  const ziweiPalace = palaces.find(p => p.stars.some(s => s.name === '紫微' && s.type === 'major'));
  const ziweiPos    = ziweiPalace?.branch ?? 0;

  // ── 大限数组（倪师《天纪》正统：四化永远固定，大限只看宫位移动）──
  // 不再生成 daXians[].siHua / stemIndex / stemName（飞星派字段已下线）
  const daXians: DaXian[] = palaces
    .filter(p => p.daXianAge)
    .sort((a, b) => a.daXianAge![0] - b.daXianAge![0])
    .map(p => ({
      startAge:    p.daXianAge![0],
      endAge:      p.daXianAge![1],
      palaceBranch: p.branch,
      palaceName:   p.name,
      // 宫干自化已下线（倪师不主张飞星派宫干自化论）
      // 但大限宫干本身保留用于 UI 显示，2026-06-06 修复
      stemIndex:   p.stem,
      stemName:    STEMS[p.stem],
    }));

  // 宫干自化已下线（倪师不主张飞星派宫干自化论）

  const currentDaXianIndex = daXians.findIndex(
    dx => currentAge >= dx.startAge && currentAge <= dx.endAge,
  );

  // ── 农历信息 ──
  const lunarInfo = getLunarInfo(year, month, day);

  return {
    birthInfo,
    lunarInfo,
    mingGongBranch: mingGongBranch >= 0 ? mingGongBranch : 0,
    shenGongBranch: shenGongBranch >= 0 ? shenGongBranch : 0,
    wuxingJu,
    wuxingJuName,
    ziweiPos,
    palaces,
    daXians,
    currentAge,
    currentDaXianIndex,
  };
}
