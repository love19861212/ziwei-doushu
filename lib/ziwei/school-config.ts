/**
 * 10 类排盘开关 Schema — 完整版
 *
 * 探自 Oracle 站 "✦ 排盘流派切换" 面板
 * https://wdyziweidoushu666.com
 *
 * 10 个开关 (按影响范围排序):
 *  1. 14 主星亮度表 (5 派)
 *  2. 庚年四化 (5 种: GYWYT/GYWTY/GYWFT/GYWFX/GYWTX)
 *  3. 安天马 (2 种: 年支/月支)
 *  4. 安天空 (2 种: 常规/顺加生时)
 *  5. 安截空旬空 (3 种: 正副双星/常规单星/占验派)
 *  6. 安魁钺 (4 种: 全书理解1/2/钟义明/网络)
 *  7. 安天使天伤 (2 种: 常规/中州派)
 *  8. 长生十二神 (3 种: 阴阳顺逆/水土共/火土共)
 *  9. 晚子时 (4 种: 视为次日/当日/八字分柱)
 * 10. 闰月归属 (4 种: 分半/下月/上月/本月)
 *
 * 每一类都对应一个排盘算法的具体维度
 */

export interface SchoolOption {
  value: string;
  label: string;
  desc: string;
}

export interface SchoolCategory {
  key: string;
  label: string;
  desc: string;
  options: SchoolOption[];
  defaultValue: string;
}

// ─────────────────────────────────────────
// 1. 14 主星亮度表 (5 派)
// ─────────────────────────────────────────
export const starBrightness: SchoolCategory = {
  key: 'starBrightness',
  label: '14 主星亮度表',
  desc: '不同流派的庙旺落陷判断',
  defaultValue: 'default',
  options: [
    { value: 'default', label: '默认（混合）', desc: '基于全书 + 文墨安星码 8GDPB 交叉验证' },
    { value: 'QS', label: '《斗数全书》派', desc: '古籍原始记载' },
    { value: 'XD1', label: '现代修正 v1', desc: '文墨默认（陈世兴+林清源体系）' },
    { value: 'ZZ', label: '中州派', desc: '中州派理论（陆斌兆+方外人）' },
    { value: 'XD2', label: '现代修正 v2', desc: '方外人修正' },
  ],
};

// ─────────────────────────────────────────
// 2. 庚年四化 (5 种)
// ─────────────────────────────────────────
export const gengYearSihua: SchoolCategory = {
  key: 'gengYearSihua',
  label: '庚年四化',
  desc: '庚年天干决定流年四化',
  defaultValue: 'GYWYT',
  options: [
    { value: 'GYWYT', label: '阳武阴同', desc: '默认（与 iztro / 主流一致）' },
    { value: 'GYWTY', label: '阳武同阴', desc: '科忌互换说' },
    { value: 'GYWFT', label: '阳武府同', desc: '权科互换说' },
    { value: 'GYWFX', label: '阳武府相', desc: '全互换说' },
    { value: 'GYWTX', label: '阳武同相', desc: '部分互换说' },
  ],
};

// ─────────────────────────────────────────
// 3. 安天马 (2 种)
// ─────────────────────────────────────────
export const tianmaSchool: SchoolCategory = {
  key: 'tianmaSchool',
  label: '安天马',
  desc: '天马星的地支定位',
  defaultValue: 'year-branch',
  options: [
    { value: 'year-branch', label: '依据年支', desc: '默认' },
    { value: 'month-branch', label: '依据月支', desc: '' },
  ],
};

// ─────────────────────────────────────────
// 4. 安天空 (2 种)
// ─────────────────────────────────────────
export const tiankongSchool: SchoolCategory = {
  key: 'tiankongSchool',
  label: '安天空',
  desc: '天空星的地支定位',
  defaultValue: 'normal',
  options: [
    { value: 'normal', label: '常规排法', desc: '默认' },
    { value: 'shun-jia-shi', label: '顺加生时', desc: '' },
  ],
};

// ─────────────────────────────────────────
// 5. 安截空旬空 (3 种)
// ─────────────────────────────────────────
export const jiekongSchool: SchoolCategory = {
  key: 'jiekongSchool',
  label: '安截空旬空',
  desc: '截空 / 旬空 的双星vs单星',
  defaultValue: 'double',
  options: [
    { value: 'double', label: '正副双星', desc: '默认' },
    { value: 'single', label: '常规单星', desc: '' },
    { value: 'zhanyan', label: '占验派', desc: '' },
  ],
};

// ─────────────────────────────────────────
// 6. 安魁钺 (4 种)
// ─────────────────────────────────────────
export const kuiyueSchool: SchoolCategory = {
  key: 'kuiyueSchool',
  label: '安魁钺',
  desc: '天魁天钺的位置算法',
  defaultValue: 'qs1',
  options: [
    { value: 'qs1', label: '《斗数全书》理解 1', desc: '默认' },
    { value: 'qs2', label: '《斗数全书》理解 2', desc: '差异仅在庚辛壬癸年生人' },
    { value: 'zhong-yiming', label: '钟义明先生书籍排法', desc: '' },
    { value: 'network', label: '网络流传排法', desc: '' },
  ],
};

