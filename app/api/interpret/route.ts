import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';
import { SYSTEM_PROMPT_V2, TOPIC_PROMPTS_V2, compressChartV2 } from '@/lib/ziwei/prompts';

// 2026-06-09: AI 提示词 v2 开关 (默认关, 走 v1 稳)
// 启用: export INTERPRET_PROMPT_V2=true && systemctl restart ziwei
const USE_V2 = process.env.INTERPRET_PROMPT_V2 === 'true';

// 2026-06-10: 改用 env 变量 (旧版硬编码 + 误写成 '…' 导致 6-09 上线后 AI 解读全挂)
// systemd: /etc/systemd/system/ziwei.service 的 Environment= 配置
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_BASE_URL = process.env.MINIMAX_BASE_URL || 'https://api.minimaxi.com/v1';
const MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M2.7';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ===== W3 改造 (2026-06-09): token 预算 / 追问 / 错误降级 =====
const INPUT_TOKEN_BUDGET = 30_000;   // 30k 留给 input (含 system + chart + history)
const OUTPUT_TOKEN_LIMIT = 16_000;   // 16k 给 output
const MAX_HISTORY_MESSAGES = 8;      // 最多 8 条对话历史
const LLM_TIMEOUT_MS = 60_000;       // 60s 超时

/**
 * 估算 token 数 (中文约 1.5 字符/token, 英文约 4 字符/token)
 * 简化: 1 token ≈ 1.5 中文字符 ≈ 3 英文字符
 */
function estimateTokens(text: string): number {
  if (!text) return 0;
  // 中文字符数
  const cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 非中文字符数
  const otherChars = text.length - cnChars;
  return Math.ceil(cnChars / 1.5 + otherChars / 3);
}

/**
 * 截断历史以满足 token 预算 (从最新到最旧)
 */
function truncateHistoryByBudget(
  history: Array<{ role: string; content: string }>,
  budget: number
): Array<{ role: string; content: string }> {
  if (history.length === 0) return [];
  // 从最新开始累加
  let usedTokens = 0;
  const kept: Array<{ role: string; content: string }> = [];
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const tokens = estimateTokens(msg.content) + 4; // 4 角色标签
    if (usedTokens + tokens > budget) break;
    kept.unshift(msg);
    usedTokens += tokens;
  }
  return kept;
}

/**
 * W3-3: 错误降级 - 当 MiniMax 失败时, 基于本地 iztro 数据生成模板
 */
function generateFallbackAnalysis(chart: ZiweiChart, topic: string): string {
  const chartText = USE_V2 ? compressChartV2(chart) : compressChart(chart);
  const topicName = ({ overview: '总论', love: '感情', career: '事业', wealth: '财运', health: '健康', personality: '性格' } as Record<string, string>)[topic] || '综合';

  return `# 命盘${topicName} (离线模板)

> ⚠️ AI 解读服务暂不可用, 以下为基于本地命盘数据的结构化分析

${chartText}

## 📊 本地数据小结 (供离线参考)

1. **命宫主星** 显示您最核心的性格特质
2. **三方四正** 综合命宫 + 对宫 + 三方星曜
3. **四化落宫** 重点关注化忌所在宫位
4. **大限流年** 当前大限走何宫 + 当年流年触发

## 💡 建议

- **联网重试**: AI 服务恢复后可获得深度解读
- **结构化查询**: 6 个主题 (overview/love/career/wealth/health/personality) 均可问
- **追问模式**: 选定 followup 主题可基于上一轮答案深挖
`;
}

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

// W3-2: 追问 topic (W3-2 改造, 2026-06-09)
const TOPIC_PROMPTS_FOLLOWUP = '这是上一轮对话的延续, 请基于历史上下文直接回答用户最新问题。无需重复命盘数据。';

