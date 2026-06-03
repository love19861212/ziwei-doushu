'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from '@/components/chart/TimeNav';

interface SelectedSiHua { starName: string; siHua: string; view: TimeView; }
interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
  // 外部点击“深入提问 AI”后同步过来的提示词
  promptSeed?: string | null;
}
interface ChatMsg { role: 'user' | 'ai'; text: string; }

const TOPICS = [
  { key: 'overview',     label: '命格' },
  { key: 'love',        label: '感情' },
  { key: 'career',      label: '事业' },
  { key: 'wealth',      label: '财运' },
  { key: 'health',      label: '健康' },
  { key: 'personality', label: '性格' },
] as const;

const TOPIC_PROMPTS: Record<string, string> = {
  overview: '请生成命格总览',
  love: '请深度分析感情婚姻运',
  career: '请深度分析事业运',
  wealth: '请深度分析财运',
  health: '请分析健康运势',
  personality: '请深度解析性格特质',
};

/** Strip markdown-style **bold** from a string */
function stripBold(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1');
}

/** Parse inline **bold** into React nodes */
function inlineParse(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '*' && text[i+1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        nodes.push(<strong key={i} style={{fontWeight:700, color:'#1A1A18'}}>{text.slice(i+2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    let j = i;
    while (j < text.length && !(text[j] === '*' && text[j+1] === '*')) j++;
    if (j > i) { nodes.push(<span key={i}>{text.slice(i, j)}</span>); i = j; }
    else { nodes.push(<span key={i}>{text[i]}</span>); i++; }
  }
  return nodes;
}

function renderLine(trimmed: string, key: number): React.ReactNode {
  if (!trimmed) return <div key={key} style={{height:8}}/>;

  if (trimmed.startsWith('# '))
    return <div key={key} style={{fontSize:18,fontWeight:700,color:'#0D0D0B',marginTop:16,marginBottom:6,borderBottom:'1.5px solid rgba(184,146,42,0.3)',paddingBottom:6}}>{trimmed.slice(2)}</div>;

  if (trimmed.startsWith('## '))
    return <div key={key} style={{fontSize:15,fontWeight:700,color:'#7A5F1A',marginTop:12,marginBottom:4}}>{trimmed.slice(3)}</div>;

  if (trimmed.startsWith('### '))
    return <div key={key} style={{fontSize:14,fontWeight:600,color:'#4A4A45',marginTop:8,marginBottom:2}}>{trimmed.slice(4)}</div>;

  if (/^\*\*【.+】\*\*$/.test(trimmed))
    return <div key={key} style={{fontSize:15,fontWeight:700,color:'#B8922A',marginTop:12,marginBottom:4,letterSpacing:'0.02em'}}>{trimmed.slice(2,-2)}</div>;

  if (trimmed.startsWith('> '))
    return <div key={key} style={{borderLeft:'3px solid #B8922A',paddingLeft:10,marginTop:4,marginBottom:4,fontSize:13,color:'#4A4A45',fontStyle:'italic'}}>{trimmed.slice(2)}</div>;

  if (trimmed.startsWith('- ')) {
    return <div key={key} style={{fontSize:14,color:'#4A4A45',paddingLeft:12,marginBottom:2,lineHeight:1.6}}>• {inlineParse(trimmed.slice(2))}</div>;
  }

  if (/^[┌├└─┬┼┐┤│]/.test(trimmed))
    return <div key={key} style={{fontFamily:'monospace',fontSize:13,color:'#4A4A45',lineHeight:1.4,marginBottom:2,whiteSpace:'pre'}}>{trimmed}</div>;

  if (/^\|[-\s]+\|[-\s]+\|$/.test(trimmed)) return null;

  if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
    const cells = trimmed.slice(1,-1).split('|').map(c => c.trim());
    return <div key={key} style={{display:'flex',gap:8,marginBottom:1,fontSize:13,borderBottom:'1px solid rgba(0,0,0,0.05)',paddingBottom:2}}>
      {cells.map((c,ci) => <span key={ci} style={{flex:1,fontWeight: ci===0?600:400, color: ci===0?'#1A1A18':'#4A4A45'}}>{inlineParse(c)}</span>)}
    </div>;
  }

  if (/^[-=]{3,}$/.test(trimmed))
    return <div key={key} style={{borderBottom:'1px solid rgba(0,0,0,0.06)',margin:'6px 0'}}/>;

  return <div key={key} style={{fontSize:14,color:'#4A4A45',lineHeight:1.7,marginBottom:2}}>{inlineParse(trimmed)}</div>;
}

function parseAiText(text: string) {
  return text.split('\n').map((line, i) => renderLine(line.trim(), i));
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua, promptSeed }: InsightPanelProps) {
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  // 折叠状态: 跟踪每个 AI message 的展开/收起. 默认全部收起
  // streaming 中(loading=true 且最后一条是 ai)的 message 强制展开
  const [expandedAiMsgs, setExpandedAiMsgs] = useState<Set<number>>(new Set());
  const toggleAiExpand = (i: number) => {
    setExpandedAiMsgs(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const bottomRef = useRef<HTMLDivElement>(null);

  // 外部 promptSeed 变化时自动填入输入框
  useEffect(() => {
    if (promptSeed) {
      setInputText(promptSeed);
    }
  }, [promptSeed]);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [chatHistory]);

  const sendToAI = async (userMsg: string) => {
    if (loading) return;
    const history: ChatMsg[] = [...chatHistory, {role:'user', text:userMsg}];
    setChatHistory(history);
    setInputText('');
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({chart, messages: history.slice(0,-1).map(m=>({role:m.role, content:m.text})), topic: activeTopic}),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('请求失败');
      if (!res.body) throw new Error('无响应');
      let full = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, {stream:true});
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.delta?.text) { full += data.delta.text; setChatHistory(prev => [...prev.slice(0,-1), {role:'ai', text:full}]); }
            } catch { /* skip */ }
          }
        }
      }
      setChatHistory(prev => [...prev.slice(0,-1), {role:'ai', text:full}]);
    } catch (e: any) {
      if (e.name !== 'AbortError') setChatHistory(prev => [...prev.slice(0,-1), {role:'ai', text:'抱歉，AI暂时不可用。'}]);
    } finally { setLoading(false); }
  };

  const handleTopicClick = async (topic: string) => {
    setActiveTopic(topic);
    setChatHistory([]);
    await sendToAI(TOPIC_PROMPTS[topic]);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || loading) return;
    sendToAI(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',fontFamily:'-apple-system,"PingFang SC",sans-serif'}}>
      {/* Topic Buttons */}
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
        {TOPICS.map(t => (
          <button key={t.key}
            style={{padding:'5px 12px',borderRadius:999,fontSize:13,fontWeight:500,
              border: activeTopic===t.key ? '1px solid rgba(184,146,42,0.35)' : '1px solid rgba(0,0,0,0.10)',
              background: activeTopic===t.key ? 'rgba(184,146,42,0.12)' : 'rgba(0,0,0,0.03)',
              color: activeTopic===t.key ? '#B8922A' : '#8A8A82',
              cursor: loading ? 'not-allowed' : 'pointer'}}
            onClick={() => handleTopicClick(t.key)} disabled={loading}>{t.label}</button>
        ))}
        {loading && <button onClick={()=>{abortRef.current?.abort();setLoading(false);}}
          style={{padding:'5px 12px',borderRadius:999,fontSize:13,border:'1px solid rgba(168,50,40,0.25)',background:'rgba(168,50,40,0.08)',color:'#A83228',cursor:'pointer'}}>停止</button>}
      </div>

      {/* Chat Area */}
      <div style={{flex:1,overflowY:'auto',paddingRight:4,display:'flex',flexDirection:'column',gap:4}}>
        {chatHistory.length===0 && !loading && (
          <div style={{textAlign:'center',padding:'32px 16px',color:'#8A8A82',fontSize:12}}>
            选择一个主题，AI为您深度解读命盘
          </div>
        )}
        {chatHistory.map((msg,i) => (
          msg.role==='user'
            ? <div key={i} style={{background:'rgba(184,146,42,0.12)',border:'1px solid rgba(184,146,42,0.2)',borderRadius:12,padding:'8px 12px',fontSize:14,color:'#1A1A18',marginBottom:8,alignSelf:'flex-end',maxWidth:'85%',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{msg.text}</div>
            : (() => {
              const isLastAi = i === chatHistory.length - 1;
              const isStreaming = loading && isLastAi;
              const isExpanded = isStreaming || expandedAiMsgs.has(i);
              const isLong = msg.text.length > 150;
              return (
                <div key={i} style={{
                  background:'#FFFFFF',
                  border:'1px solid rgba(184,146,42,0.18)',
                  borderRadius:12,
                  padding:'10px 12px',
                  marginBottom:8,
                  alignSelf:'flex-start',
                  maxWidth:'100%',
                  boxShadow:'0 1px 2px rgba(0,0,0,0.03)',
                }}>
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    marginBottom: isExpanded ? 8 : 0,
                    fontSize: 10, color:'#B8922A', letterSpacing:'0.2em', fontWeight: 600,
                  }}>
                    <span style={{display:'flex', alignItems:'center', gap:4}}>
                      <span style={{fontSize:12}}>✦</span>
                      命理解读
                      {isStreaming && <span style={{color:'#8A8A82', fontStyle:'italic', fontWeight:400, marginLeft:6}}>解读中...</span>}
                    </span>
                    {isLong && !isStreaming && (
                      <button onClick={() => toggleAiExpand(i)} style={{
                        padding:'2px 8px', borderRadius:999,
                        fontSize: 10, fontWeight: 500,
                        border:'1px solid rgba(0,0,0,0.10)',
                        background: isExpanded ? 'rgba(184,146,42,0.08)' : 'rgba(0,0,0,0.03)',
                        color: isExpanded ? '#B8922A' : '#8A8A82',
                        cursor:'pointer',
                        display:'inline-flex', alignItems:'center', gap:3,
                        transition:'all 0.15s',
                      }}>
                        {isExpanded ? '收起' : '展开'}
                        <span style={{
                          display:'inline-block',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition:'transform 0.2s',
                          fontSize: 8,
                        }}>▾</span>
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        {parseAiText(msg.text)}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          color:'#8A8A82', fontSize: 12, lineHeight: 1.5,
                          cursor: isLong ? 'pointer' : 'default',
                          padding: isLong ? '2px 0' : 0,
                        }}
                        onClick={isLong ? () => toggleAiExpand(i) : undefined}
                      >
                        {msg.text.slice(0, 80).replace(/\n+/g, ' ').trim()}
                        {isLong && (
                          <span style={{color:'#B8922A', marginLeft:4, fontWeight:500}}>… 点击展开</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()
        ))}
        {loading && chatHistory[chatHistory.length-1]?.role==='user' && (
          <div style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.07)',borderRadius:12,padding:'12px',fontSize:14,color:'#8A8A82',fontStyle:'italic',alignSelf:'flex-start'}}>正在解读...</div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input Row */}
      <div style={{display:'flex',gap:8,marginTop:8,alignItems:'flex-end'}}>
        <textarea ref={inputRef} value={inputText} onChange={e=>setInputText(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="继续追问..." rows={1}
          style={{flex:1,border:'1px solid rgba(0,0,0,0.12)',borderRadius:12,padding:'8px 12px',fontSize:14,color:'#0D0D0B',background:'#FFFFFF',outline:'none',resize:'none',fontFamily:'inherit',lineHeight:1.5,maxHeight:80,overflowY:'auto',whiteSpace:'pre-wrap',wordBreak:'break-word'}}/>
        <button style={{padding:'8px 14px',borderRadius:12,border:'none',background:'#B8922A',color:'#FFFFFF',fontSize:14,cursor:'pointer',fontWeight:600,flexShrink:0}} onClick={handleSend} disabled={loading||!inputText.trim()}>发送</button>
      </div>
    </div>
  );
}