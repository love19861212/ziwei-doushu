import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

const MINIMAX_API_KEY = 'sk-cp-OTEMgOGBgD8nn6BKzQlweLUavd-mZlpnbmBvDdGA85po5GiFtL_af11Ed29ygpY5uR2slEDCfuI5kYqZVQvIAAGJnQBxgAGyUHNSOOwDTRDslH44bu94Tc8';
const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';
const MODEL = 'MiniMax-M2.7';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function compressChart(chart: ZiweiChart): string {
  const { birthInfo, lunarInfo, mingGongBranch, shenGongBranch, wuxingJuName, palaces, daXians, currentAge, currentDaXianIndex } = chart;
  const genderText = birthInfo.gender === 'male' ? '男' : '女';
  const mingGong = palaces?.[mingGongBranch];
  const shenGong = palaces?.[shenGongBranch];
  const mingStars = mingGong?.stars?.filter(s => s.type === 'major').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '(空宫)';
  const shenStars = shenGong?.stars?.filter(s => s.type === 'major').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '(空宫)';

  const palaceSummaries = (palaces ?? []).map((p, idx) => {
    const majorStars = p.stars?.filter(s => s.type === 'major').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '';
    const luckyStars = p.stars?.filter(s => s.type === 'lucky').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '';
    const shaStars = p.stars?.filter(s => s.type === 'sha').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '';
    const starDesc = [majorStars, luckyStars, shaStars].filter(Boolean).join('；');
    return `${BRANCHES[idx] ?? idx}-${p.name}：${starDesc || '(空宫)'}`;
  }).join('\n');

  const siHuaStars = (palaces ?? []).flatMap(p =>
    (p.stars ?? []).filter(s => s.siHua).map(s => `${s.name}化${s.siHua}(${p.name})`)
  ).join('、');

  const dxIdx = currentDaXianIndex ?? 0;
  const dxSlice = (daXians ?? []).slice(Math.max(0, dxIdx), dxIdx + 2);
  const daXianDesc = dxSlice.map(dx => `${dx.startAge}-${dx.endAge}岁${dx.palaceName}`).join(' → ') || '暂无';

  return `出生信息：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日${BRANCHES[birthInfo.hour] ?? birthInfo.hour}时，${genderText}命。
农历：${lunarInfo.lunarYear}年${STEMS[lunarInfo.yearStem] ?? '?'}${BRANCHES[lunarInfo.yearBranch] ?? '?'}年${lunarInfo.lunarMonth}月${lunarInfo.lunarDay}日。
五行局：${wuxingJuName}。
命宫：${BRANCHES[mingGongBranch] ?? mingGongBranch}宫，主星：${mingStars}。
身宫：${BRANCHES[shenGongBranch] ?? shenGongBranch}宫，主星：${shenStars}。
当前年龄：${currentAge}岁，当前大限：${daXianDesc}。
${siHuaStars ? `命宫四化星：${siHuaStars}` : ''}

十二宫（地支-宫名-主星/吉星/煞星）：
${palaceSummaries}`;
}

const SYSTEM_PROMPT = `你是倪海厦紫微斗数体系的AI命理分析师，严格按照倪师《天纪》和《紫微斗数全书》的理论进行解读。

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

const TOPIC_PROMPTS: Record<string, string> = {
  overview: '请深度分析这个命盘的命格特点、格局层次、性格核心特质。命盘数据中已包含命宫四化星信息（四化如"贪狼化禄""廉贞化忌"等），请结合四化星在何宫何位进行综合分析。',
  love: '请深度分析感情婚姻运，重点看夫妻宫、迁移宫、福德宫，结合星曜组合与四化星落宫综合判断。',
  career: '请深度分析事业运，重点看事业宫、命宫、财帛宫。',
  wealth: '请深度分析财运，重点看财帛宫、田宅宫、福德宫。',
  health: '请分析健康运势，重点看疾厄宫、命宫。',
  personality: '请深度解析性格特质，及其对人生各方面的影响。',
};

export async function POST(req: NextRequest) {
  try {
    const { chart, messages, topic } = await req.json();

    if (!chart) {
      return NextResponse.json({ error: '缺少命盘数据' }, { status: 400 });
    }

    const chartText = compressChart(chart);
    const userPrompt = TOPIC_PROMPTS[topic] || '请全面分析这个命盘。命盘数据中已包含命宫四化星信息，请结合四化星落宫综合分析，不要说"四化未提供"。';

    // Build conversation history for context
    const systemMsg = { role: 'system' as const, content: SYSTEM_PROMPT };
    const chartMsg = { role: 'user' as const, content: `这是我命盘的基础信息，请熟记并在后续分析中结合参考：\n\n${chartText}` };

    // Build recent conversation context (last 6 messages to avoid token overflow)
    const recentHistory = (messages ?? []).slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    const fullPrompt = `${chartText}\n\n${userPrompt}`;

    // Stream response from MiniMax
    const aiResponse = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [systemMsg, chartMsg, ...recentHistory, { role: 'user', content: userPrompt }],
        temperature: 0.7,
        max_tokens: 16000,
        stream: true,
        // 关闭 MiniMax M2.7 思考过程
        reasoning_split: false,
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      return NextResponse.json({ error: `AI服务错误: ${aiResponse.status}` }, { status: 502 });
    }

    // Transform MiniMax SSE → Next.js streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = aiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n'));
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                // 过滤 reasoning_content (MiniMax M2.7 思考过程)
                const text = data.choices?.[0]?.delta?.content;
                if (text) {
                  const eventData = JSON.stringify({ delta: { text } });
                  controller.enqueue(encoder.encode(`data: ${eventData}\n`));
                }
                // 不发送 reasoning_content (思考过程) 和 reasoning_detail
              } catch {}
            }
          }
        } catch {
          // stream closed
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e: unknown) {
    console.error('interpret error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '服务器错误' },
      { status: 500 }
    );
  }
}