export async function POST(req: NextRequest) {
  try {
    const { chart, messages, topic } = await req.json();

    if (!chart) {
      return NextResponse.json({ error: '缺少命盘数据' }, { status: 400 });
    }

    // ===== W3-2: 追问模式 (followup 不重发 chart) =====
    const isFollowup = topic === 'followup';

    // 2026-06-09: v2 走新提示词 + 9 段结构化压缩
    const chartText = USE_V2 && !isFollowup ? compressChartV2(chart) : '';
    const userPrompt = isFollowup
      ? TOPIC_PROMPTS_FOLLOWUP
      : (USE_V2
          ? (TOPIC_PROMPTS_V2[topic] || '请全面分析这个命盘。')
          : (TOPIC_PROMPTS[topic] || '请全面分析这个命盘。命盘数据中已包含命宫四化星信息，请结合四化星落宫综合分析，不要说"四化未提供"。'));
    const systemContent = USE_V2 ? SYSTEM_PROMPT_V2 : SYSTEM_PROMPT;

    // ===== W3-1: token 计数 + 截断 =====
    const systemTokens = estimateTokens(systemContent);
    const chartTokens = estimateTokens(chartText);
    const userPromptTokens = estimateTokens(userPrompt);
    const fixedTokens = systemTokens + chartTokens + userPromptTokens + 100; // 100 = role 标签等

    const remainingBudget = INPUT_TOKEN_BUDGET - fixedTokens;
    const truncatedHistory = truncateHistoryByBudget(
      (messages ?? []).slice(-MAX_HISTORY_MESSAGES),
      Math.max(0, remainingBudget)
    );
    const historyTokens = truncatedHistory.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0);

    // 日志: token 使用情况
    console.log(`[interpret] topic=${topic} followup=${isFollowup} system=${systemTokens} chart=${chartTokens} userPrompt=${userPromptTokens} history=${truncatedHistory.length}msg/${historyTokens}tok total=${fixedTokens + historyTokens}`);

    // Build messages
    const systemMsg = { role: 'system' as const, content: systemContent };
    const chartMsg = isFollowup ? null : { role: 'user' as const, content: `这是我命盘的基础信息，请熟记并在后续分析中结合参考：\n\n${chartText}` };
    const historyMsgs = truncatedHistory.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    const fullPrompt = `${chartText}\n\n${userPrompt}`;

    // ===== 调用 MiniMax (带 W3-3 错误降级) =====
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    let aiResponse;
    try {
      aiResponse = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [systemMsg, ...(chartMsg ? [chartMsg] : []), ...historyMsgs, { role: 'user', content: userPrompt }],
          temperature: 0.7,
          max_tokens: OUTPUT_TOKEN_LIMIT,
          stream: true,
          reasoning_split: false,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const isTimeout = errMsg.includes('aborted') || errMsg.includes('timeout');
      console.error(`[interpret] fetch failed: ${errMsg} (timeout=${isTimeout})`);

      // W3-3: 错误降级 - 返回本地模板
      const fallback = generateFallbackAnalysis(chart, topic || 'overview');
      return new NextResponse(fallback, {
        status: 200,  // 用 200 + 特殊 header 表明是 fallback
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'X-Interpret-Fallback': 'true',
          'X-Interpret-Fallback-Reason': isTimeout ? 'timeout' : 'fetch_error',
        },
      });
    }
    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const errStatus = aiResponse.status;
      const errText = await aiResponse.text();
      console.error(`[interpret] MiniMax ${errStatus}: ${errText.slice(0, 200)}`);

      // W3-3: 5xx / 429 → fallback
      if (errStatus >= 500 || errStatus === 429 || errStatus === 408) {
        const fallback = generateFallbackAnalysis(chart, topic || 'overview');
        return new NextResponse(fallback, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Interpret-Fallback': 'true',
            'X-Interpret-Fallback-Reason': `${errStatus}`,
          },
        });
      }

      // 4xx 客户端错 → 正常报错
      return NextResponse.json({ error: `AI服务错误: ${errStatus}` }, { status: 502 });
    }

    // Transform MiniMax SSE → Next.js streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = aiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        // 2026-06-14: 隐藏上游 model 的 <think>...</think> 推理内容 (官人反馈右栏露出)
        // 用 state machine 跨 chunk 跟踪 think 状态
        let inThink = false;
        let thinkBuf = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // 流结束: 丢任何仍在 think 里的内容, 输出末尾
              if (!inThink && thinkBuf) {
                const eventData = JSON.stringify({ delta: { text: thinkBuf } });
                controller.enqueue(encoder.encode(`data: ${eventData}\n`));
              }
              break;
            }

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
                      // think 未结束, 等待下一 chunk
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
                if (!inThink) {
                  thinkBuf = '';
                }
                if (outputBuf) {
                  const eventData = JSON.stringify({ delta: { text: outputBuf } });
                  controller.enqueue(encoder.encode(`data: ${eventData}\n`));
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
        'X-Interpret-Tokens': `${fixedTokens + historyTokens}`,
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
