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

const renjiAccent = '#8b6b9e';

export default function RenjiPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(139,107,158,0.12) 0%, transparent 60%)' }} />
        </div>
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="text-center" style={{ display: 'inline-block', padding: '26px clamp(28px,6vw,56px)', borderRadius: '20px', background: 'rgba(16,12,6,0.34)', backdropFilter: 'blur(3px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(139,107,158,0.4))' }} />
              <span style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.4em' }}>NI HAI XIA · REN JI</span>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(139,107,158,0.4))' }} />
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: '#f6efe0', letterSpacing: '0.2em', marginBottom: '12px' }}>人纪</h1>
            <p style={{ fontSize: '16px', color: renjiAccent, letterSpacing: '0.15em', marginBottom: '8px', fontWeight: 500 }}>中知人事</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', maxWidth: '640px', margin: '0 auto', lineHeight: 1.8 }}>
              涵盖 <strong style={{ color: renjiAccent }}>5</strong> 大经典 · <strong style={{ color: renjiAccent }}>35</strong> 个章节 · <strong style={{ color: renjiAccent }}>150+集</strong><br />
              2004-2005年完成 · 中医是物理医学
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
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', textDecoration: 'none', opacity: 0.7 }} href="/diji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊞</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>地纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>下知地理</div>
          </a>
          <a className="rounded-lg px-4 py-3 text-center transition-all" style={{ background: 'rgba(139,107,158,0.08)', border: '1px solid rgba(139,107,158,0.3)', textDecoration: 'none' }} href="/renji">
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>⊕</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.1em' }}>人纪</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>中知人事</div>
          </a>
        </div>
      </div>

      {/* 学习路线 */}
      <FadeIn>
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="text-center mb-6">
            <h2 style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.4em', marginBottom: '4px' }}>LEARNING PATH</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>学习路线</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>倪师指定的学习顺序，循序渐进</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { num: 1, title: '针灸大成' },
              { num: 2, title: '黄帝内经' },
              { num: 3, title: '神农本草经' },
              { num: 4, title: '伤寒论' },
              { num: 5, title: '金匮要略' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="rounded-full px-4 py-2 text-center" style={{ background: 'rgba(139,107,158,0.08)', border: '1px solid rgba(139,107,158,0.2)' }}>
                  <span style={{ fontSize: '10px', color: renjiAccent, fontWeight: 700, marginRight: '4px' }}>{item.num}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</span>
                </div>
                {i < 4 && <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* 五大经典 */}
      <FadeIn>
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.4em', marginBottom: '4px' }}>FIVE CLASSICS</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>五大经典课程</p>
          </div>
          <div className="space-y-6">

            {/* 针灸大成 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(139,107,158,0.12)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/zhenjiu">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-6" style={{ background: 'rgba(139,107,158,0.04)', borderRight: '1px solid rgba(139,107,158,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '22px' }}>⊕</span>
                    <span style={{ fontSize: '12px', color: renjiAccent, fontWeight: 700, background: 'rgba(139,107,158,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>第1课</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em', marginBottom: '4px' }}>针灸大成</h3>
                  <p style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.08em', marginBottom: '8px' }}>人纪第一课 · 经络穴位</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>44集（每集约44分钟）</p>
                  <div className="mt-4">
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', marginBottom: '4px' }}>参考典籍</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《针灸甲乙经》</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《针灸大成》</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>倪海厦《人纪·针灸》讲义</div>
                  </div>
                </div>
                <div className="md:w-2/3 px-6 py-6">
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>针灸是人纪的入门课程，依据《针灸甲乙经》和《针灸大成》讲授。通过经络穴位的学习，建立对人体气血运行的基本认知。</p>
                  <div className="space-y-3">
                    {[
                      { title: '经络总论', sub: '十二正经与奇经八脉', tags: ['十二正经：手三阴、手三阳、足三阴、足三阳', '奇经八脉：任、督、冲、带、阴维、阳维、阴跷、阳跷', '经络的气血流注时间（子午流注）'] },
                      { title: '穴位理论与定位', sub: '腧穴分类体系认知', tags: ['五输穴（井荥输经合）的分类原理', '原穴、络穴、俞穴、募穴的理论区别', '要穴举隅：百会、合谷、足三里、三阴交等的定位认知'] },
                      { title: '针灸临床思维举隅', sub: '辨经论治的思路', tags: ['辨经论治：先辨病在何经，再循经求理——这是针灸的思维内核', '同一症状、病在不同经，思路不同——针灸重「辨」不重「套方」', '整体观：针灸调的是气血阴阳之偏，非「头痛医头」'] },
                      { title: '针灸源流与典籍', sub: '甲乙经·针灸大成的传承', tags: ['《黄帝内经·灵枢》又称「针经」，是针灸理论的总源头', '晋·皇甫谧《针灸甲乙经》——第一部针灸学专著，确立腧穴系统', '明·杨继洲《针灸大成》——集历代针灸之大成，倪师教学底本'] },
                      { title: '子午流注', sub: '气血按时·时间医学', tags: ['十二时辰对应十二经气血流注的盛衰节律', '寅时肺、卯时大肠……按时辰循行一周的理论模型', '体现中医「天人相应」——人身节律应天时节律'] },
                      { title: '针道·中医思维', sub: '治神·得气·调气', tags: ['「治神」：《内经》言用针之要在治神——医患之神俱专', '「得气」：针下气至的理论概念，中医重「气」的体现', '「调气」：针灸的本质是调和气血阴阳之偏，非对抗'] },
                      { title: '针灸在人纪中的定位', sub: '为何是人纪第一课', tags: ['针灸先行：建立「经络脏腑气血」的人体模型认知', '不懂经络，后面《内经》《本草》《伤寒》《金匮》都接不上', '针灸是中医「最直观」的入门——经络可循、穴位可定'] },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(139,107,158,0.03)', border: '1px solid rgba(139,107,158,0.08)' }}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{item.sub}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-5 text-center" style={{ fontSize: '12px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
            </a>

            {/* 黄帝内经 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(139,107,158,0.12)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/neijing">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-6" style={{ background: 'rgba(139,107,158,0.04)', borderRight: '1px solid rgba(139,107,158,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '22px' }}>☯</span>
                    <span style={{ fontSize: '12px', color: renjiAccent, fontWeight: 700, background: 'rgba(139,107,158,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>第2课</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em', marginBottom: '4px' }}>黄帝内经</h3>
                  <p style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.08em', marginBottom: '8px' }}>人纪第二课 · 中医理论根基</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>20集（每集约1小时）</p>
                  <div className="mt-4">
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', marginBottom: '4px' }}>参考典籍</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《黄帝内经·素问》</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《黄帝内经·灵枢》</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>倪海厦《人纪·黄帝内经》讲义</div>
                  </div>
                </div>
                <div className="md:w-2/3 px-6 py-6">
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>《黄帝内经》是中医的理论根基，倪师通过讲解《素问》和《灵枢》，建立完整的中医哲学与诊断体系。</p>
                  <div className="space-y-3">
                    {[
                      { title: '阴阳五行', sub: '中医哲学基础', tags: ['阴阳的基本特征与相互关系', '五行（木火土金水）的生克关系', '五行与脏腑的对应：肝木、心火、脾土、肺金、肾水'] },
                      { title: '脏腑学说', sub: '五脏六腑的功能与关系', tags: ['五脏藏精气、六腑传化水谷', '脏腑表里关系：肝胆、心小肠、脾胃等', '气血津液的生成与运行'] },
                      { title: '四诊纲要', sub: '望闻问切的体系认知', tags: ['望诊：观面色、舌象、形神的理论概要', '闻诊：声音、气味辨识的原理', '问诊：寒热、汗、二便等问询的理论框架'] },
                      { title: '素问与灵枢', sub: '内经的典籍结构', tags: ['《素问》重医理哲学：阴阳五行、藏象、病机', '《灵枢》重经络针法，又称「针经」', '托名黄帝与岐伯问答，实为先秦两汉医家集成'] },
                      { title: '治未病思想', sub: '上工治未病·养生为本', tags: ['「上工治未病，不治已病」——预防重于治疗', '法于阴阳、和于术数、饮食有节、起居有常', '「恬惔虚无，真气从之」——形神共养的理念'] },
                      { title: '天人相应', sub: '中医的宇宙观', tags: ['人与天地相参，与日月相应——人身节律应天地', '四时养生：春生夏长秋收冬藏，养生须顺时', '五运六气：古人对气候与健康关系的理论模型'] },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(139,107,158,0.03)', border: '1px solid rgba(139,107,158,0.08)' }}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{item.sub}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-5 text-center" style={{ fontSize: '12px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
            </a>

            {/* 神农本草经 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(139,107,158,0.12)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/bencao">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-6" style={{ background: 'rgba(139,107,158,0.04)', borderRight: '1px solid rgba(139,107,158,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '22px' }}>⚘</span>
                    <span style={{ fontSize: '12px', color: renjiAccent, fontWeight: 700, background: 'rgba(139,107,158,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>第3课</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em', marginBottom: '4px' }}>神农本草经</h3>
                  <p style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.08em', marginBottom: '8px' }}>人纪第三课 · 药物学根基</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>46集（每集约1小时）</p>
                  <div className="mt-4">
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', marginBottom: '4px' }}>参考典籍</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《神农本草经》</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>倪海厦《人纪·神农本草经》讲义</div>
                  </div>
                </div>
                <div className="md:w-2/3 px-6 py-6">
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>《神农本草经》是中药学的鼻祖，倪师按上中下三品分类讲解365味药物的性味归经与临床运用。</p>
                  <div className="space-y-3">
                    {[
                      { title: '上品·分类思想', sub: '主养命 · 无毒', tags: ['《神农本草经》三品分类法：上品为首', '上品的归类标准：「主养命、无毒、久服不伤」', '人参、黄芪、甘草等被《本经》归入上品'] },
                      { title: '中品·分类思想', sub: '主养性 · 毒无毒斟酌', tags: ['中品居三品之中：介于「养」与「治」之间', '归类标准：「主养性、毒性需斟酌」', '当归、黄芩、白术等被《本经》归入中品'] },
                      { title: '下品·分类思想', sub: '主治病 · 多毒', tags: ['下品为三品之末：「主治病、多毒、不可久服」', '附子、大黄、巴豆等被《本经》归入下品', '「多毒不可久服」是古人难得的药物安全分级'] },
                      { title: '三品分类的思想', sub: '养命·养性·治病', tags: ['上品养命应天、中品养性应人、下品治病应地', '「上药无毒可久服」体现「以养为先」的传统', '下品多毒「不可久服」——古人早有用药安全意识'] },
                      { title: '性味归经理论', sub: '四气·五味·归经', tags: ['四气：寒热温凉——药物的寒热属性建模', '五味：酸苦甘辛咸——味对应不同作用趋向', '归经：药物作用「归属」某经脏腑的理论模型'] },
                      { title: '本草源流与辨伪', sub: '本经传承·药材文化', tags: ['《本经》托名神农，成于汉代，是现存最早药学专著', '后世发展：《本草经集注》《新修本草》《本草纲目》', '「药有真假，辨之不可不慎」——倪师强调药材辨别'] },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(139,107,158,0.03)', border: '1px solid rgba(139,107,158,0.08)' }}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{item.sub}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-5 text-center" style={{ fontSize: '12px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
            </a>

            {/* 伤寒论 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(139,107,158,0.12)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/shanghan">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-6" style={{ background: 'rgba(139,107,158,0.04)', borderRight: '1px solid rgba(139,107,158,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '22px' }}>⚕</span>
                    <span style={{ fontSize: '12px', color: renjiAccent, fontWeight: 700, background: 'rgba(139,107,158,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>第4课</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em', marginBottom: '4px' }}>伤寒论</h3>
                  <p style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.08em', marginBottom: '8px' }}>人纪第四课 · 辨证论治典范</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>伤寒论原版DVD（每集约2小时）</p>
                  <div className="mt-4">
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', marginBottom: '4px' }}>参考典籍</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《伤寒论》（张仲景）</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>倪海厦《人纪·伤寒论》讲义</div>
                  </div>
                </div>
                <div className="md:w-2/3 px-6 py-6">
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>张仲景《伤寒论》是中医辨证论治的典范之作，倪师逐条讲解六经辨证体系与经方运用。</p>
                  <div className="space-y-3">
                    {[
                      { title: '六经辨证总论', sub: '太阳阳明少阳太阴少阴厥阴', tags: ['太阳病：表证的理论纲领（恶寒发热、头痛项强）', '阳明病：里实热证的理论纲领（壮热、大渴）', '少阳病：半表半里的理论纲领（往来寒热）'] },
                      { title: '经方组方思想', sub: '桂枝汤等方义的学术解读', tags: ['经方的组方逻辑：君臣佐使、有制之师', '桂枝汤「调和营卫」的组方思想', '方证相应是经方学术核心：方与证的对应「关系」'] },
                      { title: '方证辨析', sub: '同病异治与异病同治', tags: ['辨证而非辨病：抓的是证型而非病名', '方证对应：方与证候群的对应关系', '经方加减的理论原理——「随证治之」的思维'] },
                      { title: '张仲景与伤寒源流', sub: '医圣·伤寒杂病论', tags: ['张仲景「勤求古训，博采众方」，被尊为「医圣」', '《伤寒杂病论》原书散佚，经王叔和整理、林亿等校注', '伤寒论部分论外感，金匮要略部分论杂病——原本一书'] },
                      { title: '六经传变体系', sub: '三阴三阳·传经规律', tags: ['三阳（太阳阳明少阳）主表里热实，三阴主虚寒', '传经：病邪由表入里、由阳入阴的传变路径模型', '直中、合病、并病——传变的多种情形'] },
                      { title: '辨证论治方法论', sub: '中医临证思维精髓', tags: ['辨证而非辨病：抓证型，不抓病名', '方证对应：有是证用是方，证变方变', '同病异治、异病同治——辨证论治的两面'] },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(139,107,158,0.03)', border: '1px solid rgba(139,107,158,0.08)' }}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{item.sub}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-5 text-center" style={{ fontSize: '12px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
            </a>

            {/* 金匮要略 */}
            <a className="block rounded-xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ border: '1px solid rgba(139,107,158,0.12)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', textDecoration: 'none' }} href="/sanji/jingui">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 px-6 py-6" style={{ background: 'rgba(139,107,158,0.04)', borderRight: '1px solid rgba(139,107,158,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '22px' }}>⚗</span>
                    <span style={{ fontSize: '12px', color: renjiAccent, fontWeight: 700, background: 'rgba(139,107,158,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>第5课</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em', marginBottom: '4px' }}>金匮要略</h3>
                  <p style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.08em', marginBottom: '8px' }}>人纪第五课 · 杂病诊治大成</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>20集（每集约1小时）</p>
                  <div className="mt-4">
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', marginBottom: '4px' }}>参考典籍</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>《金匮要略》（张仲景）</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', opacity: 0.7 }}>倪海厦《人纪·金匮要略》讲义</div>
                  </div>
                </div>
                <div className="md:w-2/3 px-6 py-6">
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '12px' }}>张仲景《金匮要略》是中医杂病治疗的最高经典，倪师讲解各种内科杂病的辨证论治方法。</p>
                  <div className="space-y-3">
                    {[
                      { title: '杂病总论', sub: '病因病机与治则', tags: ['内伤杂病与外感病的理论区别', '五脏风寒的辨证理论', '虚实寒热的鉴别要点'] },
                      { title: '痰饮水气', sub: '痰饮四类的辨证理论', tags: ['痰饮四类的理论鉴别', '水气病的理论分型（风水、皮水、正水、石水）', '经方在痰饮水气辨证中的理论定位'] },
                      { title: '妇人病与杂病各论', sub: '妇科与各科杂病的辨证理论', tags: ['妊娠病的辨证理论概要', '产后三大病的理论框架（痉、郁冒、大便难）', '黄疸的辨证分型'] },
                      { title: '金匮与伤寒的关系', sub: '一书两分·外感与杂病', tags: ['伤寒论主外感（六经辨证），金匮主内伤杂病', '二者合则为张仲景完整的临证体系', '金匮以「病」分篇，伤寒以「经」分病——辨证框架不同'] },
                      { title: '杂病辨证体系', sub: '脏腑经络·病机统摄', tags: ['「脏腑经络先后病脉证」是金匮辨证总纲', '以病机统杂病：痰饮、水气、虚劳、瘀血等病类', '同一病机可统不同病症——执简驭繁的思维'] },
                      { title: '治未病与既病防变', sub: '上工之治·见微知著', tags: ['「见肝之病，知肝传脾，当先实脾」——既病防传', '上工治未病：未病先防、已病防传、瘥后防复', '「四季脾旺不受邪」——扶正以防变的思路'] },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg px-4 py-3" style={{ background: 'rgba(139,107,158,0.03)', border: '1px solid rgba(139,107,158,0.08)' }}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{item.sub}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-5 text-center" style={{ fontSize: '12px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.08em' }}>进入该学科 · 全文精解 →</div>
            </a>

          </div>
        </div>
      </FadeIn>

      {/* 倪师医学理念 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.4em', marginBottom: '4px' }}>PHILOSOPHY</h2>
            <p style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.15em' }}>倪师医学理念</p>
          </div>
          <div className="space-y-4">
            {[
              { title: '中医是物理医学', desc: '从物理的角度分析人的身体，阴阳寒热虚实是最基本的物理状态。' },
              { title: '经方一剂知，二剂已', desc: '张仲景的经方是最高效的治疗工具，精确辨证后往往一两剂即可见效。' },
              { title: '辨证不辨病', desc: '中医看的是证型而非病名，同一疾病可有不同证型，不同疾病可有相同证型。' },
              { title: '严选传人', desc: '传人需具备心性好、个性强、主见强、敏锐观察力和勇于批判错误理论的特质。' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg px-5 py-4" style={{ border: '1px solid rgba(139,107,158,0.12)', background: 'rgba(139,107,158,0.03)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: renjiAccent, letterSpacing: '0.08em', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* 天纪/地纪 导航 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="flex flex-col sm:flex-row gap-3">
            <a className="flex-1 rounded-lg px-5 py-4 text-center transition-all" style={{ border: '1px solid rgba(212,168,67,0.3)', background: 'rgba(212,168,67,0.06)', textDecoration: 'none' }} href="/tianji">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#d4a843', letterSpacing: '0.1em' }}>← 天纪</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>紫微斗数 / 易经 / 堪舆</div>
            </a>
            <a className="flex-1 rounded-lg px-5 py-4 text-center transition-all" style={{ border: '1px solid rgba(107,138,94,0.3)', background: 'rgba(107,138,94,0.06)', textDecoration: 'none' }} href="/diji">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b8a5e', letterSpacing: '0.1em' }}>地纪 →</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>倪师未竟之业 / 堪舆理论</div>
            </a>
          </div>
        </div>
      </FadeIn>

      {/* 本纪原典 */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', color: renjiAccent, letterSpacing: '0.3em', marginBottom: '6px' }}>ORIGINAL CLASSICS</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em' }}>本纪原典 · 原文研读</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '6px', lineHeight: 1.7 }}>《黄帝内经·素问》哲理养生纲领 —— 作传统医学文化研读，不构成诊疗建议，身体不适请就医</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a className="flex-1 rounded-lg px-5 py-4 transition-all" style={{ border: '1px solid rgba(139,107,158,0.25)', background: 'rgba(139,107,158,0.05)', textDecoration: 'none' }} href="/library/huangdineijing">
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.15em', marginBottom: '4px' }}>先秦两汉 · 托名黄帝</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.08em', marginBottom: '6px' }}>《黄帝内经·素问》</div>
              <div style={{ fontSize: '11px', color: renjiAccent }}>3 章 · 9 段精解 →</div>
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <a style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', textDecoration: 'underline', letterSpacing: '0.08em' }} href="/library">进入古籍原典库 · 天地人三纪全文检索 →</a>
          </div>
        </div>
      </FadeIn>

      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>人纪 · 基于倪海厦正宗中医教学体系 · 仅供学习参考 · 不构成任何医疗建议</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}>首页</a> · <a href="/tianji" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}>天纪</a> · <a href="/diji" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}>地纪</a>
        </p>
      </footer>
    </div>
  );
}