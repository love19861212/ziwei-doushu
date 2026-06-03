'use client';
import TimeNav, { getYearStemIndex, getMonthStemIndex, getDayStemIndex, getHourStemIndex, buildSiHuaOverlay, type TimeView } from './TimeNav';

export type { TimeView };

interface TopBarProps {
  chart?: any;
  view: TimeView;
  liunianYear: number;
  liuyueMonth?: number;
  liuriDay?: number;
  liushiHour?: number;
  onViewChange: (v: TimeView) => void;
  onYearChange?: (y: number) => void;
  onMonthChange?: (m: number) => void;
  onDayChange?: (d: number) => void;
  onHourChange?: (h: number) => void;
  onShare?: () => void;
  onExport?: () => void;
  onReport?: () => void;
  copied?: boolean;
}

export default function TopBar({
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
  onShare,
  onExport,
  onReport,
  copied,
}: TopBarProps) {
  return (
    <div className="mb-4">
      {chart && onYearChange ? (
        <TimeNav
          chart={chart}
          view={view}
          liunianYear={liunianYear}
          liuyueMonth={liuyueMonth}
          liuriDay={liuriDay}
          liushiHour={liushiHour}
          onViewChange={onViewChange}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onDayChange={onDayChange}
          onHourChange={onHourChange}
        />
      ) : (
        // 简版TopBar（无chart时）
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {(['mingpan', 'daxian', 'liunian'] as TimeView[]).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-4 py-2 rounded-lg transition ${view === v ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {v === 'mingpan' ? '命盘' : v === 'daxian' ? '大限' : '流年'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            {view === 'liunian' && onYearChange && (
              <input
                type="number"
                value={liunianYear}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="bg-gray-700 text-white px-3 py-2 rounded w-24"
                min={1900}
                max={2100}
              />
            )}
            {onShare && (
              <button onClick={onShare} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                分享 {copied && '✓'}
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                导出
              </button>
            )}
            {onReport && (
              <button onClick={onReport} className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition font-medium">
                📄 全盘报告
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 重新导出，便于在chart page里直接引用
export { getYearStemIndex, getMonthStemIndex, getDayStemIndex, getHourStemIndex, buildSiHuaOverlay };
