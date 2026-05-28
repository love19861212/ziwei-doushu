declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    _p: { year: number; month: number; day: number; hour: number; minute: number; second: number };
    getWeek(): number;
    getWeekInChinese(): string;
    getDate(): Date;
    toDateString(): string;
    toFullString(): string;
    toString(): string;
  }
  export class Lunar {
    static fromYmd(year: number, month: number, day: number, isLeapMonth?: boolean): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getYearInGanZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthInGanZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayInGanZhi(): string;
    getDayGanExact(): string;
    getDayZhiExact(): string;
    getDayInGanZhiExact(): string;
    getShengxiao(): string;
    getNaYin(): string;
    getWeek(): number;
    getWeekInChinese(): string;
    getPositionXiDesc(): string;
    getPositionCaiDesc(): string;
    getPositionFuDesc(): string;
    getPositionXi(): string;
    _p: any;
  }
}
