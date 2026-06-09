/**
 * 命运钥匙 /api/fortune-timeline (W4, 2026-06-09)
 *
 * 返回 12 大限流年总表 (12 个大限 + 12 流年支位)
 * 纯本地计算, 不调 LLM
 *
 * 文档: /root/.openclaw/workspace/docs/wenmo-input/文默天机-UPD-AI提示词-v13.md (W4 路线)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import { EARTHLY_BRANCHES } from '@/lib/ziwei/wenmo';

const W4_ENABLED = process.env.FORTUNE_TIMELINE_ENABLED !== 'false'; // 默认开

function getBeijingNow(): Date {
  return new Date(Date.now() + 8 * 3600 * 1000);
}

function getLiuNianBranch(year: number): number {
  return ((year - 2020) % 12 + 12) % 12;
}

function getDaXianLiuNianRelation(dxBranch: number, lnBranch: number): string {
  const diff = Math.abs(dxBranch - lnBranch);
  if (diff === 0) return '同行(同宫触发)';
  if (diff === 6) return '对冲(冲突大)';
  if ([4, 8].includes(diff)) return '三合(助力强)';
  if ([3, 9].includes(diff)) return '六合(和谐)';
  if (diff <= 2 || diff >= 10) return '相邻(渐进)';
  return '其他';
}

interface DaXianEntry {
  index: number;
  startAge: number;
  endAge: number;
  palaceBranch: number;
  palaceName: string;
  siHua?: { lu: string; quan: string; ke: string; ji: string };
  isCurrent: boolean;
}

interface LiuNianEntry {
  year: number;
  branch: number;
  branchName: string;
  palaceName: string;
  mainStars: string;
  isCurrent: boolean;
}

export async function POST(req: NextRequest) {
  if (!W4_ENABLED) {
    return NextResponse.json({ error: 'fortune-timeline 已禁用' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const chart: ZiweiChart = body.chart;

    if (!chart) {
      return NextResponse.json({ error: '缺少命盘数据' }, { status: 400 });
    }

    const currentYear = getBeijingNow().getUTCFullYear();
    const palaces: Palace[] = chart.palaces ?? [];

    // 12 大限
    const daXianList: DaXianEntry[] = (chart.daXians ?? []).map((dx, idx) => ({
      index: idx,
      startAge: dx.startAge,
      endAge: dx.endAge,
      palaceBranch: dx.palaceBranch,
      palaceName: dx.palaceName,
      siHua: dx.siHua,
      isCurrent: idx === (chart.currentDaXianIndex ?? -1),
    }));

    // 12 流年 (从 2020 庚子起, 给 12 年)
    const liuNianList: LiuNianEntry[] = [];
    for (let y = 2020; y <= 2031; y++) {
      const branch = getLiuNianBranch(y);
      const p = palaces[branch];
      const mainStars = (p?.stars ?? [])
        .filter(s => s.type === 'major')
        .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
        .join('+') || '空';
      liuNianList.push({
        year: y,
        branch,
        branchName: EARTHLY_BRANCHES[branch],
        palaceName: p?.name || '?',
        mainStars,
        isCurrent: y === currentYear,
      });
    }

    // 当前大限 + 当年流年的关系
    const currentDaXian = daXianList.find(d => d.isCurrent);
    const currentLiuNian = liuNianList.find(l => l.isCurrent);
    const cross = (currentDaXian && currentLiuNian)
      ? {
          dxPalaceName: currentDaXian.palaceName,
          lnPalaceName: currentLiuNian.palaceName,
          relation: getDaXianLiuNianRelation(currentDaXian.palaceBranch, currentLiuNian.branch),
        }
      : null;

    return NextResponse.json({
      meta: {
        currentYear,
        currentAge: chart.currentAge,
        totalDaXian: daXianList.length,
        totalLiuNian: liuNianList.length,
      },
      daXians: daXianList,
      liuNians: liuNianList,
      currentCross: cross,
    });
  } catch (e: unknown) {
    console.error('fortune-timeline error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '服务器错误' },
      { status: 500 }
    );
  }
}
