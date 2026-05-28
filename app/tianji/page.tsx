'use client';
import { useState, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme } from '@/components/ThemeProvider';

function FadeIn({ children, delay = 0, y = 28, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function TianjiPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedGua, setSelectedGua] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#020810' : '#fafaf9' }}>
      <StarField />
      {/* 导航 */}
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2"
        style={{ background: '#020810' }}>
        <div className="text-[13px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] font-medium" style={{ color: '#d4a843' }}>紫微命盘</div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <a href="/knowledge" className="hidden md:flex items-center px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(212,168,67,0.3)', background: 'rgba(255,255,255,0.05)', textDecoration: 'none' }}>
            <span className="text-[13px] font-medium tracking-wide" style={{ color: 'rgba(212,180,100,0.85)' }}>知识库</span>
          </a>
          <a href="/library" className="hidden lg:flex items-center px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(212,168,67,0.3)', background: 'rgba(255,255,255,0.05)', textDecoration: 'none' }}>
            <span className="text-[13px] font-medium tracking-wide" style={{ color: 'rgba(212,180,100,0.85)' }}>古籍库</span>
          </a>
          <a href="/chart" className="flex items-center px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(212,168,67,0.3)', background: 'rgba(255,255,255,0.05)', textDecoration: 'none' }}>
            <span className="text-[13px] font-medium tracking-wide" style={{ color: 'rgba(212,180,100,0.85)' }}>立即起盘</span>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/scenes/sanji-tianji.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.58 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #020810 0%, rgba(2,8,16,0.38) 28%, rgba(2,8,16,0.52) 68%, #020810 100%)' }} />
        </div>
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="text-center" style={{ display: 'inline-block', padding: '26px clamp(28px,6vw,56px)', borderRadius: '20px', background: 'rgba(16,12,6,0.34)', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(184,146,42,0.4))' }} />
              <span style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em' }}>NI HAI XIA · TIAN JI</span>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(184,146,42,0.4))' }} />
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: '#f6efe0', letterSpacing: '0.2em', marginBottom: '12px' }}>天纪</h1>
            <p style={{ fontSize: '16px', color: '#d4a843', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 500 }}>上知天文</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', maxWidth: '640px', margin: '0 auto', lineHeight: 1.8 }}>
              涵盖 <strong style={{ color: '#d4a843' }}>8</strong> 大学科 · <strong style={{ color: '#d4a843' }}>67</strong> 个章节 · <strong style={{ color: '#d4a843' }}>64</strong> 卦详解<br />
              1994年录制 · 24集共48小时 · 讲义四册
            </p>
          </div>
        </motion.div>
      </section>

      {/* 三纪导航 */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-3 gap-3">
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.3)', textDecoration: 'none' }} href="/tianji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊙</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4a843', letterSpacing: '0.1em' }}>天纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>上知天文</div>
          </a>
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', textDecoration: 'none', opacity: 0.7 }} href="/diji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊞</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>地纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>下知地理</div>
          </a>
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', textDecoration: 'none', opacity: 0.7 }} href="/renji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊕</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>人纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>中知人事</div>
          </a>
        </div>
      </div>

      {/* 四大学派 */}
      <FadeIn>
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="text-center mb-6">
            <h2 style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em', marginBottom: '4px' }}>SCHOOLS OF THOUGHT</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>四大学派</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg px-4 py-4 text-center" style={{ border: '1px solid rgba(212,168,67,0.2)', background: 'rgba(212,168,67,0.04)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4a843', letterSpacing: '0.1em', marginBottom: '4px' }}>三合派</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>紫微斗数</div>
            </div>
            <div className="rounded-lg px-4 py-4 text-center" style={{ border: '1px solid rgba(107,184,224,0.2)', background: 'rgba(107,184,224,0.04)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6bb8e0', letterSpacing: '0.1em', marginBottom: '4px' }}>象数派</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>易经</div>
            </div>
            <div className="rounded-lg px-4 py-4 text-center" style={{ border: '1px solid rgba(107,138,94,0.2)', background: 'rgba(107,138,94,0.04)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b8a5e', letterSpacing: '0.1em', marginBottom: '4px' }}>九星派</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>堪舆学</div>
            </div>
            <div className="rounded-lg px-4 py-4 text-center" style={{ border: '1px solid rgba(139,107,158,0.2)', background: 'rgba(139,107,158,0.04)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#8b6b9e', letterSpacing: '0.1em', marginBottom: '4px' }}>河洛数理</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>推命学</div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 核心学科 */}
      <FadeIn>
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em', marginBottom: '4px' }}>CORE MODULES</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>核心学科</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 紫微斗数 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(184,146,42,0.15)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/ziwei">
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '24px' }}>◉</span>
                  <span style={{ fontSize: '9px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '9999px' }}>已上线</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.1em', marginBottom: '2px' }}>紫微斗数</h3>
                <p style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.08em', marginBottom: '8px' }}>三合派 · 倪师正宗体系</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>以紫微星为主轴，十四主星配十二宫位，结合四化星推演人生格局。倪师主张「大道至简」，不用飞星派复杂化法，以三合派为正宗。</p>
              </div>
              <div className="px-5 pb-5">
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: '6px' }}>4 个章节 · 三合派</div>
                {['紫微斗数基础', '十四主星详解', '四化星运用', '格局与断命'].map((item, i) => (
                  <div key={i} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', marginBottom: '2px' }}>{item}</div>
                  </div>
                ))}
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', fontWeight: 600, color: '#d4a843', letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
              </div>
            </a>

            {/* 易经 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(107,184,224,0.15)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/yijing">
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '24px' }}>☰</span>
                  <span style={{ fontSize: '9px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '9999px' }}>已上线</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.1em', marginBottom: '2px' }}>易经六十四卦</h3>
                <p style={{ fontSize: '11px', color: '#6bb8e0', letterSpacing: '0.08em', marginBottom: '8px' }}>象数派 · 断易天机</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>倪师以《断易天机》为底本，自创图示法讲解六十四卦，相辅相成。</p>
              </div>
              <div className="px-5 pb-5">
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: '6px' }}>9 个章节 · 象数派</div>
                {['易经基础与卦爻', '先天与后天八卦', '六十四卦构成', '装卦法·世应纳甲', '六亲取用神', '六神入爻', '旺相休囚与动爻', '断卦实战', '易经决策智慧'].map((item, i) => (
                  <div key={i} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', marginBottom: '2px' }}>{item}</div>
                  </div>
                ))}
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', fontWeight: 600, color: '#6bb8e0', letterSpacing: '0.08em' }}>进入该学科 →</div>
              </div>
            </a>

            {/* 堪舆 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/kanyu">
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '24px' }}>⊞</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.1em', marginBottom: '2px' }}>堪舆学</h3>
                <p style={{ fontSize: '11px', color: '#6b8a5e', letterSpacing: '0.08em', marginBottom: '8px' }}>九星派 · 杨救贫流派</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>地理环境与风水格局对人的影响，阴宅阳宅全讲。</p>
              </div>
              <div className="px-5 pb-5">
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: '6px' }}>8 个章节 · 九星派</div>
                {['地理基础', '龙穴砂水向', '阴宅', '阳宅', '八宅法', '玄空飞星', '杨救贫秘传', '实例分析'].map((item, i) => (
                  <div key={i} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', marginBottom: '2px' }}>{item}</div>
                  </div>
                ))}
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', fontWeight: 600, color: '#6b8a5e', letterSpacing: '0.08em' }}>进入该学科 →</div>
              </div>
            </a>
          </div>
        </div>
      </FadeIn>

      {/* 其他学科 */}
      <FadeIn>
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="text-center mb-6">
            <h2 style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em', marginBottom: '4px' }}>MORE MODULES</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>更多学科</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { href: '/sanji/tuiming', icon: '⊡', title: '推命学', sub: '河洛数理派·子平法' },
              { href: '/sanji/mianxiang', icon: '⊙', title: '面相学', sub: '五形论·命相同参' },
              { href: '/sanji/tianxiang', icon: '☆', title: '天象学', sub: '28宿七政·观天识变' },
              { href: '/sanji/cezi', icon: '⊚', title: '测字术', sub: '拆字法·会意法' },
              { href: '/sanji/liuren', icon: '✋', title: '六壬掐指法', sub: '掐指速算·心血来潮即断' },
            ].map((item, i) => (
              <a key={i} href={item.href} className="rounded-lg px-4 py-3 transition-all" style={{ border: '1px solid rgba(212,168,67,0.15)', background: 'rgba(212,168,67,0.03)', textDecoration: 'none' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', letterSpacing: '0.05em' }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{item.sub}</div>
              </a>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Footer */}
      
      {/* 易经64卦精选展示 */}
      <FadeIn>
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#6bb8e0', letterSpacing: '0.4em', marginBottom: '4px' }}>YI JING 64 HEXAGRAMS</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>易经六十四卦</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>倪师以《断易天机》为底本，图示法讲解 · 象数派 · 点击任意卦名查看卦辞、倪师讲解与断事要诀</p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3" style={{ alignItems: 'start' }}>
            {[
              {
                name: '乾', element: '天', glyph: '☰', color: '#c8a84b',
                hexagrams: [
                  {n:1, t:"乾为天"},{n:6, t:"天水讼"},{n:10, t:"天泽履"},{n:12, t:"天地否"},
                  {n:13, t:"天火同人"},{n:25, t:"天雷无妄"},{n:33, t:"天山遁"},{n:44, t:"天风姤"},
                ]
              },
              {
                name: '坤', element: '地', glyph: '☷', color: '#a08c5a',
                hexagrams: [
                  {n:2, t:"坤为地"},{n:7, t:"地水师"},{n:11, t:"地天泰"},{n:15, t:"地山谦"},
                  {n:19, t:"地泽临"},{n:24, t:"地雷复"},{n:36, t:"地火明夷"},{n:46, t:"地风升"},
                ]
              },
              {
                name: '震', element: '雷', glyph: '☳', color: '#9b8ec4',
                hexagrams: [
                  {n:16, t:"雷地豫"},{n:32, t:"雷风恒"},{n:34, t:"雷天大壮"},{n:40, t:"雷水解"},
                  {n:51, t:"震为雷"},{n:54, t:"雷泽归妹"},{n:55, t:"雷火丰"},{n:62, t:"雷山小过"},
                ]
              },
              {
                name: '巽', element: '风', glyph: '☴', color: '#7aab8a',
                hexagrams: [
                  {n:9, t:"风天小畜"},{n:20, t:"风地观"},{n:37, t:"风火家人"},{n:42, t:"风雷益"},
                  {n:53, t:"风山渐"},{n:57, t:"巽为风"},{n:59, t:"风水涣"},{n:61, t:"风泽中孚"},
                ]
              },
              {
                name: '坎', element: '水', glyph: '☵', color: '#6b9ab8',
                hexagrams: [
                  {n:3, t:"水雷屯"},{n:5, t:"水天需"},{n:8, t:"水地比"},{n:29, t:"坎为水"},
                  {n:39, t:"水山蹇"},{n:48, t:"水风井"},{n:60, t:"水泽节"},{n:63, t:"水火既济"},
                ]
              },
              {
                name: '离', element: '火', glyph: '☲', color: '#c46b6b',
                hexagrams: [
                  {n:14, t:"火天大有"},{n:21, t:"火雷噬嗑"},{n:30, t:"离为火"},{n:35, t:"火地晋"},
                  {n:38, t:"火泽睽"},{n:50, t:"火风鼎"},{n:56, t:"火山旅"},{n:64, t:"火水未济"},
                ]
              },
              {
                name: '艮', element: '山', glyph: '☶', color: '#8a9a6b',
                hexagrams: [
                  {n:4, t:"山水蒙"},{n:18, t:"山风蛊"},{n:22, t:"山火贲"},{n:23, t:"山地剥"},
                  {n:26, t:"山天大畜"},{n:27, t:"山雷颐"},{n:41, t:"山泽损"},{n:52, t:"艮为山"},
                ]
              },
              {
                name: '兑', element: '泽', glyph: '☱', color: '#8ab09b',
                hexagrams: [
                  {n:17, t:"泽雷随"},{n:28, t:"泽风大过"},{n:31, t:"泽山咸"},{n:43, t:"泽天夬"},
                  {n:45, t:"泽地萃"},{n:47, t:"泽水困"},{n:49, t:"泽火革"},{n:58, t:"兑为泽"},
                ]
              },
            ].map(gua => (
              <div key={gua.name} style={{
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                overflow: 'hidden',
              }}>
                {/* 宫头 */}
                <div style={{
                  textAlign: 'center',
                  padding: '10px 6px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '22px', marginBottom: '2px' }}>{gua.glyph}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: gua.color, letterSpacing: '0.05em' }}>{gua.name}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>({gua.element})</div>
                </div>
                {/* 卦列表 */}
                {gua.hexagrams.map(h => (
                  <button
                    key={h.n}
                    onClick={() => setSelectedGua(selectedGua === h.n ? null : h.n)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '7px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      border: 'none',
                      borderLeft: selectedGua === h.n ? `3px solid ${gua.color}` : '3px solid transparent',
                      background: selectedGua === h.n ? `rgba(${gua.color === '#c8a84b' ? '200,168,75' : '200,168,75'},0.08)` : 'transparent',
                      cursor: 'pointer',
                      color: 'inherit',
                      font: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', width: '20px', flexShrink: 0 }}>{h.n}</span>
                    <span style={{ fontSize: '12px', color: selectedGua === h.n ? '#f6efe0' : 'rgba(255,255,255,0.65)', fontWeight: selectedGua === h.n ? 600 : 400 }}>{h.t}</span>
                    {selectedGua === h.n && (
                      <span style={{ marginLeft: 'auto', fontSize: '10px', color: gua.color }}>展开 ↓</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* 展开详情面板 */}
          {selectedGua !== null && (
            <div style={{
              marginTop: '16px',
              borderRadius: '14px',
              border: '1px solid rgba(107,184,224,0.25)',
              background: 'rgba(107,184,224,0.04)',
              padding: '20px 24px',
            }}>
              {[
                {n:1, t:"乾为天", upper:"乾", lower:"乾", meaning:"元亨利贞，天行健，君子以自强不息", niInterpretation:"纯阳之卦，刚健中正，至大至刚", divination:"大吉大利，但需注意亢龙有悔"},
                {n:6, t:"天水讼", upper:"乾", lower:"坎", meaning:"有孚窒惕，中吉终凶", niInterpretation:"争讼之卦，不宜争斗", divination:"争讼不利，宜和解退让"},
                {n:10, t:"天泽履", upper:"乾", lower:"兑", meaning:"履虎尾，不咥人，亨", niInterpretation:"行事谨慎之卦，如履虎尾", divination:"小心谨慎可化险为夷"},
                {n:12, t:"天地否", upper:"乾", lower:"坤", meaning:"否之匪人，不利君子贞", niInterpretation:"天地不交，闭塞之象", divination:"诸事不顺，宜守待时"},
                {n:13, t:"天火同人", upper:"乾", lower:"离", meaning:"同人于野，亨，利涉大川", niInterpretation:"志同道合之卦", divination:"合作共事有利"},
                {n:25, t:"天雷无妄", upper:"乾", lower:"震", meaning:"元亨利贞", niInterpretation:"无妄之灾亦需坦然面对", divination:"正道而行可吉，妄动则凶"},
                {n:33, t:"天山遁", upper:"乾", lower:"艮", meaning:"亨，小利贞", niInterpretation:"退隐之卦，适时退避", divination:"宜退不宜进，暂避锋芒"},
                {n:44, t:"天风姤", upper:"乾", lower:"巽", meaning:"女壮，勿用取女", niInterpretation:"相遇之卦，一阴初生", divination:"偶然相遇，不宜深交"},
                {n:2, t:"坤为地", upper:"坤", lower:"坤", meaning:"元亨，利牝马之贞，地势坤，君子以厚德载物", niInterpretation:"纯阴之卦，柔顺承载", divination:"宜顺从，不宜主动"},
                {n:7, t:"地水师", upper:"坤", lower:"坎", meaning:"贞丈人吉，无咎", niInterpretation:"统兵之卦，需正义之师", divination:"行事需有正当名分"},
                {n:11, t:"地天泰", upper:"坤", lower:"乾", meaning:"小往大来，吉亨", niInterpretation:"天地交泰，通达之象", divination:"万事亨通，大吉"},
                {n:15, t:"地山谦", upper:"坤", lower:"艮", meaning:"亨，君子有终", niInterpretation:"谦逊之卦，唯一六爻皆吉之卦", divination:"谦虚谨慎，诸事吉利"},
                {n:19, t:"地泽临", upper:"坤", lower:"兑", meaning:"元亨利贞，至于八月有凶", niInterpretation:"亲临监督之卦，居高临下", divination:"可有所作为，但注意时效"},
                {n:24, t:"地雷复", upper:"坤", lower:"震", meaning:"亨，出入无疾，朋来无咎", niInterpretation:"一阳来复之卦，否极泰来", divination:"转机出现，渐入佳境"},
                {n:36, t:"地火明夷", upper:"坤", lower:"离", meaning:"利艰贞", niInterpretation:"光明损伤之卦，韬光养晦", divination:"宜隐藏光芒，低调行事"},
                {n:46, t:"地风升", upper:"坤", lower:"巽", meaning:"元亨，用见大人", niInterpretation:"上升之卦，步步高升", divination:"事业上升，宜见贵人"},
                {n:16, t:"雷地豫", upper:"震", lower:"坤", meaning:"利建侯行师", niInterpretation:"安乐和豫之卦，但不可过度", divination:"可有所作为，但勿过于安逸"},
                {n:32, t:"雷风恒", upper:"震", lower:"巽", meaning:"亨，无咎利贞，利有攸往", niInterpretation:"恒久不变之卦，持之以恒", divination:"坚持不懈可成功"},
                {n:34, t:"雷天大壮", upper:"震", lower:"乾", meaning:"利贞", niInterpretation:"刚强壮盛之卦，但壮不可妄动", divination:"力量充沛，但需守正"},
                {n:40, t:"雷水解", upper:"震", lower:"坎", meaning:"利西南，无所往", niInterpretation:"解除困难之卦，雨过天晴", divination:"困难解除，宜速行事"},
                {n:51, t:"震为雷", upper:"震", lower:"震", meaning:"亨，震来虩虩", niInterpretation:"震动之卦，初惊后安", divination:"先有惊扰，后可安定"},
                {n:54, t:"雷泽归妹", upper:"震", lower:"兑", meaning:"征凶，无攸利", niInterpretation:"少女出嫁之卦，位置不正", divination:"感情事宜需谨慎"},
                {n:55, t:"雷火丰", upper:"震", lower:"离", meaning:"亨，王假之", niInterpretation:"丰盛之卦，日中则昃", divination:"盛极必衰，宜居安思危"},
                {n:62, t:"雷山小过", upper:"震", lower:"艮", meaning:"亨利贞，可小事不可大事", niInterpretation:"小有过越之卦", divination:"小事可为，大事不宜"},
                {n:9, t:"风天小畜", upper:"巽", lower:"乾", meaning:"亨，密云不雨，自我西郊", niInterpretation:"小有积蓄之卦，力量不足以大成", divination:"小事可成，大事尚需等待"},
                {n:20, t:"风地观", upper:"巽", lower:"坤", meaning:"盥而不荐，有孚颙若", niInterpretation:"观察审视之卦，以下观上", divination:"宜观察形势，不宜冒进"},
                {n:37, t:"风火家人", upper:"巽", lower:"离", meaning:"利女贞", niInterpretation:"家庭和睦之卦", divination:"家庭事务吉利"},
                {n:42, t:"风雷益", upper:"巽", lower:"震", meaning:"利有攸往，利涉大川", niInterpretation:"损上益下之卦，有利可图", divination:"事业有益，宜大胆行动"},
                {n:53, t:"风山渐", upper:"巽", lower:"艮", meaning:"女归吉，利贞", niInterpretation:"循序渐进之卦", divination:"宜循序渐进，不可操之过急"},
                {n:57, t:"巽为风", upper:"巽", lower:"巽", meaning:"小亨，利有攸往", niInterpretation:"顺从之卦，柔顺渗透", divination:"宜顺势而为，不宜强行"},
                {n:59, t:"风水涣", upper:"巽", lower:"坎", meaning:"亨，王假有庙", niInterpretation:"涣散之卦，化解分散", divination:"团队涣散，需凝聚人心"},
                {n:61, t:"风泽中孚", upper:"巽", lower:"兑", meaning:"豚鱼吉，利涉大川", niInterpretation:"诚信之卦，至诚感通", divination:"诚信待人，可成大事"},
                {n:3, t:"水雷屯", upper:"坎", lower:"震", meaning:"元亨利贞，勿用有攸往", niInterpretation:"万物初生之象，创业维艰", divination:"初创时期，宜守不宜进"},
                {n:5, t:"水天需", upper:"坎", lower:"乾", meaning:"有孚，光亨贞吉，利涉大川", niInterpretation:"等待时机之卦，需要耐心", divination:"宜等待时机成熟再行动"},
                {n:8, t:"水地比", upper:"坎", lower:"坤", meaning:"吉，原筮元永贞，无咎", niInterpretation:"亲附比辅之卦，团结互助", divination:"宜寻求合作与结盟"},
                {n:29, t:"坎为水", upper:"坎", lower:"坎", meaning:"习坎，有孚，维心亨", niInterpretation:"重重险难之卦，但心诚可亨", divination:"困难重重，但坚守信念可过关"},
                {n:39, t:"水山蹇", upper:"坎", lower:"艮", meaning:"利西南，不利东北", niInterpretation:"行路艰难之卦", divination:"前路困难，宜结伴同行"},
                {n:48, t:"水风井", upper:"坎", lower:"巽", meaning:"改邑不改井", niInterpretation:"水井之卦，不变中的恒常", divination:"固守根本，不可轻易改变"},
                {n:60, t:"水泽节", upper:"坎", lower:"兑", meaning:"亨，苦节不可贞", niInterpretation:"节制之卦，适度为宜", divination:"凡事需节制，过犹不及"},
                {n:63, t:"水火既济", upper:"坎", lower:"离", meaning:"亨小，利贞，初吉终乱", niInterpretation:"事已成就之卦，但需谨防衰败", divination:"事情已成，但需注意善后"},
                {n:14, t:"火天大有", upper:"离", lower:"乾", meaning:"元亨", niInterpretation:"大丰收之卦，光明正大", divination:"事业丰盛，大有所获"},
                {n:21, t:"火雷噬嗑", upper:"离", lower:"震", meaning:"亨，利用狱", niInterpretation:"刑罚决断之卦，去除障碍", divination:"果断处理障碍，排除困难"},
                {n:30, t:"离为火", upper:"离", lower:"离", meaning:"利贞，亨，畜牝牛吉", niInterpretation:"光明附丽之卦，文明之象", divination:"宜守正道，光明正大"},
                {n:35, t:"火地晋", upper:"离", lower:"坤", meaning:"康侯用锡马蕃庶", niInterpretation:"日出地上之卦，步步高升", divination:"事业晋升，前途光明"},
                {n:38, t:"火泽睽", upper:"离", lower:"兑", meaning:"小事吉", niInterpretation:"背离分歧之卦，求同存异", divination:"小事可成，大事不宜"},
                {n:50, t:"火风鼎", upper:"离", lower:"巽", meaning:"元吉，亨", niInterpretation:"鼎新之卦，建立新制", divination:"事业更新，大吉"},
                {n:56, t:"火山旅", upper:"离", lower:"艮", meaning:"小亨，旅贞吉", niInterpretation:"旅行在外之卦", divination:"旅行出行小吉，需谨慎"},
                {n:64, t:"火水未济", upper:"离", lower:"坎", meaning:"亨，小狐汔济，濡其尾", niInterpretation:"尚未完成之卦，事在人为", divination:"事未完成，需继续努力"},
                {n:4, t:"山水蒙", upper:"艮", lower:"坎", meaning:"亨，匪我求童蒙，童蒙求我", niInterpretation:"启蒙教育之卦，需有耐心", divination:"求学问道有利，需虚心受教"},
                {n:18, t:"山风蛊", upper:"艮", lower:"巽", meaning:"元亨，利涉大川", niInterpretation:"整治积弊之卦，拨乱反正", divination:"需要整顿改革"},
                {n:22, t:"山火贲", upper:"艮", lower:"离", meaning:"亨，小利有攸往", niInterpretation:"文饰之卦，外在修饰", divination:"注重外表形式，小事可成"},
                {n:23, t:"山地剥", upper:"艮", lower:"坤", meaning:"不利有攸往", niInterpretation:"剥落衰败之卦", divination:"不宜行动，宜守静待变"},
                {n:26, t:"山天大畜", upper:"艮", lower:"乾", meaning:"利贞，不家食吉，利涉大川", niInterpretation:"大有积蓄之卦，厚积薄发", divination:"积累实力，蓄势待发"},
                {n:27, t:"山雷颐", upper:"艮", lower:"震", meaning:"贞吉，观颐，自求口实", niInterpretation:"养生颐养之卦", divination:"注意饮食养生，自力更生"},
                {n:41, t:"山泽损", upper:"艮", lower:"兑", meaning:"有孚，元吉，无咎", niInterpretation:"损下益上之卦，适当牺牲", divination:"有所舍才有所得"},
                {n:52, t:"艮为山", upper:"艮", lower:"艮", meaning:"艮其背，不获其身", niInterpretation:"止静之卦，适可而止", divination:"宜停止观望，不宜冒进"},
                {n:17, t:"泽雷随", upper:"兑", lower:"震", meaning:"元亨利贞，无咎", niInterpretation:"随顺之卦，择善而从", divination:"随机应变，顺势而行"},
                {n:28, t:"泽风大过", upper:"兑", lower:"巽", meaning:"栋桡，利有攸往，亨", niInterpretation:"阳气过盛之卦，过犹不及", divination:"事情过度，需要调整"},
                {n:31, t:"泽山咸", upper:"兑", lower:"艮", meaning:"亨利贞，取女吉", niInterpretation:"感应之卦，男女相感", divination:"感情婚姻大吉"},
                {n:43, t:"泽天夬", upper:"兑", lower:"乾", meaning:"扬于王庭", niInterpretation:"决断之卦，以阳决阴", divination:"需果断处理，不可犹豫"},
                {n:45, t:"泽地萃", upper:"兑", lower:"坤", meaning:"亨，王假有庙", niInterpretation:"聚集之卦，众志成城", divination:"聚集力量，团结协作"},
                {n:47, t:"泽水困", upper:"兑", lower:"坎", meaning:"亨贞，大人吉，无咎", niInterpretation:"困顿之卦，但大人可吉", divination:"身处困境，守正可渡"},
                {n:49, t:"泽火革", upper:"兑", lower:"离", meaning:"己日乃孚", niInterpretation:"变革之卦，革故鼎新", divination:"时机成熟可变革"},
                {n:58, t:"兑为泽", upper:"兑", lower:"兑", meaning:"亨利贞", niInterpretation:"喜悦之卦，和悦相处", divination:"和乐融融，社交有利"},
              ].filter(g => g.n === selectedGua).map(gua => (
                <div key={gua.n}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(107,184,224,0.15)', paddingBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6bb8e0', letterSpacing: '0.15em' }}>第{gua.n}卦</span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#f6efe0', marginLeft: '12px', letterSpacing: '0.08em' }}>{gua.t}</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginLeft: '12px' }}>{gua.upper}上 / {gua.lower}下</span>
                    </div>
                    <button onClick={() => setSelectedGua(null)} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', background: 'none', border: 'none', padding: '4px 8px' }}>收起 ✕</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#6bb8e0', letterSpacing: '0.3em', marginBottom: '8px' }}>卦辞</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>{gua.meaning}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#d4a843', letterSpacing: '0.3em', marginBottom: '8px' }}>倪师讲解</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>{gua.niInterpretation}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#10b981', letterSpacing: '0.3em', marginBottom: '8px' }}>断事要诀</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>{gua.divination}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* 倪师核心理念 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em', marginBottom: '4px' }}>PHILOSOPHY</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>倪师核心理念</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {title: '大道至简', desc: '不搞飞星派复杂四化，紫微斗数以三合派为正宗'},
              {title: '命宫为本', desc: '命宫主星决定格局，三方为用——三方四正才是完整人生'},
              {title: '命相同参', desc: '紫微斗数结合面相，两者验证可大幅提高准确率'},
              {title: '2/3大于1/3', desc: '人事+地理=2/3，先天命运=1/3，后天大于先天'},
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(212,168,67,0.12)', background: 'rgba(212,168,67,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4a843', marginBottom: '6px', letterSpacing: '0.08em' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
<footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>天纪 · 紫微斗数 · 基于倪海夏正宗体系 · 仅供学习参考</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>首页</a> · <a href="/tianji" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>天纪</a> · <a href="/diji" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>地纪</a> · <a href="/renji" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>人纪</a>
        </p>
      </footer>
    </div>
  );
}