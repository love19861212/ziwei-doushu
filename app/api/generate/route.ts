import { NextRequest, NextResponse } from 'next/server';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo } from '@/lib/ziwei/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, gender, name, province, city, longitude } = body;

    if (!year || !month || !day || hour === undefined || !gender) {
      return NextResponse.json({ error: '缺少必要的出生信息' }, { status: 400 });
    }

    const birthInfo: BirthInfo = {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      gender,
      name: name || '',
      province: province || '',
      city: city || '',
      longitude: longitude ?? 120,
    };

    const chart = generateChart(birthInfo);
    return NextResponse.json(chart);
  } catch (e: unknown) {
    console.error('generate error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '排盘失败' },
      { status: 500 }
    );
  }
}