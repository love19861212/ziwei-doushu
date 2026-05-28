// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
const { Solar, Lunar } = require("lunar-javascript");

function solar2lunar(year, month, day) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return {
    solar: { year, month, day },
    lunar: {
      year: lunar.getYear(), month: lunar.getMonth(), day: lunar.getDay(),
      yearInChinese: lunar.getYearInChinese(), monthInChinese: lunar.getMonthInChinese(), dayInChinese: lunar.getDayInChinese(),
      isLeapMonth: lunar._p.month < 0,
      ganZhiYear: lunar.getYearInGanZhi(), ganZhiMonth: lunar.getMonthInGanZhi(), ganZhiDay: lunar.getDayInGanZhi(),
      shengXiao: lunar.getShengxiao ? lunar.getShengxiao() : '',
      week: lunar.getWeek(), naYin: lunar.getBaZiNaYin ? lunar.getBaZiNaYin().join(' ') : '',
      positionXi: lunar.getPositionXiDesc ? lunar.getPositionXiDesc() : '',
      positionCai: lunar.getPositionCaiDesc ? lunar.getPositionCaiDesc() : '',
      positionFu: lunar.getPositionFuDesc ? lunar.getPositionFuDesc() : '',
    },
    solarDayInfo: { ganZhiDay: lunar.getDayGan(), zhiDay: lunar.getDayZhi() },
  };
}

function lunar2solar(year, month, day, isLeapMonth) {
  const lunar = Lunar.fromYmd(year, Math.abs(month), day, isLeapMonth);
  const solarObj = lunar._p.solar; const sd = solarObj._p;
  return {
    lunar: { year, month: Math.abs(month), day, isLeapMonth },
    solar: { year: sd.year, month: sd.month, day: sd.day, week: solarObj.getWeek(), weekInChinese: solarObj.getWeekInChinese() },
    lunarDayInfo: {
      yearInChinese: lunar.getYearInChinese(), monthInChinese: lunar.getMonthInChinese(), dayInChinese: lunar.getDayInChinese(),
      ganZhiYear: lunar.getYearInGanZhi(), ganZhiMonth: lunar.getMonthInGanZhi(), ganZhiDay: lunar.getDayInGanZhi(),
      shengXiao: lunar.getShengxiao ? lunar.getShengxiao() : '', naYin: lunar.getBaZiNaYin ? lunar.getBaZiNaYin().join(' ') : '',
    },
  };
}

export async function POST(req) {
  try {
    const { type, year, month, day, isLeapMonth } = await req.json();
    if (!type || !year || !month || !day) return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    if (type === "solar-to-lunar") return NextResponse.json(solar2lunar(year, month, day));
    if (type === "lunar-to-solar") return NextResponse.json(lunar2solar(year, month, day, isLeapMonth || false));
    return NextResponse.json({ error: "type 必须是 solar-to-lunar 或 lunar-to-solar" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}