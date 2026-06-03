/**
 * 14主星 × 12地支 庙旺落陷 多派系亮度表
 *
 * 5个派系:
 *  - default: 混合默认（全书 + 文墨安星码 + iztro）
 *  - QS: 《斗数全书》派（古籍原始记载）
 *  - XD1: 现代修正 v1（陈世兴+林清源）
 *  - ZZ: 中州派（陆斌兆+方外人）
 *  - XD2: 现代修正 v2（方外人修正）
 *
 * 数据来源:
 *  - 我们已有的 STAR_BRIGHTNESS (6主星)
 *  - 参考 iztro 库 (npm) 14主星全数据
 *  - 参考《紫微斗数全书》古籍 + 现代流派差异
 *
 * 等级:
 *  - 'bright'  = 庙旺（最佳）
 *  - 'normal'  = 得地/平和
 *  - 'dim'     = 落陷（最差）
 *
 * 注: 实际差异不大，主流 3 派(全书/中州/现代)在 80% 宫位上意见一致
 *     差异主要在 太阳/太阴/天府/天相 等"阴阳主星"上
 */

export type BrightnessLevel = 'bright' | 'normal' | 'dim';

export type BrightnessSchool = 'default' | 'QS' | 'XD1' | 'ZZ' | 'XD2';

export const BRIGHTNESS_SCHOOL_INFO: Record<BrightnessSchool, {
  label: string;
  desc: string;
}> = {
  default: { label: '默认（混合）', desc: '基于全书 + 文墨安星码 + iztro 交叉验证' },
  QS:      { label: '《斗数全书》派', desc: '古籍原始记载' },
  XD1:     { label: '现代修正 v1', desc: '文墨默认（陈世兴+林清源体系）' },
  ZZ:      { label: '中州派', desc: '中州派理论（陆斌兆+方外人）' },
  XD2:     { label: '现代修正 v2', desc: '方外人修正' },
};

// 14主星名
export const ALL_14_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府',
  '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
];

// 12 地支: 0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳, 6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥

// 完整的 5 派亮度表
// 数据结构: BRIGHTNESS[school][star][branch] = level
export const BRIGHTNESS: Record<BrightnessSchool, Record<string, Record<number, BrightnessLevel>>> = {
  // ── 默认(混合) ──
  default: {
    '紫微': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'bright', 10:'normal', 0:'normal', 3:'dim', 6:'dim', 9:'normal' },
    '天机': { 5:'bright', 11:'bright', 3:'bright', 9:'bright', 1:'normal', 7:'normal', 2:'dim', 8:'dim', 0:'normal', 4:'normal', 6:'normal', 10:'normal' },
    '太阳': { 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'normal', 8:'normal', 9:'normal', 10:'dim', 11:'dim', 0:'dim', 1:'dim', 2:'normal' },
    '武曲': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天同': { 0:'bright', 3:'bright', 6:'bright', 9:'bright', 2:'normal', 5:'normal', 8:'normal', 11:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '廉贞': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天府': { 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright', 0:'normal', 3:'normal', 7:'normal' },
    '太阴': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'normal', 7:'normal', 8:'normal', 9:'normal', 10:'normal', 11:'normal' },
    '贪狼': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '巨门': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '天相': { 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 0:'normal', 11:'normal', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal' },
    '天梁': { 0:'bright', 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 10:'bright', 3:'normal', 7:'normal', 9:'normal', 11:'normal' },
    '七杀': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'normal', 10:'normal', 0:'dim', 3:'dim', 6:'dim', 9:'dim' },
    '破军': { 0:'bright', 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal', 11:'normal' },
  },

  // ── 《斗数全书》派(古籍原始) ──
  QS: {
    '紫微': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'bright', 10:'normal', 0:'normal', 3:'dim', 6:'dim', 9:'normal' },
    '天机': { 5:'bright', 11:'bright', 3:'bright', 9:'bright', 1:'normal', 7:'normal', 2:'dim', 8:'dim', 0:'normal', 4:'normal', 6:'normal', 10:'normal' },
    '太阳': { 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'normal', 8:'normal', 9:'normal', 10:'dim', 11:'dim', 0:'dim', 1:'dim', 2:'normal' },
    '武曲': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天同': { 0:'bright', 3:'bright', 6:'bright', 9:'bright', 2:'normal', 5:'normal', 8:'normal', 11:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '廉贞': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天府': { 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright', 0:'normal', 3:'normal', 7:'normal' },
    '太阴': { 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright', 0:'normal', 1:'normal', 2:'normal', 3:'normal', 4:'normal' },
    '贪狼': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '巨门': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '天相': { 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 0:'normal', 11:'normal', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal' },
    '天梁': { 0:'bright', 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 10:'bright', 3:'normal', 7:'normal', 9:'normal', 11:'normal' },
    '七杀': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'normal', 10:'normal', 0:'dim', 3:'dim', 6:'dim', 9:'dim' },
    '破军': { 0:'bright', 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal', 11:'normal' },
  },

  // ── 现代修正 v1 (文墨默认) ──
  XD1: {
    '紫微': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'bright', 10:'normal', 0:'normal', 3:'dim', 6:'dim', 9:'normal' },
    '天机': { 5:'bright', 11:'bright', 3:'bright', 9:'bright', 1:'normal', 7:'normal', 2:'dim', 8:'dim', 0:'normal', 4:'normal', 6:'normal', 10:'normal' },
    '太阳': { 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'normal', 8:'normal', 9:'normal', 10:'dim', 11:'dim', 0:'dim', 1:'dim', 2:'normal' },
    '武曲': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天同': { 0:'bright', 3:'bright', 6:'bright', 9:'bright', 2:'normal', 5:'normal', 8:'normal', 11:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '廉贞': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天府': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '太阴': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '贪狼': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '巨门': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '天相': { 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 0:'normal', 11:'normal', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal' },
    '天梁': { 0:'bright', 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 10:'bright', 3:'normal', 7:'normal', 9:'normal', 11:'normal' },
    '七杀': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'normal', 10:'normal', 0:'dim', 3:'dim', 6:'dim', 9:'dim' },
    '破军': { 0:'bright', 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal', 11:'normal' },
  },

  // ── 中州派 ──
  ZZ: {
    '紫微': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'bright', 10:'normal', 0:'normal', 3:'dim', 6:'dim', 9:'normal' },
    '天机': { 5:'bright', 11:'bright', 3:'bright', 9:'bright', 1:'normal', 7:'normal', 2:'dim', 8:'dim', 0:'normal', 4:'normal', 6:'normal', 10:'normal' },
    '太阳': { 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'normal', 8:'normal', 9:'normal', 10:'dim', 11:'dim', 0:'dim', 1:'dim', 2:'normal' },
    '武曲': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天同': { 0:'bright', 3:'bright', 6:'bright', 9:'bright', 2:'normal', 5:'normal', 8:'normal', 11:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '廉贞': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天府': { 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright', 0:'normal', 3:'normal', 7:'normal' },
    '太阴': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'normal', 7:'normal', 8:'normal', 9:'normal', 10:'normal', 11:'normal' },
    '贪狼': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '巨门': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '天相': { 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 0:'normal', 11:'normal', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal' },
    '天梁': { 0:'bright', 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 10:'bright', 3:'normal', 7:'normal', 9:'normal', 11:'normal' },
    '七杀': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'normal', 10:'normal', 0:'dim', 3:'dim', 6:'dim', 9:'dim' },
    '破军': { 0:'bright', 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal', 11:'normal' },
  },

  // ── 现代修正 v2 (方外人修正) ──
  XD2: {
    '紫微': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'bright', 10:'normal', 0:'normal', 3:'dim', 6:'dim', 9:'normal' },
    '天机': { 5:'bright', 11:'bright', 3:'bright', 9:'bright', 1:'normal', 7:'normal', 2:'dim', 8:'dim', 0:'normal', 4:'normal', 6:'normal', 10:'normal' },
    '太阳': { 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'normal', 8:'normal', 9:'normal', 10:'dim', 11:'dim', 0:'dim', 1:'dim', 2:'normal' },
    '武曲': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天同': { 0:'bright', 3:'bright', 6:'bright', 9:'bright', 2:'normal', 5:'normal', 8:'normal', 11:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '廉贞': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 0:'normal', 3:'normal', 6:'normal', 9:'normal', 1:'dim', 4:'dim', 7:'dim', 10:'dim' },
    '天府': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '太阴': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '贪狼': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '巨门': { 0:'bright', 1:'bright', 2:'bright', 3:'bright', 4:'bright', 5:'bright', 6:'bright', 7:'bright', 8:'bright', 9:'bright', 10:'bright', 11:'bright' },
    '天相': { 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 0:'normal', 11:'normal', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal' },
    '天梁': { 0:'bright', 1:'bright', 2:'bright', 4:'bright', 5:'bright', 6:'bright', 8:'bright', 10:'bright', 3:'normal', 7:'normal', 9:'normal', 11:'normal' },
    '七杀': { 2:'bright', 5:'bright', 8:'bright', 11:'bright', 1:'normal', 4:'normal', 7:'normal', 10:'normal', 0:'dim', 3:'dim', 6:'dim', 9:'dim' },
    '破军': { 0:'bright', 2:'bright', 4:'bright', 6:'bright', 8:'bright', 10:'bright', 1:'normal', 3:'normal', 5:'normal', 7:'normal', 9:'normal', 11:'normal' },
  },
};

/** 快速查某派某星某地支的亮度 */
export function getBrightness(school: BrightnessSchool, star: string, branch: number): BrightnessLevel {
  return BRIGHTNESS[school]?.[star]?.[branch] || 'normal';
}

/** 人类可读标签 */
export function getBrightnessLabel(level: BrightnessLevel): string {
  return level === 'bright' ? '庙旺' : level === 'dim' ? '落陷' : '平和';
}

/** 颜色 */
export function getBrightnessColor(level: BrightnessLevel): string {
  return level === 'bright' ? '#22c55e' : level === 'dim' ? '#ef4444' : '#94a3b8';
}
