import { NextRequest, NextResponse } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import {
  STAR_IN_FUQI_GU,
  SIHUA_IN_FUQI_GU,
  HEMING_METHODOLOGY,
  MARRIAGE_STARS_BRIEF,
  HEMING_SCORE_CRITERIA,
} from '@/lib/ziwei/heming-knowledge';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';

const MINIMAX_API_KEY = 'sk-cp-OTEMgOGBgD8nn6BKzQlweLUavd-mZlpnbmBvDdGA85po5GiFtL_af11Ed29ygpY5uR2slEDCfuI5kYqZVQvIAAGJnQBxgAGyUHNSOOwDTRDslH44bu94Tc8';
const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';
const MODEL = 'MiniMax-M2.7';

function compressChartForHeming(chart: ZiweiChart, label: string): string {
  const { birthInfo, lunarInfo, mingGongBranch, shenGongBranch, wuxingJuName, palaces, daXians, currentAge, currentDaXianIndex } = chart;
  const genderText = birthInfo.gender === 'male' ? '男' : '女';

  const mingGong = palaces?.[mingGongBranch];
  const shenGong = palaces?.[shenGongBranch];
  const fuqiGong = palaces?.find(p => p.name === '夫妻宫');
  const fudeGong = palaces?.find(p => p.name === '福德宫');
  const guanluGong = palaces?.find(p => p.name === '事业宫');

  const getStarsDesc = (p: typeof mingGong) => {
    if (!p) return '(空宫)';
    const major = p.stars?.filter(s => s.type === 'major').map(s => s.name + (s.siHua ? `(${s.siHua})` : '')).join('、') ?? '';
    const lucky = p.stars?.filter(s => s.type === 'lucky').map(s => s.name).join('、') ?? '';
    const sha = p.stars?.filter(s => s.type === 'sha').map(s => s.name).join('、') ?? '';
    return [major, lucky, sha].filter(Boolean).join('；') || '(空宫)';
  };

  const fuqiStars = fuqiGong ? getStarsDesc(fuqiGong) : '(空宫)';
  const fudeStars = fudeGong ? getStarsDesc(fudeGong) : '(空宫)';

  // 命宫四化
  const siHuaList = (palaces ?? []).flatMap(p =>
    (p.stars ?? []).filter(s => s.siHua).map(s => `${s.name}化${s.siHua}(${p.name})`)
  ).join('、');

  // 夫妻宫四化单独标注
  const fuqiSihua = (fuqiGong?.stars ?? []).filter(s => s.siHua).map(s => `${s.name}化${s.siHua}`).join('、');

  const dxIdx = currentDaXianIndex ?? 0;
  const dx = (daXians ?? [])[dxIdx];
  const daXianDesc = dx ? `${dx.startAge}-${dx.endAge}岁${dx.palaceName}` : '暂无';

  let desc = `【${label}】${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日${BRANCHES[birthInfo.hour] ?? birthInfo.hour}时，${genderText}命，五行局${wuxingJuName}，当前${currentAge}岁，大限在${daXianDesc}。\n`;
  desc += `命宫(${BRANCHES[mingGongBranch] ?? mingGongBranch}宫)：${getStarsDesc(mingGong)}\n`;
  desc += `身宫(${BRANCHES[shenGongBranch] ?? shenGongBranch}宫)：${getStarsDesc(shenGong)}\n`;
  desc += `夫妻宫：${fuqiStars}${fuqiSihua ? `（四化：${fuqiSihua}）` : ''}\n`;
  desc += `福德宫：${fudeStars}\n`;
  if (guanluGong) desc += `事业宫：${getStarsDesc(guanluGong)}\n`;
  if (siHuaList) desc += `命宫四化：${siHuaList}\n`;
  desc += '\n十二宫总览：\n';
  for (const p of palaces ?? []) {
    desc += `${BRANCHES[p.branch] ?? p.branch}-${p.name}：${getStarsDesc(p)}\n`;
  }
  return desc;
}

