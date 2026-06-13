'use client';
/**
 * TimeAxisGrid — 仿文墨天机的"命盘下面 5 行时间轴 grid"
 * 2026-06-13: 替代原 DaXianPanel 单一 grid
 *
 * 5 行 (从大到小):
 *   大限 (金色) — 12 大限, 来自 chart.daXians
 *   流年 (紫色) — 13 流年 (出生年 ±6)
 *   流月 (蓝色) — 12 月, 带月干 (五虎遁)
 *   流日 (青色) — 30 天, 带日干
 *   流时 (灰色) — 12 时辰, 带时干 (五鼠遁)
 *
 * 交互:
 *   - 点击任一格子 → 切命盘视角 (回调到 ChartPageClient)
 *   - TopBar 当前选中的 view 对应行高亮 (label 金色边框 + 整行背景淡色)
 *   - 移动端默认只显示 TopBar 选中那 1 行 (5 行太长)
 */

import { useRef, useEffect } from 'react';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { STEMS, SI_HUA_TABLE, BRANCHES } from '@/lib/ziwei/constants';
import { getYearStemIndex, getMonthStemIndex, getDayStemIndex, getHourStemIndex } from './TimeNav';

export type TimeView = 'mingpan' | 'daxian' | 'liunian' | 'liuyue' | 'liuri' | 'liushi';

interface TimeAxisGridProps {
  chart: ZiweiChart;
  view: TimeView;
  // 当前选中 (与 chart 状态一致)
  selectedDaXianIndex: number;
  liunianYear: number;
  liuyueMonth: number;
  liuriDay: number;
  liushiHour: number;
  // 回调
  onSelectDaXian: (idx: number) => void;
  onSelectLiunian: (year: number) => void;
  onSelectLiuyue: (month: number) => void;
  onSelectLiuri: (day: number) => void;
  onSelectLiushi: (hour: number) => void;
}

// 五行配色
const ROW_STYLE: Record<string, { label: string; color: string; bg: string; activeBg: string }> = {
  daxian:  { label: '大限', color: 'rgba(212,168,67,0.95)',  bg: 'transparent',                activeBg: 'rgba(212,168,67,0.10)' },
  liunian: { label: '流年', color: 'rgba(167,139,250,0.95)', bg: 'transparent',                activeBg: 'rgba(167,139,250,0.10)' },
  liuyue:  { label: '流月', color: 'rgba(96,165,250,0.95)',  bg: 'transparent',                activeBg: 'rgba(96,165,250,0.10)' },
  liuri:   { label: '流日', color: 'rgba(34,211,238,0.95)',  bg: 'transparent',                activeBg: 'rgba(34,211,238,0.10)' },
  liushi:  { label: '流时', color: 'rgba(148,163,184,0.95)', bg: 'transparent',                activeBg: 'rgba(148,163,184,0.10)' },
};

// 农历月名 (正月~腊月, 用本月初一的地支)
const LUNAR_MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];

// 时辰名
const HOUR_BRANCH_NAMES = BRANCHES;  // 子丑寅卯辰巳午未申酉戌亥

// 流年/流月/流日 干支颜色
const STEM_COLORS: Record<string, string> = {
  '甲': '#34d399', '乙': '#34d399',
  '丙': '#f87171', '丁': '#f87171',
  '戊': '#fbbf24', '己': '#fbbf24',
  '庚': '#f8fafc', '辛': '#f8fafc',
  '壬': '#60a5fa', '癸': '#60a5fa',
};

// 大限格生成
function buildDaXianCells(chart: ZiweiChart) {
  return chart.daXians.map((dx, idx) => {
    const siHua = dx.stemIndex !== undefined ? SI_HUA_TABLE[dx.stemIndex] : null;
    return {
      idx,
      main: `${dx.startAge}–${dx.endAge}`,
      sub: dx.palaceName || '',
      extra: dx.stemName || '',
      siHua,
    };
  });
}

