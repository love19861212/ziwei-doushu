'use client';
import { motion } from 'framer-motion';
import { STEMS, SI_HUA_TABLE } from '@/lib/ziwei/constants';
import type { ZiweiChart } from '@/lib/ziwei/types';

export type TimeView = 'mingpan' | 'daxian' | 'liunian' | 'liuyue' | 'liuri' | 'liushi';

interface TimeNavProps {
  chart: ZiweiChart;
  view: TimeView;
  liunianYear: number;
  liuyueMonth?: number;
  liuriDay?: number;
  liushiHour?: number;
  // 当前大限索引 (Oracle 顶部 tab '大限 35-44岁' 用)
  currentDaXianIndex?: number;
  onViewChange: (view: TimeView) => void;
  onYearChange: (year: number) => void;
  onMonthChange?: (month: number) => void;
  onDayChange?: (day: number) => void;
  onHourChange?: (hour: number) => void;
}

/** 由年份计算天干索引 (0-9) */
export function getYearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/** 由月份(1-12)计算月干索引 (0-9) — 五虎遁年起月法 */
export function getMonthStemIndex(yearStemIndex: number, month: number): number {
  // 五虎遁：甲己之年丙作首(寅月起丙)，乙庚之岁戊为头，丙辛必定寻庚起，
  //         丁壬壬位顺行流，戊癸何方发，甲己之年丙作首
  // 寅月为正月
  const startStems = [2, 4, 6, 8, 0]; // 丙戊庚壬甲
  const startStem = startStems[yearStemIndex % 5];
  return (startStem + (month - 1)) % 10;
}

/** 由日干索引计算日干 — 简化版(以1900-01-31甲辰为基准) */
export function getDayStemIndex(date: Date): number {
  // 1900-01-31是甲辰日, 甲=0
  const baseDate = new Date(1900, 0, 31);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  return ((diffDays % 10) + 10) % 10;
}

/** 由时干索引(0-11)计算时干 — 五鼠遁日起时法 */
export function getHourStemIndex(dayStemIndex: number, hour: number): number {
  // 甲己还加甲(子时起甲), 乙庚丙作初, 丙辛从戊起, 丁壬庚子居, 戊癸何方发, 壬子是真途
  const startStems = [0, 2, 4, 6, 8]; // 甲丙戊庚壬
  const startStem = startStems[dayStemIndex % 5];
  return (startStem + hour) % 10;
}

/** 根据天干索引返回四化映射：starName → SiHua */
export function buildSiHuaOverlay(stemIndex: number): Record<string, string> {
  const stars = SI_HUA_TABLE[stemIndex];
  if (!stars) return {};
  return {
    [stars[0]]: '禄',
    [stars[1]]: '权',
    [stars[2]]: '科',
    [stars[3]]: '忌',
  };
}

const SIHUA_COLORS: Record<string, string> = {
  '禄': '#4ade80',
  '权': '#60a5fa',
  '科': '#facc15',
  '忌': '#f87171',
};

const HOUR_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

