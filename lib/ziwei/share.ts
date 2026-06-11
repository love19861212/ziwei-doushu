import type { BirthFormState } from '@/components/BirthForm';
import type { BirthInfo } from './types';

/** 12 时辰地支名 */
export const BRANCH_CN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

/** 倪海夏《天纪》派: 直接按钟表时辰排盘, 不校准真太阳时
 *  钟表小时 (0-23) → 时辰地支索引 (0-12, 等于地支索引)
 *  - 23:00-23:59 → 0 (子, 晚子, 算当天)
 *  - 00:00-00:59 → 0 (子, 早子, 算次日)
 *  - 01:00-01:59 → 1 (丑)
 *  - 03:00-03:59 → 2 (寅)
 *  - ...
 *  - 21:00-21:59 → 11 (亥)
 *  - 22:00-22:59 → 11 (亥)
 */
export function clockHourToTimeIndex(clockHour: number): number {
  if (clockHour === 23) return 0;     // 23:00-23:59 = 晚子
  if (clockHour === 0) return 0;      // 00:00-00:59 = 早子
  if (clockHour === 1) return 1;      // 01:00-01:59 = 丑 (Math.floor((1+1)/2)=1 ✓)
  if (clockHour === 22) return 11;    // 22:00-22:59 = 亥 (Math.floor(23/2)=11 ✓)
  return Math.floor((clockHour + 1) / 2);
}

/** 真太阳时计算函数 (保留作参考, 不参与排盘)
 *  - solar = clockMins - (120 - longitude) * 4 分钟
 *  - 东经减, 西经加; 含 EoT 修正
 *  - 仅用于报告/分享展示, 文墨天机参考值
 */
