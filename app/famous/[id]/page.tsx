'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme } from '@/components/ThemeProvider';
import { FAMOUS_PERSONS } from '@/lib/ziwei/famous';
import type { FamousPerson } from '@/lib/ziwei/famous';
import type { ZiweiChart } from '@/lib/ziwei/types';

// AiContent 渲染器
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  // Remove reasoning tags
  const clean = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '').replace(/\x00/g, '').replace(/<>/g, '');
  const lines = clean.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, i) => {
        // ## 大标题
        if (line.startsWith('## ')) {
          return <h2 key={i} style={{ fontSize: '18px', fontWeight: 700, color: '#f6efe0', marginTop: '20px', marginBottom: '8px', letterSpacing: '0.08em', borderBottom: '1px solid rgba(212,168,67,0.2)', paddingBottom: '6px' }}>{line.slice(3)}</h2>;
        }
        // ### 小标题
        if (line.startsWith('### ')) {
          return <h3 key={i} style={{ fontSize: '15px', fontWeight: 600, color: '#d4a843', marginTop: '16px', marginBottom: '6px', letterSpacing: '0.05em' }}>{line.slice(4)}</h3>;
        }
        // | 表格行
        if (line.startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim() && c.trim() !== '---');
          if (cells.length > 0) {
            return (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', lineHeight: 1.8, color: 'rgba(255,255,255,0.75)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {cells.map((cell, ci) => (
                  <span key={ci} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? '#f6efe0' : 'rgba(255,255,255,0.7)' }}>{cell.trim()}</span>
                ))}
              </div>
            );
          }
          return null;
        }
        // 空行
        if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />;
        // 普通文本，支持 **bold** 和 *italic*
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <div key={i} style={{ fontSize: '14px', lineHeight: 1.9, color: 'rgba(255,255,255,0.88)', paddingLeft: '4px' }}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} style={{ fontWeight: 700, color: '#f6efe0' }}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                return <em key={j} style={{ fontStyle: 'italic', color: '#d4a843' }}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </div>
        );
      })}
      {streaming && (
        <span style={{
          display: 'inline-block', width: '8px', height: '14px',
          background: 'rgba(212,168,67,0.9)', opacity: 0.7, borderRadius: '2px',
          animation: 'pulse 1s ease-in-out infinite',
          verticalAlign: 'middle', marginLeft: '4px',
        }} />
      )}
    </div>
  );
}


