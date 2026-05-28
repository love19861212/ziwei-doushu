'use client';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import StarField from '@/components/StarField';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

type ConvertType = 'solar-to-lunar' | 'lunar-to-solar';

function ResultCard({ data, type, isDark }: { data: any; type: ConvertType; isDark: boolean }) {
  if (!data) return null;
  const bg = isDark ? 'rgba(8,16,40,0.92)' : 'rgba(255,255,255,0.95)';
  const border = isDark ? 'rgba(212,168,67,0.35)' : 'rgba(180,140,60,0.3)';
  const labelClr = isDark ? 'rgba(180,200,225,0.8)' : 'rgba(80,100,160,0.8)';
  const valClr = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(20,20,30,0.95)';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(180,160,60,0.06)';
  const gold = '#d4a843';

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: labelClr, fontSize: '13px' }}>{label}</span>
      <span style={{ color: valClr, fontSize: '14px', fontWeight: 600 }}>{value}</span>
    </div>
  );

  if (type === 'solar-to-lunar') {
    const { solar, lunar } = data;
    return (
      <div style={{ background: bg, border: '1px solid ' + border, borderRadius: '16px', padding: '24px 28px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 0 24px rgba(212,168,67,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ color: gold, fontSize: '15px', fontWeight: 700 }}>公历 → 农历</span>
              <span style={{ color: labelClr, fontSize: '12px' }}>{solar.year}年{solar.month}月{solar.day}日</span>
            </div>
            <div style={{ background: cardBg, borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: gold, textAlign: 'center', marginBottom: '4px' }}>{lunar.yearInChinese}年</div>
              <div style={{ fontSize: '16px', color: valClr, textAlign: 'center' }}>{lunar.isLeapMonth ? '闰' : ''}{lunar.monthInChinese}月{lunar.dayInChinese}</div>
              <div style={{ fontSize: '12px', color: labelClr, textAlign: 'center', marginTop: '4px' }}>{lunar.ganZhiYear}年 · {lunar.ganZhiMonth}月 · {lunar.ganZhiDay}日</div>
            </div>
            <Row label="生肖" value={lunar.shengXiao} />
            <Row label="星期" value={['日','一','二','三','四','五','六'][lunar.week] + '曜日'} />
            <Row label="纳音" value={lunar.naYin} />
            <Row label="喜神" value={lunar.positionXi} />
            <Row label="财神" value={lunar.positionCai} />
            <Row label="福神" value={lunar.positionFu} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: labelClr, marginBottom: '14px' }}>当日五行天干地支</div>
            <div style={{ background: cardBg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: gold, lineHeight: 1.1 }}>{data.solarDayInfo.ganZhiDay}{data.solarDayInfo.zhiDay}</div>
              <div style={{ fontSize: '12px', color: labelClr, marginTop: '8px' }}>日柱</div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '12px', color: labelClr, marginBottom: '8px' }}>天干</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STEMS.map((s) => (
                  <span key={s} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', background: data.solarDayInfo.ganZhiDay[0] === s ? 'rgba(212,168,67,0.25)' : cardBg, color: data.solarDayInfo.ganZhiDay[0] === s ? gold : valClr, border: data.solarDayInfo.ganZhiDay[0] === s ? '1px solid ' + gold : '1px solid rgba(255,255,255,0.1)' }}>{s}</span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: labelClr, marginTop: '10px', marginBottom: '8px' }}>地支</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {BRANCHES.map((b) => (
                  <span key={b} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', background: data.solarDayInfo.zhiDay[0] === b ? 'rgba(212,168,67,0.25)' : cardBg, color: data.solarDayInfo.zhiDay[0] === b ? gold : valClr, border: data.solarDayInfo.zhiDay[0] === b ? '1px solid ' + gold : '1px solid rgba(255,255,255,0.1)' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { lunar, solar, lunarDayInfo } = data;
  return (
    <div style={{ background: bg, border: '1px solid ' + border, borderRadius: '16px', padding: '24px 28px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 0 24px rgba(212,168,67,0.04)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ color: gold, fontSize: '15px', fontWeight: 700 }}>农历 → 公历</span>
            <span style={{ color: labelClr, fontSize: '12px' }}>{lunarDayInfo.yearInChinese}年{lunar.isLeapMonth ? '闰' : ''}{lunarDayInfo.monthInChinese}月{lunarDayInfo.dayInChinese}</span>
          </div>
          <div style={{ background: cardBg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: gold }}>{solar.year}年{solar.month}月{solar.day}日</div>
            <div style={{ fontSize: '14px', color: valClr, marginTop: '6px' }}>星期{solar.weekInChinese}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: labelClr, marginBottom: '14px' }}>农历当日详情</div>
          <Row label="年柱" value={lunarDayInfo.ganZhiYear} />
          <Row label="月柱" value={lunarDayInfo.ganZhiMonth} />
          <Row label="日柱" value={lunarDayInfo.ganZhiDay} />
          <Row label="生肖" value={lunarDayInfo.shengXiao} />
          <Row label="纳音" value={lunarDayInfo.naYin} />
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { theme } = useTheme(); const isDark = theme === 'dark';
  const [convertType, setConvertType] = useState<ConvertType>('solar-to-lunar');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('5');
  const [day, setDay] = useState('25');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const inputClr = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(20,20,30,0.9)';
  const borderClr = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(180,140,60,0.25)';
  const labelClr = isDark ? 'rgba(180,200,225,0.8)' : 'rgba(80,100,160,0.8)';
  const sectionBg = isDark ? 'rgba(8,16,40,0.85)' : 'rgba(255,252,240,0.85)';
  const gold = '#d4a843';

  const handleConvert = async () => {
    setError('');
    setResult(null);
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!y || !m || !d) { setError('请填写完整的年月日'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: convertType, year: y, month: m, day: d, isLeapMonth }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '转换失败');
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const now = new Date();

  return (
    <>
      <StarField />
      <div style={{ minHeight: '100vh', padding: '80px 16px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: gold, marginBottom: '6px' }}>CALENDAR CONVERTER</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: isDark ? '#f6efe0' : '#1a1d24', letterSpacing: '0.12em', marginBottom: '8px' }}>公历农历互转</h1>
            <p style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>输历日期即可转换，支持闰月标注</p>
          </div>

          <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: sectionBg, borderRadius: '12px', padding: '4px', border: '1px solid ' + borderClr }}>
            <button onClick={() => { setConvertType('solar-to-lunar'); setResult(null); setYear(now.getFullYear().toString()); setMonth((now.getMonth()+1).toString()); setDay(now.getDate().toString()); }}
              style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em', background: convertType === 'solar-to-lunar' ? (isDark ? 'rgba(212,168,67,0.2)' : 'rgba(180,160,60,0.15)') : 'transparent', color: convertType === 'solar-to-lunar' ? gold : labelClr }}>
              公历→农历
            </button>
            <button onClick={() => { setConvertType('lunar-to-solar'); setResult(null); }}
              style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em', background: convertType === 'lunar-to-solar' ? (isDark ? 'rgba(212,168,67,0.2)' : 'rgba(180,160,60,0.15)') : 'transparent', color: convertType === 'lunar-to-solar' ? gold : labelClr }}>
              农历→公历
            </button>
          </div>

          <div style={{ background: sectionBg, border: '1px solid ' + borderClr, borderRadius: '16px', padding: '24px', marginBottom: '20px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <div style={{ color: labelClr, fontSize: '13px', marginBottom: '14px' }}>
              {convertType === 'solar-to-lunar' ? '输入公历日期（年/月/日）：' : '输入农历日期（年/月/日，闰月需勾选）：'}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ color: labelClr, fontSize: '13px' }}>年</label>
                <input type="number" value={year} onChange={e => setYear(e.target.value)} min={1900} max={2100} style={{ width: '90px', padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + borderClr, background: inputBg, color: inputClr, fontSize: '15px', textAlign: 'center', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ color: labelClr, fontSize: '13px' }}>月</label>
                <input type="number" value={month} onChange={e => setMonth(e.target.value)} min={1} max={12} style={{ width: '70px', padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + borderClr, background: inputBg, color: inputClr, fontSize: '15px', textAlign: 'center', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ color: labelClr, fontSize: '13px' }}>日</label>
                <input type="number" value={day} onChange={e => setDay(e.target.value)} min={1} max={30} style={{ width: '70px', padding: '8px 12px', borderRadius: '8px', border: '1px solid ' + borderClr, background: inputBg, color: inputClr, fontSize: '15px', textAlign: 'center', outline: 'none' }} />
              </div>
              {convertType === 'lunar-to-solar' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: labelClr, fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isLeapMonth} onChange={e => setIsLeapMonth(e.target.checked)} style={{ accentColor: gold, width: '16px', height: '16px' }} />
                  闰月
                </label>
              )}
              <button onClick={handleConvert} disabled={loading} style={{ padding: '10px 24px', borderRadius: '9px', border: '1px solid ' + gold + '60', background: 'rgba(212,168,67,0.15)', color: gold, fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.1em', marginLeft: 'auto', opacity: loading ? 0.6 : 1 }}>
                {loading ? '转换中...' : '转换'}
              </button>
            </div>
          </div>

          {error && <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          {result && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <ResultCard data={result} type={convertType} isDark={isDark} />
            </div>
          )}

          {!result && (
            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: labelClr, marginBottom: '12px' }}>快捷参考 · 天干地支</div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                {STEMS.map(s => <span key={s} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', border: '1px solid ' + borderClr }}>{s}</span>)}
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {BRANCHES.map(b => <span key={b} style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', border: '1px solid ' + borderClr }}>{b}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}
