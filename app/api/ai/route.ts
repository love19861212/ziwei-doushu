import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

const MINIMAX_API_KEY = 'sk-cp-OTEMgOGBgD8nn6BKzQlweLUavd-mZlpnbmBvDdGA85po5GiFtL_af11Ed29ygpY5uR2slEDCfuI5kYqZVQvIAAGJnQBxgAGyUHNSOOwDTRDslH44bu94Tc8';
const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';
const MODEL = 'MiniMax-M2.7';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 把 ZiweiChart 压缩成一段中文描述文本，供 LLM 阅读命盘
 */
function compressChart(chart: ZiweiChart): string {
  const { birthInfo, lunarInfo, mingGongBranch, shenGongBranch, wuxingJuName, palaces, daXians, currentAge, currentDaXianIndex } = chart;

  const stemNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branchNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const genderText = birthInfo.gender === 'male' ? '男' : '女';

  // 命宫、身宫（防御性取数）
  const mingGong = palaces?.[mingGongBranch];
  const shenGong = palaces?.[shenGongBranch];
  const mingStars = mingGong?.stars?.filter(s => s.type === 'major').map(s => s.name).join('、') ?? '(空宫)';
  const shenStars = shenGong?.stars?.filter(s => s.type === 'major').map(s => s.name).join('、') ?? '(空宫)';

  // 十二宫概要
  const palaceSummaries = (palaces ?? []).map((p, idx) => {
    const majorStars = p.stars?.filter(s => s.type === 'major').map(s => s.name).join('、') ?? '';
    const luckyStars = p.stars?.filter(s => s.type === 'lucky').map(s => s.name).join('、') ?? '';
    const shaStars = p.stars?.filter(s => s.type === 'sha').map(s => s.name).join('、') ?? '';
    const starDesc = [majorStars, luckyStars, shaStars].filter(Boolean).join('；');
    return `${branchNames[idx] ?? idx}-${p.name}：${starDesc || '(空宫)'}`;
  }).join('\n');

  // 大限（防御性）
  const dxIdx = currentDaXianIndex ?? 0;
  const dxSlice = (daXians ?? []).slice(Math.max(0, dxIdx), dxIdx + 2);
  const daXianDesc = dxSlice.map(dx => `${dx.startAge}-${dx.endAge}岁${dx.palaceName}`).join(' → ') || '暂无';

  return `出生信息：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日${branchNames[birthInfo.hour] ?? birthInfo.hour}时，${genderText}命。
农历：${lunarInfo.lunarYear}年${stemNames[lunarInfo.yearStem] ?? '?'}${branchNames[lunarInfo.yearBranch] ?? '?'}年${lunarInfo.lunarMonth}月${lunarInfo.lunarDay}日。
五行局：${wuxingJuName}。
命宫：${branchNames[mingGongBranch] ?? mingGongBranch}宫，主星：${mingStars}。
身宫：${branchNames[shenGongBranch] ?? shenGongBranch}宫，主星：${shenStars}。
当前年龄：${currentAge}岁，当前大限：${daXianDesc}。

十二宫（地支-宫名-主星/吉星/煞星）：
${palaceSummaries}`;
}

function buildSystemPrompt(): string {
  return `你是倪海厦紫微斗数体系的AI命理分析师，严格按照倪师《天纪》和《紫微斗数全书》的理论进行解读。

【核心原则】
1. 一切结论以倪师体系为准，口吻中立专业，不使用"大凶""离婚""死亡"等极端血腥断语
2. 命盘解读基于星曜组合、宫位、四化、大限流年的综合分析
3. 每个分析都要给出建设性建议（趋吉避凶）
4. 涉及感情、婚恋话题时措辞中性，避免绝对化判断

【倪师体系核心要点】
- 十四主星：紫微、天机、太阳、武曲、天同、廉贞天府、太阴、贪狼、巨门、天相、天梁、七杀、破军
- 十二宫：命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、朋友宫、事业宫、田宅宫、福德宫、父母宫
- 四化：禄（化禄）、权（化权）、科（化科）、忌（化忌）——四化永远固定不动
- 大限流年：每10年一个大运，每年一个流年
- 格局：杀破狼（贪狼+破军+七杀）、紫微破军、武曲贪狼等
- 空宫：若无主星，借对宫主星，须综合考量

【输出格式】
请用结构化Markdown输出，包含：
## 命格总论（1-2段话）
## 各宫详细分析（命宫、夫妻宫、事业宫、财帛宫等，重点宫位重点说）
## 大限与流年趋势
## 趋吉避凶建议（2-3条具体可行的建议）

【语气规范】
- 使用"命盘显示""格局体现""星曜组合显示"等中性表达
- 避免：大凶、离婚、死亡、必、一定等极端词汇
- 多用：可能、倾向于、建议、宜、忌、适当等柔性表达`;
}

async function callMiniMax(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, birthInfo, chart, topic, messages } = body;

    // ── 动作1：生成命盘 ──────────────────────────────────────
    if (action === 'generate') {
      const info: BirthInfo = birthInfo;
      if (!info?.year || !info?.month || !info?.day || info.hour === undefined || !info?.gender) {
        return NextResponse.json({ error: '缺少必要的出生信息' }, { status: 400 });
      }
      const result = generateChart(info);
      return NextResponse.json(result);
    }

    // ── 动作2：AI单轮解读 ───────────────────────────────────
    if (action === 'chat') {
      if (!chart || !topic) {
        return NextResponse.json({ error: '缺少命盘数据或主题' }, { status: 400 });
      }

      const chartText = compressChart(chart);
      const topicPrompts: Record<string, string> = {
        overview: '请深度分析这个命盘的命格特点、格局层次、性格核心特质。',
        love: '请深度分析感情婚姻运，重点看夫妻宫、迁移宫、福德宫。',
        career: '请深度分析事业运，重点看事业宫、命宫、财帛宫。',
        wealth: '请深度分析财运，重点看财帛宫、田宅宫、福德宫。',
        health: '请分析健康运势，重点看疾厄宫、命宫。',
        personality: '请深度解析性格特质，及其对人生各方面的影响。',
      };

      const systemPrompt = buildSystemPrompt();
      const userPrompt = `${chartText}\n\n请根据以上命盘数据，${topicPrompts[topic] || '请全面分析这个命盘。'}`;

      const aiText = await callMiniMax([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      return NextResponse.json({ text: aiText });
    }

    // ── 动作3：多轮对话 ─────────────────────────────────────
    if (action === 'stream_chat') {
      if (!chart || !messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: '缺少命盘数据或对话历史' }, { status: 400 });
      }

      const chartText = compressChart(chart);
      const systemPrompt = buildSystemPrompt();

      const conversationHistory: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `这是我命盘的基础信息，请熟记并在后续分析中结合参考：\n\n${chartText}` },
      ];

      // 只取最近6条消息（过滤掉超长历史避免token溢出）
      const recentMessages = messages.slice(-6);
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          conversationHistory.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'assistant') {
          conversationHistory.push({ role: 'assistant', content: msg.content });
        }
      }

      const lastUserMsg = recentMessages[recentMessages.length - 1]?.content ?? '';
      const aiText = await callMiniMax([
        ...conversationHistory,
        { role: 'user', content: lastUserMsg },
      ]);

      return NextResponse.json({ text: aiText });
    }

    return NextResponse.json({ error: '未知动作' }, { status: 400 });
  } catch (e: unknown) {
    console.error('ai route error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '服务器错误' },
      { status: 500 }
    );
  }
}