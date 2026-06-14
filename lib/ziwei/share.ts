import type { BirthFormState } from '@/components/BirthForm';
import type { BirthInfo } from './types';

/** 12 时辰地支名 */
export const BRANCH_CN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

/** 24小时钟表 → 真太阳时 (含 EoT 近似), 返回 "HH:MM"
 *  - 倪海夏《天纪》/ 文墨天机 体系: 排盘按真太阳时
 *  - 公式: solar = clock - (120 - longitude) * 4 分钟 (东经 offset 为正 → 减去)
 *  - 含 EoT 修正: 9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B), B = 2π/365 * (dayOfYear - 81)
 */
export function calcTrueSolarHM(clockHour: number, clockMinute: number, longitude: number, dayOfYear: number = 162): string {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;  // 东经减, 西经加
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const total = clockMins - offset + eot;
  const solar = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(solar / 60);
  const m = Math.round(solar % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

/** 24小时钟表 → 真太阳时地支索引 (0-11) — 倪海夏/文墨天机口径
 *  - 23:00-23:59 = 晚子时 (索引 0), 算当天
 *  - 00:00-00:59 = 早子时 (索引 0), 算次日 (日柱已切换)
 *  - 01:00-22:59  按 12 时辰窗口 (1=丑, 2=寅, ..., 11=亥)
 *  - 2026-06-12 加 EoT 修正: 王二 16:00+104.40°E 不加 EoT 算 14:58 跨到未时 (命宫 6 午)
 *    加 EoT +5.5min 算 15:03 还在申时 (命宫 5 巳) — 跟文墨天机 v24 报告一致
 */
export function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number, dayOfYear: number = 162): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;  // 经度差 → 分钟
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const solarMins = ((clockMins - offset + eot) % 1440 + 1440) % 1440;  // 减经度, 加 EoT
  // 23:00-23:59 (1380-1440 分钟) → 子时(0)
  // 00:00-00:59 (0-60 分钟)     → 子时(0) 早子
  // 01:00-01:59 (60-120)        → 丑时(1)
  // ...
  if (solarMins >= 1380 || solarMins < 60) return 0;
  return Math.floor((solarMins - 60) / 120) + 1;
}

/** 工具: yyyy-MM-dd → dayOfYear (1-365) */
export function toDayOfYear(year: number, month: number, day: number): number {
  const d = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

/** 同步版 — 不支持农历 (但支持子时跨日 + 真太阳时)
 *  倪海夏/文墨天机派:
 *    - 23:00-23:59 晚子时 → 算当天
 *    - 00:00-00:59 早子时 → 算次日 (日柱切换)
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

  // 排盘口径 (跟文墨天机设计对齐 — 2026-06-14):
  //  - timeMode='12h' (选时辰地支) → 钟表时辰, 用户已选, 不算真太阳时
  //  - timeMode='24h' (公历+小时) → 真太阳时, 含 EoT 修正
  const dayOfYear = (y > 0 && m > 0 && d > 0) ? toDayOfYear(y, m, d) : 162;
  const hour = form.unknownTime
    ? 0
    : form.timeMode === '12h'
      ? parseInt(form.clockHour) || 0  // 12时辰 = 用户已选时辰
      : calcTrueSolarBranch(clockHour, clockMin, form.longitude, dayOfYear);

  return {
    year: y, month: m, day: d,
    hour,
    minute: clockMin,
    clockHour: clockHour === 24 ? 0 : clockHour,  // 23 → 不变; 0 → 0
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
    trueSolarHM: form.unknownTime || form.timeMode === '12h'
      ? ''  // 12时辰模式不算真太阳时
      : calcTrueSolarHM(clockHour, clockMin, form.longitude, dayOfYear),
    timeMode: form.timeMode,
  };
}

/** 异步版 — 支持农历自动转公历 + 真太阳时 + 子时跨日
 *  倪海夏/文墨天机派:
 *    - 23:00-23:59 晚子时 → 算当天
 *    - 00:00-00:59 早子时 → 算次日 (日柱切换)
 */
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

  // 排盘口径 (跟文墨天机设计对齐 — 2026-06-14): 12h=钟表, 24h=真太阳时
  const dayOfYear = (y > 0 && m > 0 && d > 0) ? toDayOfYear(y, m, d) : 162;
  const hour = form.unknownTime
    ? 0
    : form.timeMode === '12h'
      ? parseInt(form.clockHour) || 0
      : calcTrueSolarBranch(clockHour, clockMin, form.longitude, dayOfYear);

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
    trueSolarHM: form.unknownTime || form.timeMode === '12h'
      ? ''
      : calcTrueSolarHM(clockHour, clockMin, form.longitude, dayOfYear),
    timeMode: form.timeMode,
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

/** 24小时钟表 → 12时辰索引 (倪海夏/文墨天机口径, 不带经度校准)
 *  - 23:00-23:59 → 0 (子, 晚子, 算当天)
 *  - 00:00-00:59 → 0 (子, 早子, 算次日)
 *  - 01:00-01:59 → 1 (丑)
 *  - 03:00-03:59 → 2 (寅)
 *  - ...
 *  - 21:00-21:59 → 11 (亥)
 *  - 22:00-22:59 → 11 (亥)
 */
export function clockHourToShiChen(clockHour: number): number {
  if (clockHour === 23) return 0;     // 23:00-23:59 = 晚子
  if (clockHour === 0) return 0;      // 00:00-00:59 = 早子
  if (clockHour === 1) return 1;      // 01:00-01:59 = 丑
  if (clockHour === 22) return 11;    // 22:00-22:59 = 亥 (注: 21点也是亥, 23点是子)
  return Math.floor((clockHour + 1) / 2);
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
 *  - 兼容旧的 (没 timeMode): 默认 24h
 */
export function normalizeClockHour(form: BirthFormState): { hour: number; minute: number } {
  const raw = parseInt(form.clockHour) || 0;
  const min = parseInt(form.clockMinute) || 0;
  if (form.timeMode === '12h') {
    return { hour: shiChenToClockHour(raw), minute: min };
  }
  return { hour: raw, minute: min };
}