export function calcTrueSolarHM(clockHour: number, clockMinute: number, longitude: number, dayOfYear: number = 162): string {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const total = clockMins - offset + eot;
  const solar = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(solar / 60);
  const m = Math.round(solar % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

/** 真太阳时 → 时辰支索引 (0-11)
 *  保留供 UI 显示, 排盘不用
 */
export function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;
  const solarMins = ((clockMins - offset) % 1440 + 1440) % 1440;
  if (solarMins >= 1380 || solarMins < 60) return 0;
  return Math.floor((solarMins - 60) / 120) + 1;
}

/** 12时辰索引 → 24小时钟表 (返回代表小时, 0-23)
 *  - 0=子(23点代表), 1=丑(1点), 2=寅(3点), ..., 11=亥(21点)
 */
export function shiChenToClockHour(shiChenIdx: number): number {
  return [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21][shiChenIdx] || 0;
}

/** 把 form.clockHour 规范化为 24 小时制 (0-23)
 *  - timeMode=24h: 直接 parseInt
 *  - timeMode=12h: 当 12时辰 索引, 用 shiChenToClockHour 转
 */
export function normalizeClockHour(form: BirthFormState): { hour: number; minute: number } {
  const raw = parseInt(form.clockHour) || 0;
  const min = parseInt(form.clockMinute) || 0;
  if (form.timeMode === '12h') {
    return { hour: shiChenToClockHour(raw), minute: min };
  }
  return { hour: raw, minute: min };
}

/** 同步版 — 倪海夏《天纪》派: 钟表时辰 + 子时跨日
 *  - 23:00-23:59 晚子时 → 算当天
 *  - 00:00-00:59 早子时 → 算次日 (日柱切换)
 */
export function formToBirthInfo(form: BirthFormState): BirthInfo {
  let y = parseInt(form.year) || 0;
  let m = parseInt(form.month) || 0;
  let d = parseInt(form.day) || 0;

  // 子时跨日: 早子(00:00-00:59) 算次日
  const { hour: clockHour, minute: clockMin } = form.unknownTime
    ? { hour: 12, minute: 0 }
    : normalizeClockHour(form);
  if (!form.unknownTime && clockHour === 0 && y > 0 && m > 0 && d > 0) {
    const next = new Date(y, m - 1, d + 1);
    y = next.getFullYear();
    m = next.getMonth() + 1;
    d = next.getDate();
  }

  // 排盘用钟表时辰 (倪海夏《天纪》派)
  const hour = form.unknownTime
    ? 0
    : clockHourToTimeIndex(clockHour);

  return {
    year: y, month: m, day: d,
    hour,
    minute: clockMin,
    clockHour: clockHour === 24 ? 0 : clockHour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
    trueSolarHM: form.unknownTime ? '' : calcTrueSolarHM(clockHour, clockMin, form.longitude),  // 参考值, 排盘不用
  };
}

/** 异步版 — 倪海夏《天纪》派: 钟表时辰 + 子时跨日 + 农历自动转公历 */
export async function formToBirthInfoAsync(form: BirthFormState): Promise<BirthInfo> {
  let y = parseInt(form.year) || 0;
  let m = parseInt(form.month) || 0;
  let d = parseInt(form.day) || 0;

  if (form.dateMode === 'lunar') {
    const ly = parseInt(form.lunarYear) || 0;
    const lm = parseInt(form.lunarMonth) || 0;
    const ld = parseInt(form.lunarDay) || 0;
    if (ly && lm && ld) {
      try {
        const r = await fetch('/api/calendar/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'lunar-to-solar', year: ly, month: lm, day: ld, isLeapMonth: form.isLeapMonth }),
        });
        const data = await r.json();
        if (data.solar) {
          y = data.solar.year;
          m = data.solar.month;
          d = data.solar.day;
        }
      } catch {
        // 转换失败
      }
    }
  }

  // 子时跨日: 早子(00:00-00:59) 算次日
  const { hour: clockHour, minute: clockMin } = form.unknownTime
    ? { hour: 12, minute: 0 }
    : normalizeClockHour(form);
  if (!form.unknownTime && clockHour === 0 && y > 0 && m > 0 && d > 0) {
    const next = new Date(y, m - 1, d + 1);
    y = next.getFullYear();
    m = next.getMonth() + 1;
    d = next.getDate();
  }

  // 排盘用钟表时辰 (倪海夏《天纪》派)
  const hour = form.unknownTime
    ? 0
    : clockHourToTimeIndex(clockHour);

  return {
    year: y, month: m, day: d,
    hour,
    minute: clockMin,
    clockHour: clockHour === 24 ? 0 : clockHour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
    trueSolarHM: form.unknownTime ? '' : calcTrueSolarHM(clockHour, clockMin, form.longitude),
  };
}

/** URLSearchParams -> Partial<BirthFormState> */
export function searchParamsToForm(params: URLSearchParams): Partial<BirthFormState> | null {
  const year = params.get('y');
  const month = params.get('m');
  const day = params.get('d');
  if (!year || !month || !day) return null;
  return {
    name: params.get('n') || '',
    year,
    month,
    day,
    unknownTime: params.get('u') === '1',
    clockHour: params.get('h') || '',
    clockMinute: params.get('mi') || '0',
    province: params.get('p') || '',
    city: params.get('c') || '',
    longitude: parseFloat(params.get('lo') || '120'),
    gender: params.get('g') === 'f' ? 'female' : 'male',
  };
}

/** BirthFormState -> URLSearchParams */
export function formToSearchParams(form: BirthFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (form.name) p.set('n', form.name);
  p.set('y', form.year);
  p.set('m', form.month);
  p.set('d', form.day);
  if (form.unknownTime) {
    p.set('u', '1');
  } else {
    p.set('h', form.clockHour);
    p.set('mi', form.clockMinute);
  }
  if (form.province) p.set('p', form.province);
  if (form.city) p.set('c', form.city);
  if (form.longitude && form.longitude !== 120) p.set('lo', String(form.longitude));
  p.set('g', form.gender === 'male' ? 'm' : 'f');
  return p;
}
