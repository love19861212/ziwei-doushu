/**
 * /api/report
 *
 * 紫微斗数全盘报告生成API — 对标Oracle站同名endpoint
 *
 * Oracle 站是付费功能（专业版），免费用户走 402 错误。
 * 我们做简化版:
 *  - FREE 用户: 返回 402 + 报告概要（不完整）
 *  - PRO 用户: 返回完整 Markdown 报告
 *
 * 报告内容:
 *  1. 先天命格总论（命宫 + 主星 + 格局）
 *  2. 12宫分论（各宫主星 + 庙旺 + 吉煞）
 *  3. 大限详解（12 运 × 起止年龄 × 主星 × 四化）
 *  4. 双星同宫（命盘中的特殊组合）
 *  5. 流年展望（当前年份）
 *
 * 输入:
 *  { chart, chartToken?, userId?, options: { pro?: boolean } }
 *
 * 状态码:
 *  - 200: 成功（PRO）
 *  - 402: 需要付费（FREE 用户，body 包含报告概要）
 *  - 401: 缺少chart
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';
import { detectDoubleStars } from '@/lib/ziwei/double-stars';
import { calcSanFang, formatSanFangForAI } from '@/lib/ziwei/sanfang';
import oracleKb from '@/lib/ziwei/oracle_kb.json';
import { SI_HUA_TABLE, STEMS, BRANCHES } from '@/lib/ziwei/constants';
import { getKnowledge } from '@/lib/seo/knowledge';
import type { TopicKey } from '@/lib/ziwei/db-analysis';

interface ReportRequest {
  chart: any;
  chartToken?: string;
  userId?: string;
  options?: {
    pro?: boolean;   // 模拟 PRO 用户
  };
}

// 主题→宫位映射
const TOPIC_PALACE: Record<string, string> = {
  overall: '命宫',
  career: '官禄',
  love: '夫妻',
  wealth: '财帛',
  health: '疾厄',
  family: '兄弟',
  year: '流年',
  decade: '大限',
};

const TOPIC_KB: Record<string, TopicKey> = {
  overall: 'overview',
  career: 'career',
  love: 'love',
  wealth: 'wealth',
  health: 'health',
  family: 'family',
};

function buildReport(chart: any, isPro: boolean): string {
  const sections: string[] = [];
  const ming = chart.palaces.find((p: any) => p.branch === chart.mingGongBranch);

  // 1. 报告封面
  sections.push(`# 紫微斗数全盘报告`);
  sections.push(``);
  sections.push(`**姓名**: ${chart.birthInfo?.name || '未填'}`);
  // 2026-06-11 改造: 跟文墨天机对齐, 报告同时显示钟表/真太阳时 + 各自时支
  const clockHM = chart.birthInfo?.clockHour !== undefined
    ? `${String(chart.birthInfo.clockHour).padStart(2,'0')}:${String(chart.birthInfo.minute ?? 0).padStart(2,'0')}`
    : '';
  const BRANCH_CN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const trueSolarHM = chart.birthInfo?.trueSolarHM || chart.solarTime || '未校准';
  // 钟表时支 (逆推 24h -> 12时辰)
  function clockToShiChenIdx(h: number): number {
    if (h === 23 || h === 0) return 0;
    if (h === 1 || h === 2) return 1;
    return Math.floor((h + 1) / 2) % 12;
  }
  const clockBranchIdx = chart.birthInfo?.clockHour !== undefined
    ? clockToShiChenIdx(chart.birthInfo.clockHour)
    : chart.birthInfo?.hour ?? 0;
  const trueSolarBranchIdx = chart.birthInfo?.hour ?? 0;  // BirthInfo.hour 已是真太阳时 (6月11后)
  const clockBranchCN = BRANCH_CN[clockBranchIdx];
  const trueSolarBranchCN = BRANCH_CN[trueSolarBranchIdx];
  const crossBranch = clockBranchIdx !== trueSolarBranchIdx;

  const clockText = clockHM ? `${clockHM}（${clockBranchCN}时）` : `${clockBranchCN}时`;
  sections.push(`**出生**: ${chart.birthInfo?.year}年${chart.birthInfo?.month}月${chart.birthInfo?.day}日 ${clockText}`);
  sections.push(`**性别**: ${chart.birthInfo?.gender === 'male' ? '男' : '女'}`);
  if (chart.birthInfo?.city) sections.push(`**出生地**: ${chart.birthInfo.city}`);
  sections.push(`**真太阳时**: ${trueSolarHM}（${trueSolarBranchCN}时）${crossBranch ? '⚠️ 与钟表时跨时辰' : ''}`);
  sections.push(`**排盘口径**: 真太阳时 (倪海夏《天纪》+ 文墨天机体系)`);
  // 2026-06-13 加: 报告封面 P2 字段 — 真太阳时 (参考) + 经度 (跟文墨天机报告对齐)
  const tsHM = chart.birthInfo?.trueSolarHM;
  if (tsHM) {
    const [tsh, tsmin] = tsHM.split(':');
    sections.push(`**真太阳时 (参考)**: ${tsh}时${tsmin}分`);
  }
  if (chart.birthInfo?.longitude !== undefined) {
    sections.push(`**经度**: ${chart.birthInfo.longitude}°`);
  }
  sections.push(`**命宫地支**: ${BRANCHES[chart.mingGongBranch] || '?'}`);
  sections.push(``);

  // 2. 命盘总论
  sections.push(`## 一、命盘总论`);
  const summary = getMingGongSummary(chart);
  if (summary?.stars?.length) {
    sections.push(`**命宫主星**: ${summary.stars.join('、')}`);
  }
  if (summary?.keywords?.length) {
    sections.push(`**性格关键词**: ${summary.keywords.join('、')}`);
  }
  if (summary?.nature) {
    sections.push(`**命格性质**: ${summary.nature}`);
  }
  sections.push(``);

  // 3. 命宫详细解读
  if (ming) {
    const majorStars = ming.stars?.filter((s: any) => s.type === 'major') || [];
    if (majorStars.length > 0) {
      const star = majorStars[0];
      const topic = 'overview';
      const lookupTopic = 'personality';
      const oracleEntry = (oracleKb as any)[star.name]?.[lookupTopic];
      if (oracleEntry) {
        sections.push(`## 二、命宫详解：${star.name}在命宫`);
        sections.push(``);
        sections.push(`### 一句话定调`);
        sections.push(oracleEntry.dingdiao);
        sections.push(``);
        sections.push(`### 核心论断`);
        sections.push(oracleEntry.lundian);
        sections.push(``);
        if (isPro && oracleEntry.yiju) {
          sections.push(`### 命盘依据`);
          sections.push(oracleEntry.yiju);
          sections.push(``);
        }
        if (isPro && oracleEntry.chuchu) {
          sections.push(`### 经典出处`);
          sections.push(oracleEntry.chuchu);
          sections.push(``);
        }
      }
    }
  }

  // 4. 12 宫位概要（PRO 才看完整，FREE 只看宫名+主星）
  sections.push(`## 三、十二宫概要`);
  for (const palace of chart.palaces) {
    const majorStars = palace.stars?.filter((s: any) => s.type === 'major') || [];
    if (majorStars.length === 0) {
      sections.push(`- **${palace.name}**（${BRANCHES[palace.branch]}宫）: 空宫`);
    } else {
      sections.push(`- **${palace.name}**（${BRANCHES[palace.branch]}宫）: ${majorStars.map((s: any) => s.name).join('、')}`);
    }
  }
  sections.push(``);

  // 5. 大限详解 (PRO)
  if (isPro && chart.daXians?.length) {
    sections.push(`## 四、大限详解`);
    sections.push(``);
    for (const dx of chart.daXians) {
      const siHuaStars = dx.stemIndex !== undefined ? SI_HUA_TABLE[dx.stemIndex] : null;
      sections.push(`### ${dx.startAge}–${dx.endAge}岁 · ${dx.palaceName}宫（${dx.stemName || '?'}干）`);
      if (siHuaStars) {
        sections.push(`四化：化禄${siHuaStars[0]}、化权${siHuaStars[1]}、化科${siHuaStars[2]}、化忌${siHuaStars[3]}`);
      }
      sections.push(``);
    }
  }

  // 6. 双星同宫 (PRO)
  if (isPro) {
    const doubleStars = detectDoubleStars(chart);
    if (doubleStars.length > 0) {
      sections.push(`## 五、双星同宫格局`);
      sections.push(``);
      for (const ds of doubleStars) {
        sections.push(`### ${ds.name}（${ds.level}）`);
        sections.push(`**位置**: ${ds.palaces.join('、')}`);
        sections.push(`**性质**: ${ds.nature}`);
        sections.push(`**定调**: ${ds.dingdiao}`);
        sections.push(``);
      }
    }
  }

  // 7. 流年 (PRO)
  if (isPro) {
    sections.push(`## 六、本年度展望`);
    sections.push(`当前年份: ${new Date().getFullYear()}`);
    const currentYearStem = STEMS[((new Date().getFullYear() - 4) % 10 + 10) % 10];
    sections.push(`流年天干: ${currentYearStem}`);
    const yearSiHua = SI_HUA_TABLE[((new Date().getFullYear() - 4) % 10 + 10) % 10];
    if (yearSiHua) {
      sections.push(`流年四化: 化禄${yearSiHua[0]}、化权${yearSiHua[1]}、化科${yearSiHua[2]}、化忌${yearSiHua[3]}`);
    }
    sections.push(``);
  }

  // 8. 签名
  sections.push(``);
  sections.push(`---`);
  sections.push(`*本报告基于倪海夏《天纪》体系 + 《紫微斗数全书》《骨髓赋》《全集》等古籍*`);
  if (!isPro) {
    sections.push(``);
    sections.push(`⚠️ **本报告为基础版**，完整版（含大限详解 / 双星同宫 / 流年展望）请升级到专业版。`);
  }
  return sections.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body: ReportRequest = await req.json();
    const { chart, options = {} } = body;

    if (!chart?.palaces) {
      return NextResponse.json({ error: '缺少chart数据' }, { status: 401 });
    }

    const isPro = options.pro === true;  // 简化版: 用 options.pro 模拟 PRO

    if (!isPro) {
      // FREE 用户: 402 + 报告概要
      const summary = buildReport(chart, false);
      return NextResponse.json(
        {
          error: '全盘报告为专业版专属，请升级后查看',
          upgradeUrl: '/subscription',
          preview: summary.substring(0, 800) + '...\n\n⚠️ 完整版需升级专业版。',
          fullReportLength: summary.length,
          features: [
            '先天命格总论 (含经典出处)',
            '命宫详解 (含命盘依据)',
            '12 宫位概要',
            '✅ PRO: 大限详解 (12 运 × 主星 × 四化)',
            '✅ PRO: 双星同宫格局 (24 种)',
            '✅ PRO: 本年度流年展望',
            '✅ PRO: PDF/HTML 下载',
          ],
        },
        { status: 402 }
      );
    }

    // PRO 用户
    const report = buildReport(chart, true);
    return NextResponse.json({
      report,
      length: report.length,
      tookMs: 0,
      isPro: true,
      format: 'markdown',
    });
  } catch (e: unknown) {
    console.error('report error:', e);
    return NextResponse.json(
      { error: '报告生成失败', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: '/api/report',
    description: '全盘报告生成API',
    methods: ['POST'],
    params: { chart: 'ZiweiChart', options: { pro: 'boolean' } },
    statusCodes: {
      200: '成功 (PRO)',
      402: '需要付费升级 (FREE)',
      401: '缺少chart',
    },
  });
}