// 流年格生成 (围绕 liunianYear ±6, 共 13 年; 2026-06-13 修正: 之前用 birthYear, 默认 2026 不在 grid 里)
function buildLiunianCells(_birthYear: number, liunianYear: number) {
  const cells = [];
  for (let i = -6; i <= 6; i++) {
    const year = liunianYear + i;
    const stemIdx = getYearStemIndex(year);
    const branchIdx = (year - 4) % 12;
    // 虚岁: 出生年 + 1 起算 (用 _birthYear 计算虚岁)
    const nominalAge = year - _birthYear + 1;
    cells.push({
      year,
      stem: STEMS[stemIdx],
      branch: BRANCHES[((branchIdx % 12) + 12) % 12],
      age: nominalAge,
    });
  }
  return cells;
}

// 流月格 (12 月 + 五虎遁月干)
function buildLiuyueCells(liunianYear: number) {
  const yearStemIdx = getYearStemIndex(liunianYear);
  const cells = [];
  for (let m = 1; m <= 12; m++) {
    const monthStemIdx = getMonthStemIndex(yearStemIdx, m);
    const branchIdx = (m + 1) % 12;  // 正月寅, 二月卯, ...
    cells.push({
      month: m,
      stem: STEMS[monthStemIdx],
      branch: BRANCHES[branchIdx],
      name: LUNAR_MONTH_NAMES[m - 1] + '月',
    });
  }
  return cells;
}

// 流日格 (1~当月最大天数 + 日干)
function buildLiuriCells(liunianYear: number, liuyueMonth: number) {
  const daysInMonth = new Date(liunianYear, liuyueMonth, 0).getDate();
  const cells = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(liunianYear, liuyueMonth - 1, d);
    const dayStemIdx = getDayStemIndex(date);
    cells.push({
      day: d,
      stem: STEMS[dayStemIdx],
      label: d === 1 ? '初一' : d === 10 ? '初十' : d === 20 ? '二十' : d === 30 ? '三十' : `${d}日`,
    });
  }
  return cells;
}

// 流时格 (12 时辰 + 五鼠遁时干)
function buildLiushiCells(liunianYear: number, liuyueMonth: number, liuriDay: number) {
  const date = new Date(liunianYear, liuyueMonth - 1, liuriDay);
  const dayStemIdx = getDayStemIndex(date);
  const cells = [];
  for (let h = 0; h < 12; h++) {
    const hourStemIdx = getHourStemIndex(dayStemIdx, h);
    cells.push({
      hour: h,
      stem: STEMS[hourStemIdx],
      branch: BRANCHES[h],
      range: `${h === 0 ? 23 : h}:00–${(h + 1) % 24 === 0 ? 24 : (h + 1) % 24}:00`,
    });
  }
  return cells;
}

// SIHUA 颜色 (4 化小色块)
const SIHUA_COLORS: Record<string, string> = {
  '禄': '#4ade80', '权': '#60a5fa', '科': '#facc15', '忌': '#f87171',
};

function SiHuaBadges({ siHua }: { siHua: [string, string, string, string] | null }) {
  if (!siHua) return null;
  return (
    <div className="flex gap-[2px] mt-0.5 text-[8px] leading-none">
      {(['禄', '权', '科', '忌'] as const).map((sh, i) => (
        <span key={sh} style={{ color: SIHUA_COLORS[sh] }}>{siHua[i]?.slice(0, 1) || ''}</span>
      ))}
    </div>
  );
}

interface RowProps {
  rowKey: keyof typeof ROW_STYLE;
  active: boolean;
  isMobileOnly: boolean;  // true = 移动端只显示这行
  children: React.ReactNode;
  scrollRef?: React.Ref<HTMLDivElement>;
}

function GridRow({ rowKey, active, isMobileOnly, children, scrollRef }: RowProps) {
  const style = ROW_STYLE[rowKey];
  return (
    <div
      className={`flex items-stretch gap-0 ${isMobileOnly ? 'mobile-show' : 'mobile-hide'}`}
      style={{
        background: active ? style.activeBg : 'transparent',
        borderBottom: '1px solid var(--t-border)',
        minHeight: '56px',
      }}
    >
      {/* Label */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '48px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: style.color,
          background: active ? style.activeBg : 'rgba(0,0,0,0.02)',
          borderRight: '1px solid var(--t-border)',
        }}
      >
        {style.label}
      </div>
      {/* Cells (水平可滚) */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-stretch gap-0 overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {children}
      </div>
    </div>
  );
}

