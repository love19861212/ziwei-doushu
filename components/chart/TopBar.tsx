'use client';

export type TimeView = 'mingpan' | 'daxian' | 'liunian';

interface TopBarProps {
  chart?: any;
  view: TimeView;
  liunianYear: number;
  liuyueMonth?: number;
  onViewChange: (v: TimeView) => void;
  onYearChange?: (y: number) => void;
  onMonthChange?: (m: number) => void;
  onShare?: () => void;
  onExport?: () => void;
  copied?: boolean;
}

export default function TopBar({ view, liunianYear, liuyueMonth, onViewChange, onYearChange, onShare, onExport, copied }: TopBarProps) {
  return (
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
        {view === 'liunian' && (
          <input
            type="number"
            value={liunianYear}
            onChange={(e) => onYearChange?.(parseInt(e.target.value))}
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
      </div>
    </div>
  );
}