const SYSTEM_PROMPT = `你是倪海厦紫微斗数合盘分析师，严格按照倪师《天纪》和《紫微斗数全书》的理论进行合盘分析。

【核心原则】
1. 以倪师合盘方法论为准：必须同时看命宫 + 夫妻宫 + 福德宫（三者缺一不可）
2. 口吻专业中立，不使用极端断语（禁止"大凶""离婚""死亡"等词）
3. 男女合盘用统一的倪师体系，不混用其他体系
4. 每段分析都要给出具体建议（趋吉避凶）

【倪师合盘核心口诀】
- "看婚姻，光看夫妻宫，大错特错，一定要同时看福德宫。"
- "廉贞贪狼/廉贞破军在夫妻宫，不管男命女命，非生离即死别。"
- "太阳化忌（女命）上不见父，下不见子，中不见夫。"
- "男人的命，最怕太阴化忌，婆媳不和。"
- "旺夫：太太让先生没有后顾之忧；克夫不是凶，是感情太好以对方为主。"

【合盘输出格式】（请用Markdown结构化输出）
## 合盘概述（1-2段话）
## 缘分分析（星级评分 + 依据）
## 命格兼容性（双方命宫/夫妻宫/福德宫对比）
## 关键宫位逐项分析（重点分析夫妻宫+福德宫+四化飞化）
## 婚恋/事业建议（2-3条具体可行建议）
## 大限同步与流年婚期提示`;

export async function POST(req: NextRequest) {
  try {
    const { chartA, chartB, question } = await req.json();
    if (!chartA || !chartB) {
      return NextResponse.json({ error: '缺少双方命盘数据' }, { status: 400 });
    }

    const aText = compressChartForHeming(chartA, '甲方');
    const bText = compressChartForHeming(chartB, '乙方');

    const userPrompt = question
      ? `用户问题：${question}\n\n请根据以下合盘数据，回答用户问题，进行深度合盘分析：`
      : '请对以下甲乙双方进行深度合盘分析：';

    const knowledgeContext = `
=== 十四主星入夫妻宫断语 ===
${Object.entries(STAR_IN_FUQI_GU).map(([star, info]) =>
  `【${star}】${info.summary}\n  吉：${info.good}\n  凶：${info.bad}${info.ni_quote ? `\n  倪师：${info.ni_quote}` : ''}`
).join('\n\n')}

=== 四化入夫妻宫断语 ===
${Object.entries(SIHUA_IN_FUQI_GU).map(([k, v]) => `【${k}】${v}`).join('\n')}

=== 婚恋辅助星断语 ===
${Object.entries(MARRIAGE_STARS_BRIEF).map(([k, v]) => `【${k}】${v}`).join('\n')}

=== 合盘评分标准 ===
${Object.entries(HEMING_SCORE_CRITERIA).map(([k, v]) => `【${k}】${v}`).join('\n')}

=== 倪师合盘方法论 ===
${HEMING_METHODOLOGY}`;
    const fullText = `${aText}\n\n${bText}\n\n${knowledgeContext}`;

    const aiResponse = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${fullText}\n\n${userPrompt}` },
        ],
        temperature: 0.7,
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
        // 2026-06-14: 隐藏上游 model 的 <think>...</think> 推理内容 (跟 interpret 对齐)
        let inThink = false;
        let thinkBuf = '';

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
                if (!text) continue;
                // State machine: 扫描 text 中的 <think> / </think>, 提取非 think 部分
                thinkBuf += text;
                let outputBuf = '';
                let pos = 0;
                while (pos < thinkBuf.length) {
                  if (inThink) {
                    const endIdx = thinkBuf.indexOf('</think>', pos);
                    if (endIdx < 0) {
                      thinkBuf = thinkBuf.slice(pos);
                      pos = thinkBuf.length;
                      break;
                    }
                    inThink = false;
                    pos = endIdx + '</think>'.length;
                  } else {
                    const startIdx = thinkBuf.indexOf('<think>', pos);
                    if (startIdx < 0) {
                      outputBuf += thinkBuf.slice(pos);
                      pos = thinkBuf.length;
                    } else {
                      outputBuf += thinkBuf.slice(pos, startIdx);
                      inThink = true;
                      pos = startIdx + '<think>'.length;
                    }
                  }
                }
                if (!inThink) thinkBuf = '';
                if (outputBuf) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: outputBuf } })}\n`));
                }
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
    console.error('heming error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '服务器错误' },
      { status: 500 }
    );
  }
}