/**
 * 紫微方阵 vs 天府方阵 (学术深度)
 *
 * 14主星按"帝星" 分为两个星系:
 * - 紫微方阵 (紫微系): 紫微为帝, 6 颗主星逆行
 *   = 紫微 → 天机 → 太阳 → 武曲 → 天同 → 廉贞
 *   逆时针排布 (从寅起紫微, 子起天府)
 * - 天府方阵 (天府系): 天府为帝, 8 颗主星顺行
 *   = 天府 → 太阴 → 贪狼 → 巨门 → 天相 → 天梁 → 七杀 → 破军
 *   顺时针排布
 *
 * 区分意义:
 * 1. 排盘时 紫微定位 → 推 5 颗紫微系; 天府定位 → 推 7 颗天府系
 * 2. 两系交汇点 = "对星" (紫微+破军/天府等对宫)
 * 3. 方阵决定一些格局: 如"紫微在子" = 紫微+破军对宫
 * 4. AI 解读时可识别"紫微系集中" 还是 "天府系集中"
 *
 * 参考:
 *  - 《紫微斗数全书》: "紫微居子、破军居午" — 紫微方阵第 1 颗
 *  - 《骨髓赋》: "天府对紫微" — 两系对宫
 *  - 陈世兴《现代紫微斗数》: 紫微系 6 颗 + 天府系 8 颗
 */

export const ZIWEI_FANG_ZHEN = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞'] as const;
export const TIANFU_FANG_ZHEN = ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'] as const;

// 方阵描述
export const FANG_ZHEN_INFO = {
  紫微方阵: {
    name: '紫微方阵',
    nameEn: 'Ziwei Array',
    emperor: '紫微',
    stars: ZIWEI_FANG_ZHEN,
    direction: '逆行 (counter-clockwise)',
    startBranch: 2,  // 寅
    startStar: '紫微',
    color: '#A83228',  // 朱红
    nature: '领导、权威、贵气、开创',
    description: '紫微方阵以紫微为帝座，逆行排布6颗主星。代表官贵、领导力、开创性的人格特质。命宫主星为紫微系的人多具强势、果断、追求成就的特质。',
  },
  天府方阵: {
    name: '天府方阵',
    nameEn: 'Tianfu Array',
    emperor: '天府',
    stars: TIANFU_FANG_ZHEN,
    direction: '顺行 (clockwise)',
    startBranch: 0,  // 子
    startStar: '天府',
    color: '#3B6FA0',  // 藏蓝
    nature: '财库、稳健、协调、辅佐',
    description: '天府方阵以天府为帝，顺行排布8颗主星。代表财富、稳定、协调性的人格特质。命宫主星为天府系的人多具稳重、协调、善于理财的特质。',
  },
};

// 14 主星与方阵的对应
export const STAR_TO_FANG_ZHEN: Record<string, '紫微方阵' | '天府方阵'> = {
  '紫微': '紫微方阵',
  '天机': '紫微方阵',
  '太阳': '紫微方阵',
  '武曲': '紫微方阵',
  '天同': '紫微方阵',
  '廉贞': '紫微方阵',
  '天府': '天府方阵',
  '太阴': '天府方阵',
  '贪狼': '天府方阵',
  '巨门': '天府方阵',
  '天相': '天府方阵',
  '天梁': '天府方阵',
  '七杀': '天府方阵',
  '破军': '天府方阵',
};

// 紫微系 6 颗的地支位 (基于"紫微在寅=子宫顺数")
// 紫微 → 寅 (2) → 天机 → 卯 (3) → 太阳 → 辰 (4) → 武曲 → 巳 (5) → 天同 → 午 (6) → 廉贞 → 未 (7)
// 反推: 紫微在地支B, 则 天机=B+1, 太阳=B+2, 武曲=B+3, 天同=B+4, 廉贞=B+5 (mod 12)
export function getZiWeiFangZhenPositions(ziweiBranch: number): Record<string, number> {
  return {
    '紫微': ziweiBranch,
    '天机': (ziweiBranch + 1) % 12,
    '太阳': (ziweiBranch + 2) % 12,
    '武曲': (ziweiBranch + 3) % 12,
    '天同': (ziweiBranch + 4) % 12,
    '廉贞': (ziweiBranch + 5) % 12,
  };
}

// 天府系 8 颗的地支位 (基于"天府在子")
// 天府 → 子 (0) → 太阴 → 丑 (1) → 贪狼 → 寅 (2) → 巨门 → 卯 (3) → 天相 → 辰 (4) → 天梁 → 巳 (5) → 七杀 → 午 (6) → 破军 → 未 (7)
// 反推: 天府在地支T, 则 太阴=T+1, 贪狼=T+2, ..., 破军=T+7 (mod 12)
export function getTianFuFangZhenPositions(tianfuBranch: number): Record<string, number> {
  return {
    '天府': tianfuBranch,
    '太阴': (tianfuBranch + 1) % 12,
    '贪狼': (tianfuBranch + 2) % 12,
    '巨门': (tianfuBranch + 3) % 12,
    '天相': (tianfuBranch + 4) % 12,
    '天梁': (tianfuBranch + 5) % 12,
    '七杀': (tianfuBranch + 6) % 12,
    '破军': (tianfuBranch + 7) % 12,
  };
}

// 检测命盘主星的方阵分布
export interface FangZhenAnalysis {
  ziweiStars: Array<{ name: string; branch: number; palace: string }>;
  tianfuStars: Array<{ name: string; branch: number; palace: string }>;
  dominant: '紫微方阵' | '天府方阵' | '平衡';
  ziweiCount: number;
  tianfuCount: number;
  ratio: number;  // 紫微系占比
  description: string;
}

export function analyzeFangZhen(chart: any): FangZhenAnalysis {
  const all14Stars = [...ZIWEI_FANG_ZHEN, ...TIANFU_FANG_ZHEN];

  const ziweiStars: any[] = [];
  const tianfuStars: any[] = [];

  for (const palace of chart.palaces) {
    for (const star of (palace.stars || [])) {
      if (star.type !== 'major') continue;
      if (ZIWEI_FANG_ZHEN.includes(star.name as any)) {
        ziweiStars.push({ name: star.name, branch: palace.branch, palace: palace.name });
      } else if (TIANFU_FANG_ZHEN.includes(star.name as any)) {
        tianfuStars.push({ name: star.name, branch: palace.branch, palace: palace.name });
      }
    }
  }

  const total = ziweiStars.length + tianfuStars.length;
  const ratio = total > 0 ? ziweiStars.length / total : 0.5;

  let dominant: '紫微方阵' | '天府方阵' | '平衡';
  let description: string;
  if (Math.abs(ratio - 0.5) < 0.1) {
    dominant = '平衡';
    description = '紫微方阵与天府方阵主星数量接近，命格兼具开创与协调的双重特质。';
  } else if (ratio > 0.5) {
    dominant = '紫微方阵';
    description = '紫微方阵主星占主导，命格偏重领导、开创、贵气。命主有较强的帝王之象，追求权力与地位。';
  } else {
    dominant = '天府方阵';
    description = '天府方阵主星占主导，命格偏重财富、协调、稳健。命主善于理财与协调，具备宰相之才。';
  }

  return {
    ziweiStars,
    tianfuStars,
    dominant,
    ziweiCount: ziweiStars.length,
    tianfuCount: tianfuStars.length,
    ratio,
    description,
  };
}
