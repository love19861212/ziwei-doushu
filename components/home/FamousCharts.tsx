'use client';
import type { FamousPerson } from '@/lib/ziwei/famous';

interface FamousChartsProps {
  colors?: any;
  theme?: any;
}

export default function FamousCharts({ colors, theme }: FamousChartsProps) {
  return <div className="py-8"><h2 className="text-xl font-bold text-purple-400 text-center">名人命盘</h2></div>;
}
