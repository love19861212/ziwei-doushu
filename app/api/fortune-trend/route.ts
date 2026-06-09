/**
 * 命运钥匙 /api/fortune-trend (W4, 2026-06-09)
 *
 * 返回未来 5-10 年流年趋势
 * 纯本地计算, 不调 LLM
 * 用于: 跨年可视化 + 流年触发预测
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import { EARTHLY_BRANCHES, getPalaceByBranch } from '@/lib/ziwei/wenmo';

const W4_ENABLED = process.env.FORTUNE_TREND_ENABLED !== 'false'; // 默认开

function getBeijingNow(): Date {
  return new Date(Date.now() + 8 * 3600 * 1000);
}

function getLiuNianBranch(year: number): number {
  return ((year - 2020) % 12 + 12) % 12;
}

function getDaXianLiuNianRelation(dxBranch: number, lnBranch: number): string {
  const diff = Math.abs(dxBranch - lnBranch);
  if (diff === 0) return '同行';
  if (diff === 6) return '对冲';
  if ([4, 8].includes(diff)) return '三合';
  if ([3, 9].includes(diff)) return '六合';
  return diff <= 2 || diff >= 10 ? '相邻' : '其他';
}

export async function POST(req: NextRequest) {
  if (!W4_ENABLED) {
    return NextResponse.json({ error: 'fortune-trend 已禁用' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const chart: ZiweiChart = body.chart;
    const years: number = Math.min(Math.max(body.years ?? 5, 1), 12); // 1-12 年

    if (!chart) {
      return NextResponse.json({ error: '缺少命盘数据' }, { status: 400 });
    }

    const currentYear = getBeijingNow().getUTCFullYear();
    const palaces: Palace[] = chart.palaces ?? [];
    const daXians = chart.daXians ?? [];

    const trends = [];
    for (let i = 0; i < years; i++) {
      const year = currentYear + i;
      const lnBranch = getLiuNianBranch(year);
      const lnPalace = getPalaceByBranch(palaces, lnBranch);

      // 找出该年所在的大限 (按 age 范围)
      const ageThatYear = chart.currentAge + i;
      const dx = daXians.find(d => ageThatYear >= d.startAge && ageThatYear <= d.endAge);
      const dxBranch = dx?.palaceBranch ?? -1;

      trends.push({
        year,
        age: ageThatYear,
        liuNian: {
          branch: lnBranch,
          branchName: EARTHLY_BRANCHES[lnBranch],
          palaceName: lnPalace?.name || '?',
          mainStars: (lnPalace?.stars ?? [])
            .filter(s => s.type === 'major')
            .map(s => s.name + (s.siHua ? `化${s.siHua}` : ''))
            .join('+') || '空',
        },
        daXian: dx ? {
          palaceName: dx.palaceName,
          palaceBranch: dx.palaceBranch,
        } : null,
        relation: dxBranch >= 0 ? getDaXianLiuNianRelation(dxBranch, lnBranch) : '无大限',
        isCurrent: year === currentYear,
      });
    }

    return NextResponse.json({
      meta: {
        currentYear,
        currentAge: chart.currentAge,
        trendYears: years,
      },
      trends,
    });
  } catch (e: unknown) {
    console.error('fortune-trend error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '服务器错误' },
      { status: 500 }
    );
  }
}
