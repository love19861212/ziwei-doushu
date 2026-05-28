// db-analysis stub - data exported from patterns.ts or inline
import type { ZiweiChart } from './types';

export interface StarContent {
  mingGong: string;
  personality: string;
  xiongDi?: string;
  fuQi: string;
  ziNv?: string;
  caiBo: string;
  jiE: string;
  qianYi?: string;
  jiaoYou?: string;
  guanLu: string;
  tianZhai?: string;
  fuDe?: string;
  fuMu?: string;
}

export const STAR_DB: Record<string, StarContent> = {};

export const TOPIC_LABEL: Record<string, string> = {
  overview: '总览',
  personality: '性格',
  love: '感情',
  career: '事业',
  wealth: '财运',
  health: '健康',
  family: '家庭',
  children: '子女',
  move: '迁移',
  friends: '朋友',
  home: '田宅',
  spirit: '精神',
  parents: '父母',
};

export const TOPIC_PALACE_NAME: Record<string, string> = {
  overview: '命宫',
  personality: '命宫',
  love: '夫妻宫',
  career: '官禄宫',
  wealth: '财帛宫',
  health: '疾厄宫',
  family: '兄弟宫',
  children: '子女宫',
  move: '迁移宫',
  friends: '交友宫',
  home: '田宅宫',
  spirit: '福德宫',
  parents: '父母宫',
};

export function analyzeDb(chart: ZiweiChart) {
  return {};
}

export type TopicKey = string;
