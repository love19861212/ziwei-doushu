/**
 * 命运钥匙 宫位查找工具 (2026-06-09)
 *
 * iztro 输出 palaces[] 数组的索引规则:
 *   palaces[i].branch = (i + 2) % 12
 *   ⇔ palace_index = (branch - 2 + 12) % 12 = (branch + 10) % 12
 *
 * 直接用 palaces[branch] 是错的! (W2/W4 3 处都有这个 bug)
 * 用本工具函数替代
 *
 * 文档: /root/.openclaw/workspace/docs/wenmo-input/文默天机-UPD-AI提示词-v13.md
 */

import type { Palace } from '../types';

/** branch (0-11) → palaces[] 索引 */
export function branchToPalaceIndex(branch: number): number {
  return ((branch - 2) % 12 + 12) % 12;
}

/** 按 branch 取宫 (替代 palaces[branch]) */
export function getPalaceByBranch(palaces: Palace[] | undefined, branch: number): Palace | undefined {
  if (!palaces || palaces.length < 12) return undefined;
  // 优先用 palaces[i].branch 匹配 (更稳, 不依赖偏移假设)
  const found = palaces.find(p => p.branch === branch);
  if (found) return found;
  // 退化用偏移公式
  return palaces[branchToPalaceIndex(branch)];
}
