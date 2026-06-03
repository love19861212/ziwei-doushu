'use client';
/**
 * 大限详解卡片
 * Oracle 站大限显示: 大限名/起止年龄/大限干/主星/四化/当前高亮
 *
 * 功能:
 *  - 12 大限列表 (10年一运)
 *  - 当前大限高亮
 *  - 大限四化 (基于宫干)
 *  - 大限主星 (显示该大限宫位的主星)
 *  - 点击切换大限
 */

import type { ZiweiChart, DaXian } from '@/lib/ziwei/types';
import { SI_HUA_TABLE, STEMS } from '@/lib/ziwei/constants';
import { useState } from 'react';

interface DaXianPanelProps {
  chart: ZiweiChart;
  currentIndex: number;
  onSelectDaXian?: (index: number) => void;
}

function getDaXianSiHua(stemIndex: number) {
  const stars = SI_HUA_TABLE[stemIndex];
  if (!stars) return null;
  return {
    禄: stars[0],
    权: stars[1],
    科: stars[2],
    忌: stars[3],
  };
}

function getDaXianMajorStars(chart: ZiweiChart, dx: DaXian) {
  const palace = chart.palaces.find(p => p.branch === dx.palaceBranch);
  if (!palace) return [];
  return palace.stars.filter(s => s.type === 'major').map(s => s.name);
}

export default function DaXianPanel({ chart, currentIndex, onSelectDaXian }: DaXianPanelProps) {
  const [expanded, setExpanded] = useState(true);
  if (!chart.daXians || chart.daXians.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg-0)',
      border: '1px solid var(--bdr)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* 标题栏 */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: expanded ? 'rgba(212,168,67,0.05)' : 'transparent',
          borderBottom: expanded ? '1px solid var(--bdr)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>⏳</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx-1)', letterSpacing: '0.1em' }}>
            大限流年
          </span>
          <span style={{ fontSize: '10px', color: 'var(--tx-3)' }}>
            ({chart.daXians.length}运 · 当前{chart.daXians[currentIndex]?.startAge}–{chart.daXians[currentIndex]?.endAge}岁)
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--tx-3)' }}>{expanded ? '收起' : '展开'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '8px 10px', maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {chart.daXians.map((dx, idx) => {
              const isCurrent = idx === currentIndex;
              const majorStars = getDaXianMajorStars(chart, dx);
              const siHua = dx.stemIndex !== undefined ? getDaXianSiHua(dx.stemIndex) : null;

              return (
                <button
                  key={idx}
                  onClick={() => onSelectDaXian?.(idx)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '6px',
                    background: isCurrent
                      ? 'rgba(212,168,67,0.15)'
                      : 'var(--t-surface, rgba(255,255,255,0.02))',
                    border: isCurrent
                      ? '1px solid var(--ac)'
                      : '1px solid var(--bdr)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--tx-1)',
                    fontSize: '10px',
                    lineHeight: 1.4,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px',
                  }}>
                    <span style={{ fontWeight: 600 }}>{dx.startAge}–{dx.endAge}岁</span>
                    {isCurrent && <span style={{ fontSize: '8px', color: 'var(--ac)' }}>●</span>}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--tx-3)' }}>
                    {dx.palaceName} · {dx.stemName || '?'}干
                  </div>
                  {majorStars.length > 0 && (
                    <div style={{ fontSize: '9px', color: 'var(--tx-2)', marginTop: '2px' }}>
                      {majorStars.slice(0, 2).join('·')}
                    </div>
                  )}
                  {siHua && (
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                      marginTop: '3px',
                      fontSize: '8px',
                    }}>
                      <span style={{ color: '#22c55e' }}>禄{siHua.禄.slice(0,1)}</span>
                      <span style={{ color: '#3b82f6' }}>权{siHua.权.slice(0,1)}</span>
                      <span style={{ color: '#eab308' }}>科{siHua.科.slice(0,1)}</span>
                      <span style={{ color: '#ef4444' }}>忌{siHua.忌.slice(0,1)}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