// 时辰转小时
function hourToHours(hour: number): [number, number] {
  const map: [number, number][] = [
    [23, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
    [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17],
    [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23],
  ];
  return map[hour] ?? [hour, hour + 1];
}

export default function FamousDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const personId = params.id as string;
  const person = FAMOUS_PERSONS.find(p => p.id === personId) as FamousPerson | undefined;

  // AI 解读状态
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [interpreting, setInterpreting] = useState(false);
  const [interpretError, setInterpretError] = useState(false);
  const [hasInterpreted, setHasInterpreted] = useState(false);

  const interpretRef = useRef<HTMLDivElement>(null);

  // 构建命盘
  const buildChart = useCallback(async () => {
    if (!person) return null;
    const [hourStart] = hourToHours(person.hour);
    const birthInfo = {
      year: person.year,
      month: person.month,
      day: person.day,
      hour: person.hour,
      gender: person.gender,
      birthHourStart: hourStart,
      unknownTime: false,
    };
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthInfo),
      });
      if (!res.ok) return null;
      return await res.json() as ZiweiChart;
    } catch {
      return null;
    }
  }, [person]);

  // 生成解读
  const runInterpretation = useCallback(async () => {
    if (!chart || !person) return;
    setInterpreting(true);
    setInterpretation('');
    setInterpretError(false);

    try {
      const res = await fetch('/api/famous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          personName: person.name,
          personDesc: person.description,
          notable: person.notable,
        }),
      });
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const raw = JSON.parse(data).delta?.text ?? '';
            // 过滤掉思考标签（双保险: 后端已经过滤, 客户端再滤一次防漏网）
            const delta = raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\u0000/g, '');
            text += delta;
            setInterpretation(text);
          } catch { /* skip */ }
        }
      }
      setHasInterpreted(true);
      setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setInterpretError(true);
    } finally {
      setInterpreting(false);
    }
  }, [chart, person]);

  // 自动起盘并可选择生成解读
  useEffect(() => {
    if (!person) return;
    buildChart().then(c => {
      if (c) setChart(c);
    });
  }, [person, buildChart]);

  if (!person) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020810' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>未找到该名人命盘</p>
          <Link href="/famous" style={{ color: '#d4a843', fontSize: '13px' }}>← 返回名人命盘库</Link>
        </div>
      </div>
    );
  }

  const catColors: Record<string, string> = {
    '商业': '#4ade80', '文艺': '#c084fc', '科技': '#60a5fa', '体育': '#fb923c', '历史': '#facc15',
  };
  const catColor = catColors[person.category] ?? '#d4a843';
  const branchNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const hourName = branchNames[person.hour] ?? '?';

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#020810' : '#fafaf9' }}>
      <StarField />

      {/* 顶栏 */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '52px',
        background: isDark ? 'rgba(2,8,16,0.88)' : 'rgba(250,245,235,0.92)',
        backdropFilter: 'blur(20px)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,160,60,0.2)'}`,
      }}>
        <Link href="/famous" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
          <span style={{ fontSize: '18px' }}>‹</span>
          <span>返回</span>
        </Link>
        <div style={{ fontSize: '11px', color: catColor, letterSpacing: '0.3em' }}>名人命盘</div>
        <div style={{ width: '60px' }} />
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* 名人基本信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            border: `1px solid ${catColor}40`,
            borderRadius: '20px',
            padding: '28px 32px',
            marginBottom: '24px',
            background: `linear-gradient(135deg, ${catColor}08, transparent 60%)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#f6efe0', letterSpacing: '0.1em', marginBottom: '6px' }}>{person.name}</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{person.description}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
              color: catColor, background: catColor + '18', border: `1px solid ${catColor}40`,
              fontSize: '12px', letterSpacing: '0.08em',
            }}>
              {person.category}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', marginBottom: '4px' }}>出生日期</div>
              <div style={{ fontSize: '14px', color: '#f6efe0', fontWeight: 600 }}>{person.year}年{person.month}月{person.day}日</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', marginBottom: '4px' }}>时辰（估算）</div>
              <div style={{ fontSize: '14px', color: '#f6efe0', fontWeight: 600 }}>{hourName}时</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', marginBottom: '4px' }}>性别</div>
              <div style={{ fontSize: '14px', color: '#f6efe0', fontWeight: 600 }}>{person.gender === 'male' ? '男命' : '女命'}</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '10px', background: catColor + '0c', border: `1px solid ${catColor}25` }}>
            <span style={{ color: catColor, fontWeight: 600, fontSize: '12px', marginRight: '6px' }}>命盘亮点：</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{person.notable}</span>
          </div>
        </motion.div>

        {/* 命盘展示区 */}
        {chart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              border: '1px solid rgba(212,168,67,0.2)',
              borderRadius: '20px',
              padding: '28px 32px',
              marginBottom: '24px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em', marginBottom: '20px' }}>命盘已生成</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {[
                { label: '五行局', value: chart.wuxingJuName },
                { label: '命宫', value: chart.mingGongBranch },
                { label: '身宫', value: chart.shenGongBranch },
                { label: '当前大限', value: `${(chart.daXians ?? [])[chart.currentDaXianIndex ?? 0]?.startAge ?? '?'}-${(chart.daXians ?? [])[chart.currentDaXianIndex ?? 0]?.endAge ?? '?'}岁` },
                { label: '现年', value: `${chart.currentAge}岁` },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', color: '#f6efe0', fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 十二宫简览 */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', marginBottom: '10px' }}>十二宫概要</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {(chart.palaces ?? []).map(p => {
                  const majorStars = p.stars?.filter(s => s.type === 'major').map(s => s.name).join('、') ?? '';
                  return (
                    <div key={p.branch} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '11px' }}>
                      <div style={{ color: '#d4a843', marginBottom: '3px', letterSpacing: '0.1em' }}>{p.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontSize: '10px' }}>{majorStars || '(空)'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI 解读按钮 / 结果 */}
        {!hasInterpreted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '24px' }}
          >
            {!chart ? (
              <div style={{ padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>命盘生成中...</div>
            ) : (
              <button
                onClick={runInterpretation}
                disabled={interpreting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 36px',
                  borderRadius: '9999px',
                  border: `1px solid rgba(212,168,67,0.4)`,
                  background: 'rgba(212,168,67,0.08)',
                  color: '#d4a843',
                  fontSize: '14px', fontWeight: 600, letterSpacing: '0.15em',
                  cursor: interpreting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {interpreting ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
                    AI 分析中...
                  </>
                ) : (
                  <>✦ AI 命盘解读</>
                )}
              </button>
            )}
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '10px' }}>
              基于倪海厦紫微斗数体系 · 仅供学术研究参考
            </p>
          </motion.div>
        )}

        {/* 解读结果 */}
        {(interpretation || interpreting) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={interpretRef}
            style={{
              border: '1px solid rgba(212,168,67,0.25)',
              borderRadius: '20px',
              padding: '32px',
              background: 'rgba(212,168,67,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✦</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4a843', letterSpacing: '0.15em' }}>AI 命盘解读</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>MiniMax-M2.7 · 倪海厦紫微斗数体系</div>
              </div>
            </div>
            {interpreting && !interpretation ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d4a843', fontSize: '14px', padding: '12px 0' }}>
                <span style={{ opacity: 0.5 }}>✦</span>
                <span>AI 正在解读名人命盘，思考中</span>
                <span style={{ display: 'inline-flex', gap: '2px', opacity: 0.7 }}>
                  <span style={{ animation: 'bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }}>·</span>
                  <span style={{ animation: 'bounce 1.2s ease-in-out infinite', animationDelay: '150ms' }}>·</span>
                  <span style={{ animation: 'bounce 1.2s ease-in-out infinite', animationDelay: '300ms' }}>·</span>
                </span>
              </div>
            ) : (
              <AiContent text={interpretation} streaming={interpreting} />
            )}
            {interpretError && (
              <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: 'rgba(255,120,120,0.9)', fontSize: '13px' }}>
                解读失败，请稍后重试
              </div>
            )}
          </motion.div>
        )}

        {/* 底部说明 */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7 }}>
            ⚠️ 出生时辰为公开文献估算值，AI 解读基于此命盘数据自动生成<br />
            仅供紫微斗数学术研究参考，不代表任何现实对应
          </p>
        </div>
      </div>
    </div>
  );
}