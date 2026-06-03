/**
 * /api/analysis
 *
 * 紫微斗数主题分析API — 对标Oracle站同名endpoint
 *
 * 接收 chart + topic + options，返回该主题的深度分析文本
 * Topic: 'overall' | 'career' | 'love' | 'wealth' | 'health' | 'family' | 'year' | 'decade'
 *
 * 实现策略：
 *  1. 从 chart 中提取关键要素（命宫主星、四化、格局、流年）
 *  2. 调用本地知识库 STAR_DB 拼装结构化解读
 *  3. (可选) 调用 AI 接口润色为自然语言
 *
 * 输入:
 *  {
 *    chart: ZiweiChart,
 *    chartToken?: string,  // 可选，Oracle的加密令牌
 *    topic: string,
 *    options?: { aiPolish?: boolean, maxLength?: number },
 *    userId?: string
 *  }
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';
import { getKnowledge } from '@/lib/seo/knowledge';
import type { TopicKey } from '@/lib/ziwei/db-analysis';
import oracleKb from '@/lib/ziwei/oracle_kb.json';

interface AnalysisRequest {
  chart: any;
  chartToken?: string;
  topic: 'overall' | 'career' | 'love' | 'wealth' | 'health' | 'family' | 'year' | 'decade';
  options?: {
    aiPolish?: boolean;
    maxLength?: number;
  };
  userId?: string;
}

const TOPIC_TO_PALACE: Record<string, string> = {
  overall: '命宫',
  career: '官禄',
  love: '夫妻',
  wealth: '财帛',
  health: '疾厄',
  family: '兄弟',
  year: '流年',
  decade: '大限',
};

const TOPIC_TO_KB: Record<string, TopicKey> = {
  overall: 'overview',
  career: 'career',
  love: 'love',
  wealth: 'wealth',
  health: 'health',
  family: 'family',
  year: 'overview',  // 流年用命宫基础+流年四化
  decade: 'overview', // 大限同理
};

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();
    const { chart, topic, options = {}, userId } = body;

    if (!chart?.palaces) {
      return NextResponse.json({ error: '缺少chart数据' }, { status: 400 });
    }

    const startTime = Date.now();
    const maxLength = options.maxLength || 1500;

    // ── 1. 找相关宫位的主星 ───────────────────────────
    const palaceName = TOPIC_TO_PALACE[topic] || '命宫';
    const targetPalace = chart.palaces.find(
      (p: any) => p.name === palaceName || p.name === palaceName + '宫'
    );

    const sections: { title: string; content: string; source?: string }[] = [];

    // ── 2. 命宫总览（overall/全部） ─────────────────
    if (topic === 'overall' || topic === 'year' || topic === 'decade') {
      try {
        const summary = getMingGongSummary(chart);
        sections.push({
          title: '【命盘总论】',
          content: typeof summary === 'string' ? summary : (summary as any).summary || JSON.stringify(summary),
          source: '本地排盘引擎',
        });
      } catch {
        // 忽略
      }
    }

    // ── 3. 该宫位主星入该宫位的解读（优先 Oracle KB） ─────────
    if (targetPalace) {
      const topicKey = TOPIC_TO_KB[topic];
      // overview 在 Oracle 里没有，fallback personality
      const lookupTopic = (topicKey === 'overview') ? 'personality' : topicKey;
      const majorStars = (targetPalace as any).stars.filter((s: any) => s.type === 'major');

      for (const star of majorStars) {
        const oracleEntry = (oracleKb as any)[star.name]?.[lookupTopic];
        const k = getKnowledge(star.name, topicKey);

        if (oracleEntry) {
          sections.push({
            title: `【${star.name}入${palaceName}】`,
            content: [
              oracleEntry.dingdiao,
              oracleEntry.lundian,
              oracleEntry.yiju ? `《命盘依据》${oracleEntry.yiju}` : '',
              oracleEntry.chuchu ? `《经典出处》${oracleEntry.chuchu}` : '',
            ].filter(Boolean).join('\n\n'),
            source: oracleEntry.chuchu || oracleEntry.title || '倪海夏《天纪》体系',
          });
        } else if (k.exists && k.parsed.lundian) {
          sections.push({
            title: `【${star.name}入${palaceName}】`,
            content: [k.parsed.dingdiao, k.parsed.lundian].filter(Boolean).join('。'),
            source: k.parsed.chuchu || '倪海夏《天纪》体系',
          });
        }
      }
    }

    // ── 4. 该宫位的格局（如有） ────────────────────
    try {
      const patterns = detectPatterns(chart);
      const relatedPatterns = patterns.filter(p =>
        p.palaces.includes(palaceName) || p.palaces.includes(palaceName + '宫')
      );
      for (const p of relatedPatterns.slice(0, 3)) {
        sections.push({
          title: `【${p.name}】`,
          content: p.description,
          source: p.source || '古籍引证',
        });
      }
    } catch {
      // 忽略
    }

    // ── 5. 流年/大限叠加分析 ─────────────────────
    if (topic === 'year' || topic === 'decade') {
      const dx = chart.daXians?.[chart.currentDaXianIndex];
      if (dx) {
        sections.push({
          title: `【当前${topic === 'year' ? '流年' : '大限'}】`,
          content: `大限：${dx.startAge}–${dx.endAge}岁（${dx.palaceName}宫）`,
        });
      }
    }

    // ── 6. 拼接成完整解读 ─────────────────────────
    const fullContent = sections
      .map(s => `${s.title}\n${s.content}`)
      .join('\n\n');

    // 截断到 maxLength
    const truncated = fullContent.length > maxLength
      ? fullContent.slice(0, maxLength) + '…'
      : fullContent;

    // ── 7. (可选) AI润色 — 复用现有的 /api/ai ─────
    let polished = truncated;
    if (options.aiPolish) {
      try {
        const aiRes = await fetch(new URL('/api/ai', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `请基于以下紫微斗数结构化解读，润色为通顺自然的中文分析，保留倪海夏体系原话与古籍引证。结构化解读：\n${truncated}`,
            userId,
          }),
        });
        if (aiRes.ok) {
          const data = await aiRes.json();
          polished = data.text || data.content || truncated;
        }
      } catch {
        // AI 失败时退回原文
        polished = truncated;
      }
    }

    return NextResponse.json({
      topic,
      sections,
      content: polished,
      length: polished.length,
      tookMs: Date.now() - startTime,
      chartToken: body.chartToken || null,
    });
  } catch (e: unknown) {
    console.error('analysis error:', e);
    return NextResponse.json(
      { error: '分析失败', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
