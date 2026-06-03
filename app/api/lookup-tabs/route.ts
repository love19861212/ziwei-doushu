/**
 * /api/lookup-tabs
 *
 * 紫微斗数知识库查表API — 对标Oracle站同名endpoint
 *
 * 接收 chart 对象，智能匹配命盘中的：
 *  - 14主星入12宫的论断
 *  - 24种双星同宫组合
 *  - 37种古典格局
 *  - 4种四化（基于流年天干）
 *
 * 返回结构化数据，前端用于：
 *  - 浮动详情卡（onStarClick）
 *  - 宫位解读（onPalaceClick）
 *  - 四化说明（onSiHuaBadgeClick）
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';
import { detectDoubleStars, getDoubleStarsInPalace } from '@/lib/ziwei/double-stars';
import { calcSanFang, formatSanFangForAI } from '@/lib/ziwei/sanfang';
import { getKnowledge } from '@/lib/seo/knowledge';
import type { TopicKey } from '@/lib/ziwei/db-analysis';
import oracleKb from '@/lib/ziwei/oracle_kb.json';

interface LookupRequest {
  chart: {
    palaces: Array<{
      name: string;
      branch: number;
      stem: number;
      isMingGong?: boolean;
      isShenGong?: boolean;
      stars: Array<{
        name: string;
        type: 'major' | 'minor' | 'lucky' | 'sha';
        siHua?: '禄' | '权' | '科' | '忌';
        brightness?: 'bright' | 'normal' | 'dim';
      }>;
    }>;
  };
  // 查询类型: 'star' | 'palace' | 'pattern' | 'sihua' | 'double' | 'all'
  type?: 'star' | 'palace' | 'pattern' | 'sihua' | 'double' | 'all';
  // 聚焦的星曜/宫位/格局名
  target?: string;
  // 流年天干索引（0-9）— 用于查流年四化
  yearStemIndex?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: LookupRequest = await req.json();
    const { chart, type = 'all', target, yearStemIndex } = body;

    if (!chart?.palaces) {
      return NextResponse.json({ error: '缺少chart数据' }, { status: 400 });
    }

    const result: Record<string, unknown> = {
      type,
      target: target || null,
      matches: {},
    };

    // 1. 命盘格局
    if (type === 'all' || type === 'pattern') {
      const fullChart = chart as any; // patterns库接受完整ZiweiChart
      try {
        const patterns = detectPatterns(fullChart);
        result.patterns = patterns.map(p => ({
          name: p.name,
          level: p.level,
          description: p.description,
          palaces: p.palaces,
          source: p.source || '',
        }));
      } catch {
        result.patterns = [];
      }
    }

    // 1.5 双星同宫 (24种) — 对标Oracle站重点
    if (type === 'all' || type === 'pattern' || type === 'double') {
      try {
        const doubleStars = detectDoubleStars(chart as any);
        result.doubleStars = doubleStars.map(d => ({
          name: d.name,
          short: d.short,
          level: d.level,
          nature: d.nature,
          dingdiao: d.dingdiao,
          description: d.description,
          yiju: d.yiju,
          chuchu: d.chuchu,
          palaces: d.palaces,
          inMingGong: d.inMingGong,
        }));
      } catch (e) {
        console.error('doubleStars detect error:', e);
        result.doubleStars = [];
      }
    }

    // 2. 命宫总览
    if (type === 'all') {
      try {
        result.mingGongSummary = getMingGongSummary(chart as any);
      } catch {
        // 忽略
      }
    }

    // 3. 星曜→宫位解读（target是主星名时）
    if ((type === 'star' || type === 'all') && target) {
      const starName = target;
      // 找出此星所在的宫位
      const palace = chart.palaces.find(p =>
        p.stars.some(s => s.name === starName && s.type === 'major')
      );
      if (palace) {
        const topic = mapPalaceToTopic(palace.name);
        // 优先查 Oracle 知识库（12 topic 完整数据）
        let oracleEntry = (oracleKb as any)[starName]?.[topic];
        // overview topic 在 Oracle 里没有数据，fallback 到 personality
        if (!oracleEntry && topic === 'overview') {
          oracleEntry = (oracleKb as any)[starName]?.['personality'];
        }
        const knowledge = getKnowledge(starName, topic);
        result.starKnowledge = {
          star: starName,
          palace: palace.name,
          palaceBranch: palace.branch,
          palaceStem: palace.stem,
          topic,
          source: oracleEntry ? 'oracle' : (knowledge.exists ? 'local' : 'none'),
          knowledge: oracleEntry ? {
            dingdiao: oracleEntry.dingdiao,
            lundian: oracleEntry.lundian,
            yiju: oracleEntry.yiju,
            chuchu: oracleEntry.chuchu,
            title: oracleEntry.title,
          } : knowledge.exists ? {
            dingdiao: knowledge.parsed.dingdiao,
            lundian: knowledge.parsed.lundian,
            yiju: knowledge.parsed.yiju,
            chuchu: knowledge.parsed.chuchu,
          } : null,
        };
      }
    }

    // 4. 宫位论断（target是宫名时）
    if ((type === 'palace' || type === 'all') && target) {
      const palace = chart.palaces.find(p => p.name === target);
      if (palace) {
        // 双星同宫（位于此宫）
        try {
          result.doubleStarsInPalace = getDoubleStarsInPalace(chart as any, target).map(d => ({
            name: d.name,
            short: d.short,
            level: d.level,
            dingdiao: d.dingdiao,
            description: d.description,
          }));
        } catch {
          result.doubleStarsInPalace = [];
        }
        // 宫内的主星
        const majorStars = palace.stars.filter(s => s.type === 'major');
        // 三方四正计算
        try {
          const sf = calcSanFang(chart as any, palace.branch);
          if (sf) {
            result.sanFang = {
              origin: sf.origin.name,
              duiGong: sf.duiGong?.name || null,
              sanHe: sf.sanHe.map(p => p.name),
              jiaGong: { prev: sf.jiaGong.prev?.name || null, next: sf.jiaGong.next?.name || null },
              majorStars: sf.majorStars.map(m => ({ star: m.star.name, palace: m.palace.name, from: m.fromPalace })),
              luckyStars: sf.luckyStars.map(m => ({ star: m.star.name, palace: m.palace.name, from: m.fromPalace })),
              shaStars: sf.shaStars.map(m => ({ star: m.star.name, palace: m.palace.name, from: m.fromPalace })),
              summary: sf.summary,
              aiFormat: formatSanFangForAI(sf),
            };
          }
        } catch (e) {
          console.error('sanfang error:', e);
        }
        const starKnowledge = majorStars.map(star => {
          const topic = mapPalaceToTopic(palace.name);
          let oracleEntry = (oracleKb as any)[star.name]?.[topic];
          if (!oracleEntry && topic === 'overview') {
            oracleEntry = (oracleKb as any)[star.name]?.['personality'];
          }
          const k = getKnowledge(star.name, topic);
          return {
            star: star.name,
            topic,
            source: oracleEntry ? 'oracle' : (k.exists ? 'local' : 'none'),
            dingdiao: oracleEntry?.dingdiao || k.parsed.dingdiao,
            lundian: oracleEntry?.lundian || k.parsed.lundian,
          };
        });
        result.palaceKnowledge = {
          palace: palace.name,
          branch: palace.branch,
          stem: palace.stem,
          isMingGong: palace.isMingGong,
          isShenGong: palace.isShenGong,
          majorStars: palace.stars.filter(s => s.type === 'major').map(s => ({
            name: s.name,
            siHua: s.siHua,
            brightness: s.brightness,
          })),
          starKnowledge,
        };
      }
    }

    // 5. 四化查询
    if ((type === 'sihua' || type === 'all') && yearStemIndex !== undefined) {
      const { SI_HUA_TABLE, STEMS } = await import('@/lib/ziwei/constants');
      const stars = SI_HUA_TABLE[yearStemIndex];
      if (stars) {
        result.siHua = {
          stem: STEMS[yearStemIndex],
          yearStemIndex,
          禄: stars[0],
          权: stars[1],
          科: stars[2],
          忌: stars[3],
          // 找出本命盘中的四化星所在的宫
          palaces: stars.map((starName) => {
            const palace = chart.palaces.find(p =>
              p.stars.some(s => s.name === starName)
            );
            return {
              star: starName,
              palace: palace?.name || null,
              branch: palace?.branch,
            };
          }),
        };
      }
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error('lookup-tabs error:', e);
    return NextResponse.json(
      { error: '查询失败', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

/** 宫位名 → 知识库topic映射 */
function mapPalaceToTopic(palaceName: string): TopicKey {
  const map: Record<string, TopicKey> = {
    '命宫': 'overview',
    '兄弟': 'family',
    '夫妻': 'love',
    '子女': 'children',
    '财帛': 'wealth',
    '疾厄': 'health',
    '迁移': 'move',
    '交友': 'friends',  // 奴仆/交友
    '奴仆': 'friends',
    '仆役': 'friends',
    '官禄': 'career',
    '事业': 'career',
    '田宅': 'home',
    '福德': 'spirit',
    '父母': 'parents',
  };
  return map[palaceName] || 'overview';
}
