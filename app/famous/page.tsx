'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme } from '@/components/ThemeProvider';
import FamousPersonCard from '@/components/FamousPersonCard';
import { FAMOUS_PERSONS } from '@/lib/ziwei/famous';
import type { FamousPerson } from '@/lib/ziwei/famous';

const CATEGORIES = ['全部', '商业', '文艺', '科技', '体育', '历史'] as const;
const CATEGORY_COLORS: Record<string, string> = {
  '全部': '#d4a843',
  '商业': '#4ade80',
  '文艺': '#c084fc',
  '科技': '#60a5fa',
  '体育': '#fb923c',
  '历史': '#facc15',
};

export default function FamousPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCat, setActiveCat] = useState<string>('全部');

  const filtered = activeCat === '全部'
    ? FAMOUS_PERSONS
    : FAMOUS_PERSONS.filter(p => p.category === activeCat);

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#020810' : '#fafaf9' }}>
      <StarField />
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2"
        style={{ background: '#020810' }}>
        <Link href="/" style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '0.3em', textDecoration: 'none' }}>
          ← 首页
        </Link>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>
          名人命盘
        </div>
        <Link href="/chart" style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '0.2em', textDecoration: 'none' }}>
          起盘 →
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.4))' }} />
            <span style={{ fontSize: '11px', color: '#d4a843', letterSpacing: '0.4em' }}>FAMOUS CHARTS</span>
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(212,168,67,0.4))' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#f6efe0', letterSpacing: '0.15em', marginBottom: '12px' }}>
            名人命盘库
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            基于公开出生记录整理，时辰为估算值<br />
            供紫微斗数研读参考，不代表任何现实对应
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                border: `1px solid ${activeCat === cat ? CATEGORY_COLORS[cat] : 'rgba(255,255,255,0.15)'}`,
                background: activeCat === cat ? `${CATEGORY_COLORS[cat]}18` : 'transparent',
                color: activeCat === cat ? CATEGORY_COLORS[cat] : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
              {cat !== '全部' && (
                <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                  {FAMOUS_PERSONS.filter(p => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 名人列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((person: FamousPerson) => (
            <FamousPersonCard key={person.id} person={person} />
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            命盘解读基于倪海夏《天纪》体系与《紫微斗数全书》古籍<br />
            仅供传统文化研读，不构成任何运势判断
          </p>
          <Link href="/chart" style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#d4a843',
            border: '1px solid rgba(212,168,67,0.4)',
            background: 'rgba(212,168,67,0.08)',
            textDecoration: 'none',
            letterSpacing: '0.1em',
          }}>
            探索自己的命盘 →
          </Link>
        </div>
      </div>

      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
          名人命盘库 · 基于倪海夏正宗体系 · 仅供参考研究
        </p>
      </footer>
    </div>
  );
}