/**
 * 文默天机 ENCSS 52 数组系统 - 类型定义
 * 
 * 基于 v11 gcs 池结构逆向工程
 * 原始数据来源: WenMoTianJiK9AED028D8D0D4F849EE485310DCDD55DK
 * 
 * ENCSS = UTF-8 读取器 (非加密 per v18)
 * UPD 链: base64.decode → LZMA.decompress → UTF-8 decode
 */

export type Language = 'chs' | 'cht' | 'kor';

export interface GCSArray {
  /** 数组索引 (1-52) */
  index: number;
  /** 数组名称 */
  name: string;
  /** 数组长度 (固定数字或 'var' 表示可变) */
  count: number | 'var';
  /** 原始 Actionscript 变量名 */
  key: string;
  /** 数组内容 (如已知) */
  data?: string[];
  /** 备注 */
  remark?: string;
}

/**
 * 14 主星 (14 Major Stars)
 * 索引 1-14
 */
export const STAR_NAMES: Record<Language, string[]> = {
  chs: ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'],
  cht: ['紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'],
  kor: [],
};

/**
 * 12 宫位名 (12 Palace Names)
 * 索引 1-12, [0] 为空占位
 */
export const PALACE_NAMES: Record<Language, string[]> = {
  chs: ['', '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'],
  cht: ['', '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '官祿', '田宅', '福德', '父母'],
  kor: ['', 'Life Palace', 'Siblings', 'Spouse', 'Children', 'Wealth', 'Health', 'Migration', 'Friends', 'Career', 'Property', 'Virtue', 'Parents'],
};

/**
 * 12 大限名 (12 Decade Limits)
 */
export const DECADE_NAMES: Record<Language, string[]> = {
  chs: ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'],
  cht: ['長生', '沐浴', '冠帶', '臨官', '帝旺', '衰', '病', '死', '墓', '絕', '胎', '養'],
  kor: [],
};

/**
 * 60 甲子顺序 (60 Jia-Zi Cycle)
 */
export const JIAZI_CYCLE: Record<Language, string[]> = {
  chs: [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
  ],
  cht: [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
  ],
  kor: [],
};

/**
 * 天干 (10 Heavenly Stems)
 */
export const HEAVENLY_STEMS: string[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * 地支 (12 Earthly Branches)
 */
export const EARTHLY_BRANCHES: string[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 五行 (5 Elements)
 */
export const FIVE_ELEMENTS: string[] = ['木', '火', '土', '金', '水'];

/**
 * 五行局 (5 Element Bureau)
 */
export const FIVE_ELEMENT_BUREAU: Record<Language, string[]> = {
  chs: ['木三局', '火六局', '土五局', '金四局', '水二局'],
  cht: ['木三局', '火六局', '土五局', '金四局', '水二局'],
  kor: [],
};

/**
 * 12 生肖 (12 Chinese Zodiac Animals)
 */
export const ZODIAC_ANIMALS: string[] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/**
 * 12 星座 (12 Western Zodiac Signs) - 备用
 */
export const ZODIAC_SIGNS: string[] = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
];

/**
 * 阴阳 (Yin-Yang)
 */
export const YIN_YANG: string[] = ['阴', '阳'];

/**
 * 16 套四化派系表 (16 Sihua Transformation Tables) - 骨架
 * 完整内容待从 JWSTR 池解码
 */
export const SIHUA_TABLES: Record<number, string[]> = {
  // TODO: 待解码填充
  // 每套 14 项，对应 14 主星的四化值
};

/**
 * 8 宅吉凶方位 (8 House Auspicious/Inauspicious Directions)
 * 格式: [坎宅, 艮宅, 震宅, 巽宅, 离宅, 坤宅, 兑宅, 乾宅]
 * 每宅 8 方位吉凶
 */
export const BAZHAI_DIRECTIONS: Record<Language, string[][]> = {
  chs: [],
  cht: [],
  kor: [],
};

/**
 * 60 甲子纳音五行 (Na-Yin Five Elements of 60 Jia-Zi)
 */
export const NAYIN_TABLE: Record<Language, string[][]> = {
  chs: [],
  cht: [],
  kor: [],
};

/**
 * 长生 12 状态 (12 Chang-Sheng States)
 */
export const CHANGSHENG_STATES: string[] = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
