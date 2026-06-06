import type { BirthFormState } from '@/components/BirthForm';
import type { BirthInfo } from './types';

/** 根据北京时间 + 经度计算真太阳时时辰支 (0-11) */
export function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;  // 2026-06-06 fix: 反符号
  const solar = ((clockMins + offset) % 1440 + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

/** 同步版本（保留给非农历场景如 chart/page.tsx） */
export function formToBirthInfo(form: BirthFormState): BirthInfo {
  let y = parseInt(form.year) || 0;
  let m = parseInt(form.month) || 0;
  let d = parseInt(form.day) || 0;

  if (!form.unknownTime) {
    const clockHour = parseInt(form.clockHour) || 0;
    if (clockHour === 23 && y > 0 && m > 0 && d > 0) {
      const next = new Date(y, m - 1, d + 1);
      y = next.getFullYear();
      m = next.getMonth() + 1;
      d = next.getDate();
    }
  }

  const hour = form.unknownTime
    ? 0
    : calcTrueSolarBranch(parseInt(form.clockHour) || 0, parseInt(form.clockMinute) || 0, form.longitude);

  return {
    year: y, month: m, day: d,
    hour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
  };
}

/** 异步版本（支持农历自动转公历，用于合盘页面） */
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

  if (!form.unknownTime) {
    const clockHour = parseInt(form.clockHour) || 0;
    if (clockHour === 23 && y > 0 && m > 0 && d > 0) {
      const next = new Date(y, m - 1, d + 1);
      y = next.getFullYear();
      m = next.getMonth() + 1;
      d = next.getDate();
    }
  }

  const hour = form.unknownTime
    ? 0
    : calcTrueSolarBranch(parseInt(form.clockHour) || 0, parseInt(form.clockMinute) || 0, form.longitude);

  return {
    year: y, month: m, day: d,
    hour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
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
    clockHour: params.get('h') || '8',
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

/** 返回真太阳时 24 小时制下的"钟表显示"（含 EoT 近似）
 *  - 用作 UI 提示 / 调试 / 给文墨天机对齐
 *  - 暂未接入排盘（iztro 用 timeIndex 0-12）
 */
export function calcTrueSolarHM(clockHour: number, clockMinute: number, longitude: number, dayOfYear: number = 11): string {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (120 - longitude) * 4;
  // EoT 近似公式（年度）：9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B)
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const total = clockMins + offset + eot;
  const solar = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(solar / 60);
  const m = Math.round(solar % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}
