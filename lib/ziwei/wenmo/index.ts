/**
 * 文默天机 52 数组池 (wenmo-encss-ts) - 命运钥匙接入
 *
 * 来源: 逆向文默天机 SWF 的 52 数组 gcs 池
 * 文档: /root/.openclaw/workspace/docs/wenmo-input/文默天机-UPD-AI提示词-v13.md
 *
 * 关键资产:
 * - HEAVENLY_STEMS / EARTHLY_BRANCHES / FIVE_ELEMENTS (替代手写数组)
 * - STAR_NAMES.chs (14 主星, 倪海厦体系)
 * - PALACE_NAMES.chs (12 宫位, 命运钥匙对齐: .slice(1))
 * - DECADE_NAMES.chs (12 长生状态)
 * - JIAZI_CYCLE.chs (60 甲子)
 * - FIVE_ELEMENT_BUREAU.chs (五行局)
 * - 独家: SIHUA_TABLE_16 (16 套四化), CHANGSHENG_TABLES (3 套长生)
 */

// 类型 + 简单常量 (来自 types.ts)
export {
  STAR_NAMES,
  PALACE_NAMES,
  DECADE_NAMES,
  JIAZI_CYCLE,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  FIVE_ELEMENTS,
  FIVE_ELEMENT_BUREAU,
  ZODIAC_ANIMALS,
  YIN_YANG,
} from './types';

// 池 + 表 (来自 gcs-pool.ts)
export {
  GCS_POOL_52,
  CORE_ARRAYS_20,
  SKELETON_ARRAYS_32,
  SIHUA_TABLE_16,
  CHANGSHENG_TABLES,
  IZTRO_COMPARISON,
  DESTINY_KEY_PATH,
  getGCSArray,
  getResolvedArrays,
  getSkeletonArrays,
  getArrayByKey,
} from './gcs-pool';

export type { Language, GCSArray } from './types';
export type { SihuaEntry } from './gcs-pool';
