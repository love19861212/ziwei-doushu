import { NextRequest, NextResponse } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { BRANCHES } from '@/lib/ziwei/constants';

const MINIMAX_API_KEY = 'sk-cp-OTEMgOGBgD8nn6BKzQlweLUavd-mZlpnbmBvDdGA85po5GiFtL_af11Ed29ygpY5uR2slEDCfuI5kYqZVQvIAAGJnQBxgAGyUHNSOOwDTRDslH44bu94Tc8';
const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';
const MODEL = 'MiniMax-M2.7';

function compressChartForFamous(chart: ZiweiChart, label: string): string {
  const { birthInfo, mingGongBranch, shenGongBranch, wuxingJuName, palaces, daXians, currentAge, currentDaXianIndex } = chart;
  const genderText = birthInfo.gender === 'male' ? '男' : '女';

  const mingGong = palaces?.find(p => p.branch === mingGongBranch);
  const shenGong = palaces?.find(p => p.branch === shenGongBranch);

  const getStarsDesc = (p: typeof mingGong) => {
    if (!p) return '(空宫)';
    const major = p.stars?.filter(s => s.type === 'major').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '';
    const lucky = p.stars?.filter(s => s.type === 'lucky').map(s => s.name).join('、') ?? '';
    const sha = p.stars?.filter(s => s.type === 'sha').map(s => s.name).join('、') ?? '';
    return [major, lucky, sha].filter(Boolean).join('；') || '(空宫)';
  };

  const siHuaList = (palaces ?? []).flatMap(p =>
    (p.stars ?? []).filter(s => s.siHua).map(s => `${s.name}化${s.siHua}(${p.name})`)
  ).join('、');

  const dxIdx = currentDaXianIndex ?? 0;
  const dx = (daXians ?? [])[dxIdx];
  const daXianDesc = dx ? `${dx.startAge}-${dx.endAge}岁${dx.palaceName}` : '暂无';

  let desc = `【${label}】${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日${BRANCHES[birthInfo.hour] ?? birthInfo.hour}时，${genderText}命，五行局${wuxingJuName}，当前${currentAge}岁，大限在${daXianDesc}。\n`;
  desc += `命宫(${BRANCHES[mingGongBranch] ?? mingGongBranch}宫)：${getStarsDesc(mingGong)}\n`;
  desc += `身宫(${BRANCHES[shenGongBranch] ?? shenGongBranch}宫)：${getStarsDesc(shenGong)}\n`;

  const fuqiGong = palaces?.find(p => p.name === '夫妻宫');
  const fudeGong = palaces?.find(p => p.name === '福德宫');
  const guanluGong = palaces?.find(p => p.name === '事业宫');
  const tianGong = palaces?.find(p => p.name === '田宅宫');

  if (fuqiGong) desc += `夫妻宫：${getStarsDesc(fuqiGong)}\n`;
  if (fudeGong) desc += `福德宫：${getStarsDesc(fudeGong)}\n`;
  if (guanluGong) desc += `事业宫：${getStarsDesc(guanluGong)}\n`;
  if (tianGong) desc += `田宅宫：${getStarsDesc(tianGong)}\n`;
  if (siHuaList) desc += `四化星：${siHuaList}\n`;

  desc += '\n十二宫总览：\n';
  for (const p of palaces ?? []) {
    desc += `${BRANCHES[p.branch] ?? p.branch}-${p.name}：${getStarsDesc(p)}\n`;
  }
  return desc;
}

const SYSTEM_PROMPT = `你是倪海厦紫微斗数名人命盘分析师，严格按照倪师《天纪》和《紫微斗数全书》的理论对历史名人命盘进行学术解读。

【核心原则】
1. 以倪师理论为准绳：命宫为主，三方四正为用，福德宫与夫妻宫不可忽视
2. 口吻专业中性：历史人物命盘仅供学术研究，不做现实对应
3. 分析结合历史背景：命盘特征与人物生平互相验证
4. 格式为学术风格解读，每位名人需分析：命宫格局、事业、感情、健康、命运曲线

【输出格式】（Markdown结构化）
## 命盘概览
一句话命盘总结（格局亮点+历史印证）

## 命宫解读
主星+四化分析，命宫格局定调

## 事业成就
官禄宫与命宫三方四正综合判断，印证历史贡献

## 感情婚姻
夫妻宫+福德宫综合分析，对照历史记载的婚姻情况

## 命运曲线
大运走势分析，解释人生关键转折点

## 学术点评
命盘特征与历史事件互相验证的亮点（1-2个），以及为何此命盘适合研究

【严禁】
- 不写"此命大凶/必离婚/孤独终老"等极端断语
- 不与现实人物做直接对应（仅供学术研究）
- 不使用占卜语气，使用学术分析语气`;

export async function POST(req: NextRequest) {
  try {
    const { chart, personName, personDesc, notable } = await req.json() as {
      chart: ZiweiChart;
      personName: string;
      personDesc: string;
      notable: string;
    };

    if (!chart) {
      return NextResponse.json({ error: 'Missing chart' }, { status: 400 });
    }

    const chartDesc = compressChartForFamous(chart, personName);

    const userPrompt = `请分析以下历史名人命盘：

${chartDesc}

【人物背景】
姓名：${personName}
身份：${personDesc}
命盘亮点提示：${notable}

请按上述格式输出完整的名人命盘解读。`;

    // Use streaming SSE - matching heming API pattern exactly
    const aiResponse = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 16000,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ error: `AI服务错误: ${aiResponse.status}` }, { status: 502 });
    }

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
                const text = data.choices?.[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text } })}\n`));
                }
              } catch {}
            }
          }
        } catch {
          // read error
        } finally {
          try { controller.close(); } catch {}
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}