export default function TimeAxisGrid({
  chart, view,
  selectedDaXianIndex,
  liunianYear, liuyueMonth, liuriDay, liushiHour,
  onSelectDaXian, onSelectLiunian, onSelectLiuyue, onSelectLiuri, onSelectLiushi,
}: TimeAxisGridProps) {
  const daXianCells = buildDaXianCells(chart);
  const liunianCells = buildLiunianCells(chart.birthInfo.year, liunianYear);
  const liuyueCells = buildLiuyueCells(liunianYear);
  const liuriCells = buildLiuriCells(liunianYear, liuyueMonth);
  const liushiCells = buildLiushiCells(liunianYear, liuyueMonth, liuriDay);

  // 移动端: 只显示 TopBar 选中的那 1 行
  const mobileRow: keyof typeof ROW_STYLE = (() => {
    if (view === 'daxian') return 'daxian';
    if (view === 'liunian') return 'liunian';
    if (view === 'liuyue') return 'liuyue';
    if (view === 'liuri') return 'liuri';
    if (view === 'liushi') return 'liushi';
    return 'daxian';  // 本命 默认显示大限
  })();

  // 滚动到当前选中的格子
  const daxianScrollRef = useRef<HTMLDivElement>(null);
  const liunianScrollRef = useRef<HTMLDivElement>(null);
  const liuyueScrollRef = useRef<HTMLDivElement>(null);
  const liuriScrollRef = useRef<HTMLDivElement>(null);
  const liushiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 2026-06-13 v3: 移除 rAF (cleanup 会取消), 改为同步 setTimeout(0) 等 paint 完
    // 根因复盘: 之前 rAF 在 useEffect cleanup 时被 cancelAnimationFrame 取消, 导致 scrollTo 从未触发
    // 新方案: useEffect 同步拿 rect, setTimeout 0 让浏览器 paint 一帧再赋 scrollLeft
    const timer = setTimeout(() => {
      const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        daxian: daxianScrollRef, liunian: liunianScrollRef, liuyue: liuyueScrollRef,
        liuri: liuriScrollRef, liushi: liushiScrollRef,
      };
      const ref = refs[view === 'mingpan' ? 'daxian' : view];
      const el = ref?.current;
      if (!el) return;
      const activeCell = el.querySelector('[data-active="true"]') as HTMLElement | null;
      if (!activeCell) return;
      const cellRect = activeCell.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const cellLeftInContainer = cellRect.left - elRect.left + el.scrollLeft;
      const target = cellLeftInContainer - el.clientWidth / 2 + cellRect.width / 2;
      el.scrollLeft = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth));
    }, 0);
    return () => clearTimeout(timer);
  }, [view, selectedDaXianIndex, liunianYear, liuyueMonth, liuriDay, liushiHour]);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--t-bg)', border: '1px solid var(--t-border)' }}
    >
      {/* 桌面端 5 行全显示 (CSS 控制) */}
      <div className="desktop-show">
        <GridRow rowKey="daxian" active={view === 'daxian' || view === 'mingpan'} isMobileOnly={false} scrollRef={daxianScrollRef}>
          {daXianCells.map((c) => {
            const isActive = c.idx === selectedDaXianIndex;
            return (
              <button
                key={c.idx}
                data-active={isActive}
                onClick={() => onSelectDaXian(c.idx)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5 transition-all"
                style={{
                  minWidth: '88px',
                  background: isActive ? 'rgba(212,168,67,0.18)' : 'transparent',
                  borderRight: '1px solid var(--t-border)',
                  cursor: 'pointer',
                  color: 'var(--t-fg)',
                }}
              >
                <div className="text-[11px] font-semibold tracking-wider tabular-nums">{c.main}岁</div>
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--t-faint)' }}>{c.extra} {c.sub}</div>
                <SiHuaBadges siHua={c.siHua} />
              </button>
            );
          })}
        </GridRow>

        <GridRow rowKey="liunian" active={view === 'liunian'} isMobileOnly={false} scrollRef={liunianScrollRef}>
          {liunianCells.map((c) => {
            const isActive = c.year === liunianYear;
            const ganzhi = c.stem + c.branch;
            return (
              <button
                key={c.year}
                data-active={isActive}
                onClick={() => onSelectLiunian(c.year)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-2 py-1.5 transition-all"
                style={{
                  minWidth: '70px',
                  background: isActive ? 'rgba(167,139,250,0.18)' : 'transparent',
                  borderRight: '1px solid var(--t-border)',
                  cursor: 'pointer',
                  color: 'var(--t-fg)',
                }}
              >
                <div className="text-[11px] font-semibold tabular-nums">{c.year}</div>
                <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{ganzhi}</div>
                <div className="text-[8px]" style={{ color: 'var(--t-faint)' }}>{c.age}岁</div>
              </button>
            );
          })}
        </GridRow>

        <GridRow rowKey="liuyue" active={view === 'liuyue'} isMobileOnly={false} scrollRef={liuyueScrollRef}>
          {liuyueCells.map((c) => {
            const isActive = c.month === liuyueMonth;
            const ganzhi = c.stem + c.branch;
            return (
              <button
                key={c.month}
                data-active={isActive}
                onClick={() => onSelectLiuyue(c.month)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5 transition-all"
                style={{
                  minWidth: '70px',
                  background: isActive ? 'rgba(96,165,250,0.18)' : 'transparent',
                  borderRight: '1px solid var(--t-border)',
                  cursor: 'pointer',
                  color: 'var(--t-fg)',
                }}
              >
                <div className="text-[11px] font-semibold">{c.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{ganzhi}</div>
              </button>
            );
          })}
        </GridRow>

        <GridRow rowKey="liuri" active={view === 'liuri'} isMobileOnly={false} scrollRef={liuriScrollRef}>
          {liuriCells.map((c) => {
            const isActive = c.day === liuriDay;
            return (
              <button
                key={c.day}
                data-active={isActive}
                onClick={() => onSelectLiuri(c.day)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-1.5 py-1.5 transition-all"
                style={{
                  minWidth: '48px',
                  background: isActive ? 'rgba(34,211,238,0.18)' : 'transparent',
                  borderRight: '1px solid var(--t-border)',
                  cursor: 'pointer',
                  color: 'var(--t-fg)',
                }}
              >
                <div className="text-[10px] font-semibold">{c.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{c.stem}</div>
              </button>
            );
          })}
        </GridRow>

        <GridRow rowKey="liushi" active={view === 'liushi'} isMobileOnly={false} scrollRef={liushiScrollRef}>
          {liushiCells.map((c) => {
            const isActive = c.hour === liushiHour;
            const ganzhi = c.stem + c.branch;
            return (
              <button
                key={c.hour}
                data-active={isActive}
                onClick={() => onSelectLiushi(c.hour)}
                className="flex-shrink-0 flex flex-col items-center justify-center px-2 py-1.5 transition-all"
                style={{
                  minWidth: '64px',
                  background: isActive ? 'rgba(148,163,184,0.18)' : 'transparent',
                  borderRight: '1px solid var(--t-border)',
                  cursor: 'pointer',
                  color: 'var(--t-fg)',
                }}
              >
                <div className="text-[11px] font-semibold">{c.branch}时</div>
                <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{c.stem}</div>
              </button>
            );
          })}
        </GridRow>
      </div>

      {/* 移动端: 只显示 TopBar 选中那 1 行 */}
      <div className="desktop-hide">
        {mobileRow === 'daxian' && (
          <GridRow rowKey="daxian" active scrollRef={daxianScrollRef} isMobileOnly={true}>
            {daXianCells.map((c) => {
              const isActive = c.idx === selectedDaXianIndex;
              return (
                <button key={c.idx} data-active={isActive} onClick={() => onSelectDaXian(c.idx)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5"
                  style={{ minWidth: '88px', background: isActive ? 'rgba(212,168,67,0.18)' : 'transparent', borderRight: '1px solid var(--t-border)', color: 'var(--t-fg)' }}>
                  <div className="text-[11px] font-semibold tabular-nums">{c.main}岁</div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--t-faint)' }}>{c.extra} {c.sub}</div>
                  <SiHuaBadges siHua={c.siHua} />
                </button>
              );
            })}
          </GridRow>
        )}
        {mobileRow === 'liunian' && (
          <GridRow rowKey="liunian" active scrollRef={liunianScrollRef} isMobileOnly={true}>
            {liunianCells.map((c) => {
              const isActive = c.year === liunianYear;
              return (
                <button key={c.year} data-active={isActive} onClick={() => onSelectLiunian(c.year)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-2 py-1.5"
                  style={{ minWidth: '70px', background: isActive ? 'rgba(167,139,250,0.18)' : 'transparent', borderRight: '1px solid var(--t-border)', color: 'var(--t-fg)' }}>
                  <div className="text-[11px] font-semibold tabular-nums">{c.year}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{c.stem}{c.branch}</div>
                  <div className="text-[8px]" style={{ color: 'var(--t-faint)' }}>{c.age}岁</div>
                </button>
              );
            })}
          </GridRow>
        )}
        {mobileRow === 'liuyue' && (
          <GridRow rowKey="liuyue" active scrollRef={liuyueScrollRef} isMobileOnly={true}>
            {liuyueCells.map((c) => {
              const isActive = c.month === liuyueMonth;
              return (
                <button key={c.month} data-active={isActive} onClick={() => onSelectLiuyue(c.month)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-1.5"
                  style={{ minWidth: '70px', background: isActive ? 'rgba(96,165,250,0.18)' : 'transparent', borderRight: '1px solid var(--t-border)', color: 'var(--t-fg)' }}>
                  <div className="text-[11px] font-semibold">{c.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{c.stem}{c.branch}</div>
                </button>
              );
            })}
          </GridRow>
        )}
        {mobileRow === 'liuri' && (
          <GridRow rowKey="liuri" active scrollRef={liuriScrollRef} isMobileOnly={true}>
            {liuriCells.map((c) => {
              const isActive = c.day === liuriDay;
              return (
                <button key={c.day} data-active={isActive} onClick={() => onSelectLiuri(c.day)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-1.5 py-1.5"
                  style={{ minWidth: '48px', background: isActive ? 'rgba(34,211,238,0.18)' : 'transparent', borderRight: '1px solid var(--t-border)', color: 'var(--t-fg)' }}>
                  <div className="text-[10px] font-semibold">{c.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{c.stem}</div>
                </button>
              );
            })}
          </GridRow>
        )}
        {mobileRow === 'liushi' && (
          <GridRow rowKey="liushi" active scrollRef={liushiScrollRef} isMobileOnly={true}>
            {liushiCells.map((c) => {
              const isActive = c.hour === liushiHour;
              return (
                <button key={c.hour} data-active={isActive} onClick={() => onSelectLiushi(c.hour)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-2 py-1.5"
                  style={{ minWidth: '64px', background: isActive ? 'rgba(148,163,184,0.18)' : 'transparent', borderRight: '1px solid var(--t-border)', color: 'var(--t-fg)' }}>
                  <div className="text-[11px] font-semibold">{c.branch}时</div>
                  <div className="text-[10px] mt-0.5" style={{ color: STEM_COLORS[c.stem] }}>{c.stem}</div>
                </button>
              );
            })}
          </GridRow>
        )}
      </div>

      <style>{`
        .desktop-show { display: block; }
        .desktop-hide { display: none; }
        @media (max-width: 767px) {
          .desktop-show { display: none !important; }
          .desktop-hide { display: block !important; }
        }
      `}</style>
    </div>
  );
}
