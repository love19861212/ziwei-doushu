/**
 * 紫微斗数排盘算法 - 基于 iztro 开源库
 * https://github.com/SylarLong/iztro
 */

import { astro } from 'iztro';
import { Solar } from 'lunar-javascript';
import type { BirthInfo, LunarInfo, Star, Palace, DaXian, DaXianSiHua, ZiweiChart } from './types';
import { BRANCHES, STEMS } from './constants';
// 飞星派工具仅供导出,不再在排盘时调用(倪师《天纪 03》:四化星永远固定不动)
// import { detectSelfSihua, getSiHuaByStem } from './sihua';

// ─── 农历信息(兼容保留)────────────────────────────────────────
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

// 2026-06-11 回归: 倪海夏《天纪》派, BirthInfo.hour 是钟表时辰地支索引 0-11
// formToBirthInfo 调 clockHourToTimeIndex 把钟表小时转成地支索引
// iztro bySolar 第 2 参数期望的就是 0-11(0=子, 1=丑, ..., 11=亥)
// 直接传 hour 即可,不要再转换!

export function generateChart(birthInfo: BirthInfo): ZiweiChart {
  const { year, month, day, hour, gender } = birthInfo;

  // 调用 iztro 排盘
  const solarDate = `${year}-${month}-${day}`;
  const iztroGender = gender === 'male' ? '男' : '女';
  // 2026-06-11: BirthInfo.hour 已经是钟表时辰地支索引(0-11) - 跟 iztro timeIndex 一致!
  //   formToBirthInfo 调 clockHourToTimeIndex 把钟表小时转地支索引
  //   iztro bySolar 第 2 参数: 0=子时 / 1=丑时 / 2=寅时 / ... / 9=酉时 / 10=戌时 / 11=亥时
  //   直接传 hour 给 iztro
  const astrolabe = astro.bySolar(solarDate, hour, iztroGender, true, 'zh-CN');

  // ── 组装十二宫 ──
  // 2026-06-07 fix: 撤销之前的"反转 iztro 数组"修复
  // iztro 库本身用的就是"倪海夏《天纪》命宫起逆时针 12 宫",不需要反转!
  // 之前 commit 7d68fbe 的 IZTRO_TO_WENMO_INDEX = [3,2,1,0,11,10,...] 是错的!
  // 实测 h=8 timeIndex 4 命宫酉(9): iztro 输出 12 宫顺序 = 文墨天机顺序
  //   iztro[0]=寅(仆役) / iztro[1]=卯(迁移) / iztro[2]=辰(疾厄) / iztro[3]=巳(财帛)
  //   iztro[4]=午(子女) / iztro[5]=未(夫妻) / iztro[6]=申(兄弟) / iztro[7]=酉(命宫)
  //   iztro[8]=戌(父母) / iztro[9]=亥(福德) / iztro[10]=子(田宅) / iztro[11]=丑(官禄)
  // 文墨天机按"命宫起逆时针":命9(酉)→兄8(申)→夫7(未)→子6(午)→财5(巳)→疾4(辰)→迁3(卯)
  //   →友2(寅)→官1(丑)→田0(子)→福11(亥)→父10(戌) - 100% 一致!

  // 2026-06-07 fix: 撤销之前的 14 主星后移 post-processing(错误修复)
  // 之前 commit 491c7ec 把太阳/武曲/七杀 后移 1 格是错的!
  // 实测 1987-01-11 h=8 命宫酉(9) 五行局火六局:
  //   iztro 12 宫跟用户报告 100% 一致(无需 post-processing)
  //   紫微 3(卯迁移)/ 贪狼 3(卯迁移)/ 天机 2(寅仆役)/ 太阴 2(寅仆役)
  //   巨门 4(辰疾厄)/ 天相 5(巳财帛)/ 天梁 6(午子女)
  //   廉贞 7(未夫妻)/ 七杀 7(未夫妻)/ 天同 10(戌父母)
  //   武曲 11(亥福德)/ 破军 11(亥福德)/ 太阳 0(子田宅)/ 天府 1(丑官禄)

  const palaces: Palace[] = astrolabe.palaces.map((p, i) => {
    const branch = BRANCHES.indexOf(p.earthlyBranch as string);
    const stem   = STEMS.indexOf(p.heavenlyStem as string);

    // 合并所有星:主星 + 次星 + 杂耀
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
      name:          (p.name === '仆役' ? '交友' : p.name as string),  // 2026-06-07: 倪海夏《天纪》用'交友',iztro用'仆役'
      stars:         allStars,
      daXianAge:     range ? [range[0], range[1]] as [number, number] : undefined,
      isMingGong:    p.name === '命宫',  // 2026-06-07: iztro 库的 p.name 已经是 '命宫'/'父母'等中文,直接用
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

  // ── 借对宫结构化字段(codex P0:避免文案层从自然语言反查借宫信息)──
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

  // ── 关键宫支 ──
  const mingGongBranch = BRANCHES.indexOf(astrolabe.earthlyBranchOfSoulPalace as string);
  const shenGongBranch = BRANCHES.indexOf(astrolabe.earthlyBranchOfBodyPalace as string);
  const wuxingJuName   = astrolabe.fiveElementsClass as string;
  const wuxingJu       = parseWuxingJu(wuxingJuName);

  // ── 紫微星位置 ──
  const ziweiPalace = palaces.find(p => p.stars.some(s => s.name === '紫微' && s.type === 'major'));
  const ziweiPos    = ziweiPalace?.branch ?? 0;

  // ── 大限数组(倪师《天纪》正统:四化永远固定,大限只看宫位移动)──
  // 不再生成 daXians[].siHua / stemIndex / stemName(飞星派字段已下线)
  const daXians: DaXian[] = palaces
    .filter(p => p.daXianAge)
    .sort((a, b) => a.daXianAge![0] - b.daXianAge![0])
    .map(p => ({
      startAge:    p.daXianAge![0],
      endAge:      p.daXianAge![1],
      palaceBranch: p.branch,
      palaceName:   p.name,
      // 宫干自化已下线(倪师不主张飞星派宫干自化论)
      // 但大限宫干本身保留用于 UI 显示,2026-06-06 修复
      stemIndex:   p.stem,
      stemName:    STEMS[p.stem],
    }));

  // 宫干自化已下线(倪师不主张飞星派宫干自化论)

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
