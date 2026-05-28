'use client';
import { useRef } from 'react';
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

export default function DijiPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const dijiAccent = '#8ab87e';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#020810' : '#fafaf9' }}>
      <StarField />
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

      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #020810 0%, rgba(2,8,16,0.5) 50%, #020810 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(107,138,94,0.12) 0%, transparent 60%)' }} />
        </div>
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="text-center" style={{ display: 'inline-block', padding: '26px clamp(28px,6vw,56px)', borderRadius: '20px', background: 'rgba(16,12,6,0.34)', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(107,138,94,0.4))' }} />
              <span style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.4em' }}>NI HAI XIA · DI JI</span>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(107,138,94,0.4))' }} />
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: '#f6efe0', letterSpacing: '0.2em', marginBottom: '12px' }}>地纪</h1>
            <p style={{ fontSize: '16px', color: '#8ab87e', letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 500 }}>下知地理</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', maxWidth: '640px', margin: '0 auto', lineHeight: 1.8 }}>
              涵盖 <strong style={{ color: '#8ab87e' }}>3</strong> 个模块 · <strong style={{ color: '#8ab87e' }}>18</strong> 个章节<br />
              倪师未竟之业 · 后辈持续整理中
            </p>
          </div>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-3 gap-3">
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', textDecoration: 'none', opacity: 0.7 }} href="/tianji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊙</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>天纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>上知天文</div>
          </a>
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'rgba(107,138,94,0.08)', border: '1px solid rgba(107,138,94,0.3)', textDecoration: 'none' }} href="/diji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊞</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#8ab87e', letterSpacing: '0.1em' }}>地纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>下知地理</div>
          </a>
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', textDecoration: 'none', opacity: 0.7 }} href="/renji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊕</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>人纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>中知人事</div>
          </a>
        </div>
      </div>

      {/* 地纪介绍区块 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="rounded-xl px-6 py-6 text-center" style={{ border: '1px solid rgba(107,138,94,0.2)', background: 'rgba(107,138,94,0.04)' }}>
            <p style={{ fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.85)' : '#333', lineHeight: 1.8, letterSpacing: '0.05em' }}>地纪是倪海厦三大著作体系中最后计划完成的部分。</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginTop: '8px' }}>倪师原计划60岁后著述，以天文地理知识与医学素养重新编写各国地理志， 研究国家人性、物产与其风水地理的关系。</p>
            <p style={{ fontSize: '13px', color: '#8ab87e', lineHeight: 1.8, marginTop: '8px', fontStyle: 'italic' }}>2012年倪师辞世，地纪成为「倪师未竟之业」。 现有内容来自天纪课程中的堪舆学部分以及后人整理的遗稿。</p>
          </div>
        </div>
      </FadeIn>

      {/* 内容模块 */}
      <FadeIn>
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.4em', marginBottom: '4px' }}>MODULES</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>内容模块</p>
          </div>
          <div className="space-y-6">

            {/* 模块1：国家地理志 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/geography">
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: '22px', color: '#8ab87e' }}>⊞</span>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.1em', marginBottom: '2px' }}>国家地理志</h3>
                    <p style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.08em' }}>倪师未竟之业 · 遗稿研读</p>
                  </div>
                  <div className="ml-auto">
                    <span style={{ fontSize: '9px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '9999px' }}>已整理</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>倪师计划以风水地理知识解读各国地理环境对国民性格、物产资源、国运兴衰的影响。这是倪师未能完成的宏愿。</p>
                <div className="mb-4">
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '6px' }}>地纪是倪海厦三大著作体系中最后计划完成的部分，原定60岁后开始著述。</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '6px' }}>核心设想是用风水地理知识重新编写各国地理志，将传统堪舆学应用于宏观国家层面。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: '地纪缘起', sub: '倪师的宏愿与蓝图', desc: '地纪是倪师三大著作体系中最后计划着手的部分。本章梳理这一构想的缘起与整体蓝图——这是「未竟之业」，研读的是方法论与思路，而非已成之书。', quotes: ['"我想在六十岁以后，利用我的天文地理知识与医学素养来重新写过地理志"', '"地纪是我最后要做的——可惜时间不一定够"'] },
                    { title: '地理与人性', sub: '一方水土养一方人', desc: '地纪的核心命题之一：不同地理环境如何塑造不同的群体性格与文化气质。这是传统「风土」思想的现代延伸，作文化研读。', quotes: ['"一方水土养一方人——这句老话里有真东西"', '"人是被他脚下那块地养出来的，自己常常不知道"'] },
                    { title: '山川形势与气运', sub: '龙脉·形势·都会选址', desc: '把堪舆的「峦头形势」思路放大到宏观尺度，看山川大势如何关联一地一国的气运。本章讲传统方法论框架，举例取历史，不涉当代政治判断。', quotes: ['"看一个地方的大势，先看它的山和水怎么走"', '"形势是底子，人怎么用这块地才是关键"'] },
                    { title: '物产与风土', sub: '资源·风土·民生气质', desc: '地纪设想的另一支：一地的物产资源与其风土格局的关系，以及物产如何反过来塑造民生气质。', quotes: ['"一块地出什么、不出什么，把那里的人也塑造成什么样子"'] },
                    { title: '历史地理变迁', sub: '沧海桑田·因革损益', desc: '地理并非恒定——河流改道、海陆变迁、气候涨落，皆与历史治乱有深层关联。地纪关注这种长时段的「地变」与「世变」之应。', quotes: ['"地是慢慢变的，一变就是几百年——但它一动，世道就跟着动"'] },
                    { title: '三纪贯通', sub: '天地人·一以贯之', desc: '地纪不是孤立的风水学，而是倪师「天地人」整体学问的一环。本章讲地纪与天纪、人纪如何一以贯之。', quotes: ['"天纪、地纪、人纪是一套东西，不是三套——分开学，学不通"', '"人事的努力加上地理上的调整，一定能大于先天的命运"'] },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(107,138,94,0.03)', border: '1px solid rgba(107,138,94,0.08)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', marginBottom: '2px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#8ab87e', marginBottom: '4px' }}>{item.sub}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.desc}</div>
                      <div className="mt-2" style={{ borderLeft: '2px solid rgba(107,138,94,0.3)', paddingLeft: '8px' }}>
                        {item.quotes.map((q, j) => (
                          <p key={j} style={{ fontSize: '11px', color: '#8ab87e', fontStyle: 'italic', lineHeight: 1.5 }}>{q}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(107,138,94,0.12)', fontSize: '12px', fontWeight: 600, color: '#8ab87e', letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
              </div>
            </a>

            {/* 模块2：堪舆理论基础 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/kanyu-theory">
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: '22px', color: '#8ab87e' }}>◫</span>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.1em', marginBottom: '2px' }}>堪舆理论基础</h3>
                    <p style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.08em' }}>天纪堪舆学 · 理论整理</p>
                  </div>
                  <div className="ml-auto">
                    <span style={{ fontSize: '9px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '9999px' }}>已整理</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>整理自天纪课程中的堪舆学理论部分，作为地纪的理论基础。包括峦头学、理气学、阳宅学等核心理论。</p>
                <div className="mb-4">
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '6px' }}>虽然地纪未能独立成书，但天纪课程中已包含丰富的堪舆学理论内容。</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '6px' }}>倪师采用九星派（杨救贫流派），注重峦头与理气并重。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: '堪舆源流', sub: '形势·理气两大派', desc: '本模块是地纪的「理论预科」——把散在天纪的堪舆理论体系化整理。先理清堪舆的源流与两大派分野，作传统文化研读。', quotes: ['"堪舆不是迷信，是古人观天察地总结出来的一套环境学问"', '"形势、理气两边都要会——只会一边的，路走不远"'] },
                    { title: '峦头学', sub: '山形水势的判断', desc: '峦头学是形势派的核心——通过山的形状走向、水的流向聚散来判断一地的生气。这是堪舆的「体」。', quotes: ['"先看峦头——山水形势不对，方位算得再准也没用"'] },
                    { title: '理气学', sub: '方位吉凶的推算', desc: '理气学是理气派的核心——以罗盘格定方位，结合九星、八煞黄泉等推算方位吉凶。这是堪舆的「用」。', quotes: ['"理气是把好气收进来的方法，不是拿来救烂地的"'] },
                    { title: '罗盘与二十四山', sub: '理气的工具体系', desc: '罗盘是理气派的核心工具。理清二十四山与罗盘层理，才能读懂理气的方位语言。', quotes: ['"盘是死的，会不会看形势，决定你这盘拿得对不对"'] },
                    { title: '九星体系', sub: '贪巨禄文廉武破辅弼', desc: '九星派以九星论山形与方位之吉凶，是倪师所取一脉的理论核心。本章梳理九星的象义框架。', quotes: ['"九星看山形——山长什么样，就知道它是哪颗星，主什么"'] },
                    { title: '阳宅理论', sub: '宅法的理论框架', desc: '阳宅是堪舆中与人最近、最易见效的部分。本章梳理阳宅判断的理论框架（实操细则见天纪堪舆学篇）。', quotes: ['"阳宅最实用——住对了，运气几个月就跟着变"', '"门、主、灶三样，是阳宅的纲"'] },
                    { title: '峦头理气合参', sub: '体用合一·理论总纲', desc: '峦头为体、理气为用，二者合参方为完整堪舆。本章是理论篇的总纲，也是通往天纪堪舆学实操篇的桥梁。', quotes: ['"峦头是体、理气是用——合起来才是堪舆，分开都是半吊子"', '"形和理对得上，这地才敢用"'] },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(107,138,94,0.03)', border: '1px solid rgba(107,138,94,0.08)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', marginBottom: '2px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#8ab87e', marginBottom: '4px' }}>{item.sub}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.desc}</div>
                      <div className="mt-2" style={{ borderLeft: '2px solid rgba(107,138,94,0.3)', paddingLeft: '8px' }}>
                        {item.quotes.map((q, j) => (
                          <p key={j} style={{ fontSize: '11px', color: '#8ab87e', fontStyle: 'italic', lineHeight: 1.5 }}>{q}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(107,138,94,0.12)', fontSize: '12px', fontWeight: 600, color: '#8ab87e', letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
              </div>
            </a>

            {/* 模块3：遗稿与后学 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/legacy">
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: '22px', color: '#8ab87e' }}>⊟</span>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.1em', marginBottom: '2px' }}>遗稿与后学</h3>
                    <p style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.08em' }}>后辈补注 · 薪火相传</p>
                  </div>
                  <div className="ml-auto">
                    <span style={{ fontSize: '9px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '9999px' }}>已整理</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>整理倪师关于地纪的零散讲述、后辈学生的研究补注，以及地纪思想的现代延伸。</p>
                <div className="mb-4">
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '6px' }}>倪师虽未完成地纪专著，但在天纪课程和其他场合多次提及地纪的构想和要点。</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '6px' }}>后辈学生和研究者根据倪师的讲述和遗稿，进行了一定程度的整理和补注。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: '倪师地纪语录', sub: '散见于各课程的地纪思想', desc: '地纪虽未成书，但倪师在天纪、人纪课程中多次谈及。本章辑录这些散见论述，是研读地纪最直接的一手依据。', quotes: ['"人事的努力加上地理上的调整，一定能大于先天的命运"', '"2/3 大于 1/3——人事＋地理＝2/3，先天命运＝1/3"'] },
                    { title: '未竟之业的脉络', sub: '为何地纪没有完成', desc: '地纪是倪师三大体系中唯一未及着述者。理清这段「未竟」的来龙去脉，是诚实研读地纪的前提。', quotes: ['"地纪是我最后要做的——可惜时间不一定够"', '"没写完的东西，后人不要乱替我补——那不是我的意思"'] },
                    { title: '天纪中的地纪种子', sub: '堪舆学即地纪的理论基础', desc: '地纪虽未成书，但其方法论根基已大量见于天纪的堪舆部分。本章梳理「地纪的种子其实埋在天纪里」。', quotes: ['"地纪的底子，其实我在天纪堪舆里都讲了——只是没单独写成一本"'] },
                    { title: '地纪思想的现代参照', sub: '与现代学科的对话', desc: '地纪「地理塑造人、人调整地理」的思路，与现代若干学科可相互参照。本章作思想价值的中性梳理，不夸大、不附会。', quotes: ['"古人看地的那套整体思路，今天换个说法，还是有用的"'] },
                    { title: '薪火相传', sub: '后学的整理态度', desc: '地纪能否传续，取决于后学以什么态度对待这份残稿。本章谈传承的方法与底线。', quotes: ['"学问要老实——不知道就说不知道，这比什么都重要"', '"我教这么多学生，是不想这套东西失传"'] },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(107,138,94,0.03)', border: '1px solid rgba(107,138,94,0.08)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', marginBottom: '2px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#8ab87e', marginBottom: '4px' }}>{item.sub}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.desc}</div>
                      <div className="mt-2" style={{ borderLeft: '2px solid rgba(107,138,94,0.3)', paddingLeft: '8px' }}>
                        {item.quotes.map((q, j) => (
                          <p key={j} style={{ fontSize: '11px', color: '#8ab87e', fontStyle: 'italic', lineHeight: 1.5 }}>{q}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(107,138,94,0.12)', fontSize: '12px', fontWeight: 600, color: '#8ab87e', letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
              </div>
            </a>
          </div>
        </div>
      </FadeIn>

      {/* 地纪核心概念 */}
      <FadeIn>
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.4em', marginBottom: '4px' }}>CORE CONCEPTS</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>地纪核心概念</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>倪师将地理对人生的影响归纳为三个层面</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl px-5 py-5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: 'rgba(107,138,94,0.03)' }}>
              <div className="text-2xl mb-3">🏔</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#5a9a4e', letterSpacing: '0.08em', marginBottom: '2px' }}>宏观地理</h3>
              <p style={{ fontSize: '10px', color: '#8ab87e', letterSpacing: '0.1em', marginBottom: '8px' }}>国家·城市·区域</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>一个国家的山川河流走势、地形地貌特征，直接影响该国国运兴衰与人民性格。倪师计划以地理志形式记录各国风水格局。</p>
            </div>
            <div className="rounded-xl px-5 py-5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: 'rgba(107,138,94,0.03)' }}>
              <div className="text-2xl mb-3">🏠</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#8ab87e', letterSpacing: '0.08em', marginBottom: '2px' }}>阳宅风水</h3>
              <p style={{ fontSize: '10px', color: '#8ab87e', letterSpacing: '0.1em', marginBottom: '8px' }}>居住·办公·布局</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>住宅的方位、格局、采光通风，按八卦方位各对应家庭不同成员。宅院之气顺则家运昌盛，逆则诸事不顺。</p>
            </div>
            <div className="rounded-xl px-5 py-5" style={{ border: '1px solid rgba(107,138,94,0.15)', background: 'rgba(107,138,94,0.03)' }}>
              <div className="text-2xl mb-3">⛰</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#aabf8b', letterSpacing: '0.08em', marginBottom: '2px' }}>阴宅选址</h3>
              <p style={{ fontSize: '10px', color: '#8ab87e', letterSpacing: '0.1em', marginBottom: '8px' }}>祖坟·地脉·龙穴</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>祖先安葬地点的风水格局，影响后代子孙运势。倪师采九星派理论，结合山形水势综合判断吉凶。</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 阳宅八方概要 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.4em', marginBottom: '4px' }}>YANG ZHAI BA FANG</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>阳宅八方概要</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>倪师以后天八卦对应住宅八个方位，各主不同家庭成员</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { gua: '乾', pos: '西北', trigram: '天', member: '父亲', color: '#8ab87e' },
              { gua: '坤', pos: '西南', trigram: '地', member: '母亲', color: '#8a7e5e' },
              { gua: '震', pos: '正东', trigram: '雷', member: '长子', color: '#5e8a6b' },
              { gua: '巽', pos: '东南', trigram: '风', member: '长女', color: '#6b8a7e' },
              { gua: '坎', pos: '正北', trigram: '水', member: '中男', color: '#5e6b8a' },
              { gua: '离', pos: '正南', trigram: '火', member: '中女', color: '#8a5e5e' },
              { gua: '艮', pos: '东北', trigram: '山', member: '少男', color: '#7e6b5e' },
              { gua: '兑', pos: '正西', trigram: '泽', member: '少女', color: '#5e7e8a' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg px-3 py-3 text-center" style={{ border: `1px solid ${item.color}30`, background: `${item.color}08` }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: item.color, marginBottom: '2px' }}>{item.gua}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>{item.pos} · {item.trigram}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333' }}>{item.member}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>以上为后天八卦方位系统，倪师强调查看住宅各方位的缺损与凸出，即可判断对应家庭成员的运势影响。</p>
        </div>
      </FadeIn>

      {/* 倪师论地纪 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.4em', marginBottom: '4px' }}>NI'S WORDS</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>倪师论地纪</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg px-6 py-5 text-center" style={{ border: '1px solid rgba(107,138,94,0.15)', background: 'rgba(107,138,94,0.04)' }}>
              <p style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.85)' : '#333', lineHeight: 1.8, fontStyle: 'italic', letterSpacing: '0.05em' }}>"人事的努力加上地理上的调整，一定能大于先天的命运"</p>
              <p style={{ fontSize: '12px', color: '#8ab87e', marginTop: '8px' }}>—— 2/3 大于 1/3 理论</p>
            </div>
            <div className="rounded-lg px-6 py-5 text-center" style={{ border: '1px solid rgba(107,138,94,0.15)', background: 'rgba(107,138,94,0.04)' }}>
              <p style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.85)' : '#333', lineHeight: 1.8, fontStyle: 'italic', letterSpacing: '0.05em' }}>"我想在六十岁以后，利用我的天文地理知识与医学素养来重新写过地理志"</p>
              <p style={{ fontSize: '12px', color: '#8ab87e', marginTop: '8px' }}>—— 论地纪创作规划</p>
            </div>
            <div className="rounded-lg px-6 py-5 text-center" style={{ border: '1px solid rgba(107,138,94,0.15)', background: 'rgba(107,138,94,0.04)' }}>
              <p style={{ fontSize: '16px', color: isDark ? 'rgba(255,255,255,0.85)' : '#333', lineHeight: 1.8, fontStyle: 'italic', letterSpacing: '0.05em' }}>"我不希望这些中华文化失传，所以就教了许多学生"</p>
              <p style={{ fontSize: '12px', color: '#8ab87e', marginTop: '8px' }}>—— 论文化传承</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 天纪/人纪 导航 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="flex flex-col sm:flex-row gap-3">
            <a className="flex-1 rounded-lg px-5 py-4 text-center transition-all" style={{ border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.06)', textDecoration: 'none' }} href="/tianji">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4a843', letterSpacing: '0.1em' }}>← 天纪</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>紫微斗数 / 易经 / 堪舆</div>
            </a>
            <a className="flex-1 rounded-lg px-5 py-4 text-center transition-all" style={{ border: '1px solid rgba(139,107,158,0.3)', background: 'rgba(139,107,158,0.06)', textDecoration: 'none' }} href="/renji">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#8b6b9e', letterSpacing: '0.1em' }}>人纪 →</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>针灸 / 内经 / 本草 / 伤寒 / 金匮</div>
            </a>
          </div>
        </div>
      </FadeIn>

      {/* 本纪原典 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', color: '#8ab87e', letterSpacing: '0.3em', marginBottom: '6px' }}>ORIGINAL CLASSICS</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', letterSpacing: '0.12em' }}>本纪原典 · 原文研读</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', lineHeight: 1.7 }}>形势派《葬书》与理气派《青囊经》两大堪舆祖经 —— 作传统堪舆文化研读，先读《葬书》明形势</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a className="flex-1 rounded-lg px-5 py-4 transition-all" style={{ border: '1px solid rgba(107,138,94,0.25)', background: 'rgba(107,138,94,0.05)', textDecoration: 'none' }} href="/library/zangshu">
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em', marginBottom: '4px' }}>东晋 · 郭璞</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', letterSpacing: '0.08em', marginBottom: '6px' }}>《葬书》</div>
              <div style={{ fontSize: '11px', color: '#8ab87e' }}>3 章 · 9 段精解 →</div>
            </a>
            <a className="flex-1 rounded-lg px-5 py-4 transition-all" style={{ border: '1px solid rgba(107,138,94,0.25)', background: 'rgba(107,138,94,0.05)', textDecoration: 'none' }} href="/library/qingnangjing">
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em', marginBottom: '4px' }}>秦汉 · 相传黄石公</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#333', letterSpacing: '0.08em', marginBottom: '6px' }}>《青囊经》</div>
              <div style={{ fontSize: '11px', color: '#8ab87e' }}>3 章 · 9 段精解 →</div>
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <a style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textDecoration: 'underline', letterSpacing: '0.08em' }} href="/library">进入古籍原典库 · 天地人三纪全文检索 →</a>
          </div>
        </div>
      </FadeIn>

      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>地纪 · 基于倪海厦正宗体系 · 仅供学习参考</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>首页</a> · <a href="/tianji" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>天纪</a> · <a href="/diji" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>地纪</a> · <a href="/renji" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'underline' }}>人纪</a>
        </p>
      </footer>
    </div>
  );
}