export default function TimeNav({
  chart,
  view,
  liunianYear,
  liuyueMonth = 1,
  liuriDay = 1,
  liushiHour = 0,
  onViewChange,
  onYearChange,
  onMonthChange,
  onDayChange,
  onHourChange,
}: TimeNavProps) {
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const yearStemIndex = getYearStemIndex(liunianYear);
  const monthStemIndex = getMonthStemIndex(yearStemIndex, liuyueMonth);

  // 计算当前日期的天干
  const currentDate = new Date(liunianYear, liuyueMonth - 1, liuriDay);
  const dayStemIndex = getDayStemIndex(currentDate);
  const hourStemIndex = getHourStemIndex(dayStemIndex, liushiHour);

  // 当前叠加四化信息（用流年干，但显示流月/流日/流时干）
  const getOverlayInfo = (): { stemName: string; overlay: Record<string, string>; level: string } | null => {
    if (view === 'mingpan') return null;

    if (view === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (!dxPalace) return null;
      const stemIndex = dxPalace.stem;
      return {
        stemName: STEMS[stemIndex],
        overlay: buildSiHuaOverlay(stemIndex),
        level: '大限',
      };
    }

    if (view === 'liunian') {
      return {
        stemName: STEMS[yearStemIndex],
        overlay: buildSiHuaOverlay(yearStemIndex),
        level: `${liunianYear}`,
      };
    }

    return null;
  };

  const overlayInfo = getOverlayInfo();

  // 一个月最大天数
  const daysInMonth = new Date(liunianYear, liuyueMonth, 0).getDate();

  return (
    <div className="mb-3">
      {/* Tab 行 */}
      <div
        className="flex items-center rounded-xl p-1 gap-1"
        style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
      >
        {/* 本命 */}
        <TabButton
          active={view === 'mingpan'}
          onClick={() => onViewChange('mingpan')}
        >
          本命
        </TabButton>

        {/* 大限 */}
        <TabButton
          active={view === 'daxian'}
          onClick={() => onViewChange('daxian')}
        >
          {currentDx ? `大限 ${currentDx.startAge}–${currentDx.endAge}` : '大限'}
        </TabButton>

        {/* 流月 — 顶级 tab (Oracle 6 档) */}
        <TabButton
          active={view === 'liuyue'}
          onClick={() => onViewChange('liuyue')}
        >
          流月
        </TabButton>

        {/* 流日 */}
        <TabButton
          active={view === 'liuri'}
          onClick={() => onViewChange('liuri')}
        >
          流日
        </TabButton>

        {/* 流时 */}
        <TabButton
          active={view === 'liushi'}
          onClick={() => onViewChange('liushi')}
        >
          流时
        </TabButton>

        {/* 流年 — 含年份切换 */}
        <div
          className="relative flex-1 flex items-center justify-center rounded-lg py-1.5 gap-1 transition-all duration-200"
          style={{
            background: view === 'liunian'
              ? 'rgba(212,168,67,0.12)'
              : 'transparent',
            border: view === 'liunian'
              ? '1px solid rgba(212,168,67,0.25)'
              : '1px solid transparent',
          }}
        >
          <button
            onClick={() => onViewChange('liunian')}
            className="text-[10px] font-medium flex-1 text-center"
            style={{ color: view === 'liunian' ? 'var(--t-gold)' : 'var(--t-faint)' }}
          >
            流年
          </button>
          {/* 年份 +/- */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded"
              style={{ color: 'var(--t-faint)' }}
            >
              ‹
            </button>
            <span
              className="text-[10px] font-mono min-w-[28px] text-center cursor-pointer"
              style={{ color: view === 'liunian' ? 'var(--t-gold)' : 'var(--t-faint)' }}
              onClick={() => onViewChange('liunian')}
            >
              {liunianYear}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="text-[9px] w-4 h-4 flex items-center justify-center rounded"
              style={{ color: 'var(--t-faint)' }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 流年模式下的：流月/流日/流时切换（仿Oracle四级时间轴） */}
      {view === 'liunian' && onMonthChange && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 px-2 py-2 rounded-lg flex flex-wrap items-center gap-2"
          style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
        >
          {/* 流月 */}
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: 'var(--t-faint)' }}>流月</span>
            <select
              value={liuyueMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="text-[10px] bg-transparent rounded px-1 py-0.5"
              style={{ color: 'var(--t-gold)', border: '1px solid var(--t-border)' }}
            >
              {MONTH_BRANCHES.map((branch, i) => (
                <option key={i} value={i + 1} style={{ background: 'var(--t-surface)' }}>
                  {i + 1}月({branch}月)
                </option>
              ))}
            </select>
            <span className="text-[8px]" style={{ color: 'var(--t-faint)' }}>
              {STEMS[monthStemIndex]}月
            </span>
          </div>

          {/* 流日 */}
          {onDayChange && (
            <div className="flex items-center gap-1">
              <span className="text-[9px]" style={{ color: 'var(--t-faint)' }}>流日</span>
              <input
                type="number"
                value={liuriDay}
                min={1}
                max={daysInMonth}
                onChange={(e) => {
                  const d = Math.max(1, Math.min(daysInMonth, parseInt(e.target.value) || 1));
                  onDayChange(d);
                }}
                className="text-[10px] bg-transparent rounded px-1 py-0.5 w-12 text-center"
                style={{ color: 'var(--t-gold)', border: '1px solid var(--t-border)' }}
              />
              <span className="text-[8px]" style={{ color: 'var(--t-faint)' }}>
                {STEMS[dayStemIndex]}日
              </span>
            </div>
          )}

          {/* 流时 */}
          {onHourChange && (
            <div className="flex items-center gap-1">
              <span className="text-[9px]" style={{ color: 'var(--t-faint)' }}>流时</span>
              <select
                value={liushiHour}
                onChange={(e) => onHourChange(parseInt(e.target.value))}
                className="text-[10px] bg-transparent rounded px-1 py-0.5"
                style={{ color: 'var(--t-gold)', border: '1px solid var(--t-border)' }}
              >
                {HOUR_BRANCHES.map((branch, i) => (
                  <option key={i} value={i} style={{ background: 'var(--t-surface)' }}>
                    {branch}时
                  </option>
                ))}
              </select>
              <span className="text-[8px]" style={{ color: 'var(--t-faint)' }}>
                {STEMS[hourStemIndex]}时
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* 叠加四化说明行 */}
      {overlayInfo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 mt-1.5 px-1 flex-wrap"
        >
          <span className="text-[9px]" style={{ color: 'var(--t-faint)' }}>
            {overlayInfo.level}·{overlayInfo.stemName}年四化：
          </span>
          {(['禄', '权', '科', '忌'] as const).map(sh => {
            const starName = Object.keys(overlayInfo.overlay).find(k => overlayInfo.overlay[k] === sh);
            if (!starName) return null;
            return (
              <span key={sh} className="text-[9px] font-medium" style={{ color: SIHUA_COLORS[sh] }}>
                {starName}化{sh}
              </span>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all duration-200"
      style={{
        background: active ? 'rgba(212,168,67,0.12)' : 'transparent',
        color: active ? 'var(--t-gold)' : 'var(--t-faint)',
        border: active ? '1px solid rgba(212,168,67,0.25)' : '1px solid transparent',
      }}
    >
      {children}
    </button>
  );
}