// ─────────────────────────────────────────
// 7. 安天使天伤 (2 种)
// ─────────────────────────────────────────
export const tianshiTianshang: SchoolCategory = {
  key: 'tianshiTianshang',
  label: '安天使天伤',
  desc: '天使天伤的排法',
  defaultValue: 'normal',
  options: [
    { value: 'normal', label: '常规排法', desc: '文墨默认（身宫 15 位）' },
    { value: 'zhongzhou', label: '中州派排法', desc: '默认 + 生月奇偶 × 性别 交换' },
  ],
};

// ─────────────────────────────────────────
// 8. 长生十二神 (3 种)
// ─────────────────────────────────────────
export const changshengSchool: SchoolCategory = {
  key: 'changshengSchool',
  label: '长生十二神',
  desc: '12 长生起点的判断',
  defaultValue: 'yin-yang-shun-ni',
  options: [
    { value: 'yin-yang-shun-ni', label: '区分阴阳顺逆', desc: '默认' },
    { value: 'shui-tu', label: '水土共长生', desc: '土五局起点 = 水二局起点 (申)' },
    { value: 'huo-tu', label: '火土共长生', desc: '土五局起点 = 火六局起点 (寅)' },
  ],
};

// ─────────────────────────────────────────
// 9. 晚子时 (4 种)
// ─────────────────────────────────────────
export const lateZishi: SchoolCategory = {
  key: 'lateZishi',
  label: '晚子时',
  desc: '23:00-00:59 出生者的日干支归属',
  defaultValue: 'next-day',
  options: [
    { value: 'next-day', label: '视为次日', desc: '默认（文墨 + 主流）' },
    { value: 'current-day', label: '视为当日', desc: '倪海夏派' },
    { value: 'all-current', label: '日柱当日 / 时柱当日（八字）', desc: '' },
    { value: 'day-cur-time-next', label: '日柱当日 / 时柱次日（八字）', desc: '' },
  ],
};

// ─────────────────────────────────────────
// 10. 闰月归属 (4 种)
// ─────────────────────────────────────────
export const leapMonth: SchoolCategory = {
  key: 'leapMonth',
  label: '闰月归属',
  desc: '闰月出生者的月份归属',
  defaultValue: 'split',
  options: [
    { value: 'split', label: '视为分半', desc: '默认（前 15 天归上月 / 后 15 天归下月，文墨默认）' },
    { value: 'next-month', label: '视为下月', desc: '倪海夏派（闰四月整月当五月排）' },
    { value: 'prev-month', label: '视为上月', desc: '部分古籍说法' },
    { value: 'origin-month', label: '视为本月', desc: '不调整，闰月按本月排' },
  ],
};

export const SCHOOL_CATEGORIES: SchoolCategory[] = [
  starBrightness,
  gengYearSihua,
  tianmaSchool,
  tiankongSchool,
  jiekongSchool,
  kuiyueSchool,
  tianshiTianshang,
  changshengSchool,
  lateZishi,
  leapMonth,
];

export type SchoolConfig = Record<string, string>;

/** 默认配置 */
export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = SCHOOL_CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.key]: cat.defaultValue }),
  {} as SchoolConfig
);

/** 预设: 倪海夏派 */
export const NI_HAI_XIA_PRESET: SchoolConfig = {
  ...DEFAULT_SCHOOL_CONFIG,
  lateZishi: 'current-day',
  leapMonth: 'next-month',
};

/** 预设: 中州派 */
export const ZHONG_ZHOU_PRESET: SchoolConfig = {
  ...DEFAULT_SCHOOL_CONFIG,
  starBrightness: 'ZZ',
  tianshiTianshang: 'zhongzhou',
  changshengSchool: 'huo-tu',
};

/** 预设: 文墨默认 */
export const WEN_MO_PRESET: SchoolConfig = {
  ...DEFAULT_SCHOOL_CONFIG,
  starBrightness: 'XD1',
};

/** 预设: 古籍派 */
export const GU_JI_PRESET: SchoolConfig = {
  ...DEFAULT_SCHOOL_CONFIG,
  starBrightness: 'QS',
  kuiyueSchool: 'qs1',
};

export const PRESETS: Array<{ name: string; label: string; desc: string; config: SchoolConfig }> = [
  { name: 'default', label: '默认（混合）', desc: '10 类开关全 default', config: DEFAULT_SCHOOL_CONFIG },
  { name: 'wenmo', label: '文墨默认', desc: '文墨派常用的设置', config: WEN_MO_PRESET },
  { name: 'nhaixia', label: '倪海夏派', desc: '倪海夏《天纪》体系', config: NI_HAI_XIA_PRESET },
  { name: 'zhongzhou', label: '中州派', desc: '中州派理论', config: ZHONG_ZHOU_PRESET },
  { name: 'guji', label: '古籍派', desc: '《斗数全书》原始记载', config: GU_JI_PRESET },
];
