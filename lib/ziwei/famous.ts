/**
 * 名人命盘数据库
 * 基于公开记录的出生日期，时辰为估算值（部分有文献记载）
 */

export interface FamousPerson {
  id: string;
  name: string;
  category: '商业' | '文艺' | '历史' | '体育' | '科技';
  description: string;           // 一句话身份介绍
  year: number;
  month: number;
  day: number;
  hour: number;                  // 时辰地支索引 0-11
  gender: 'male' | 'female';
  notable: string;               // 命盘亮点提示（启发用户兴趣）
}

export const FAMOUS_PERSONS: FamousPerson[] = [
  // ─── 商业传奇 ─────────────────────────────────────────────
  {
    id: 'ma-yun',
    name: '马云',
    category: '商业',
    description: '阿里巴巴创始人',
    year: 1964, month: 9, day: 10, hour: 5,  // 约午时
    gender: 'male',
    notable: '命盘显示极强的破格重建之力，官禄宫星曜与互联网商业帝国高度对应',
  },
  {
    id: 'li-jiacheng',
    name: '李嘉诚',
    category: '商业',
    description: '香港超级富豪，长和系创始人',
    year: 1928, month: 7, day: 29, hour: 3,  // 约寅时
    gender: 'male',
    notable: '财帛宫四化是研究东方首富命盘的绝佳案例，禄存守财，越积越厚',
  },
  {
    id: 'ren-zhengfei',
    name: '任正非',
    category: '商业',
    description: '华为创始人',
    year: 1944, month: 10, day: 25, hour: 3, // 寅时
    gender: 'male',
    notable: '七杀入命格局，一生逆风而行，越打压越强大，倪师七杀理论的活教材',
  },

  // ─── 文艺名人 ─────────────────────────────────────────────
  {
    id: 'zhang-ailing',
    name: '张爱玲',
    category: '文艺',
    description: '中国现代文学巨匠',
    year: 1920, month: 9, day: 30, hour: 1, // 丑时
    gender: 'female',
    notable: '命盘孤独星曜组合与其传奇感情经历、文学成就形成神奇对照',
  },
  {
    id: 'jay-chou',
    name: '周杰伦',
    category: '文艺',
    description: '华语流行音乐天王',
    year: 1979, month: 1, day: 18, hour: 1,  // 丑时（据报道夜间出生）
    gender: 'male',
    notable: '文曲星与贪狼的组合，天生才艺之命，命盘解释了他为何能横跨音乐各风格',
  },
  {
    id: 'wang-fei',
    name: '王菲',
    category: '文艺',
    description: '华语乐坛最具传奇色彩的女歌手',
    year: 1969, month: 8, day: 8, hour: 4,   // 卯时
    gender: 'female',
    notable: '夫妻宫星曜与其两段传奇婚姻高度对应，感情格局极具研究价值',
  },
  {
    id: 'lin-zhiling',
    name: '林志玲',
    category: '文艺',
    description: '台湾名模、演员',
    year: 1974, month: 11, day: 29, hour: 5, // 午时
    gender: 'female',
    notable: '太阴守命的女性美貌典范，命盘完美印证倪师"太阴入命女孩最漂亮"的论断',
  },

  // ─── 科技精英 ─────────────────────────────────────────────
  {
    id: 'steve-jobs',
    name: '乔布斯',
    category: '科技',
    description: '苹果公司联合创始人',
    year: 1955, month: 2, day: 24, hour: 6,  // 午时
    gender: 'male',
    notable: '破军入命格局，被亲生父母遗弃又创建苹果帝国，破而后立的命盘典范',
  },
  {
    id: 'elon-musk',
    name: '马斯克',
    category: '科技',
    description: '特斯拉、SpaceX创始人',
    year: 1971, month: 6, day: 28, hour: 4,  // 卯时
    gender: 'male',
    notable: '杀破狼格局的极致体现，命盘中驿马星旺盛，一生在改变人类未来边界',
  },

  // ─── 体育明星 ─────────────────────────────────────────────
  {
    id: 'yao-ming',
    name: '姚明',
    category: '体育',
    description: 'NBA传奇中锋，中国篮球代言人',
    year: 1980, month: 9, day: 12, hour: 5,  // 午时
    gender: 'male',
    notable: '天梁守命，高大威严，官禄宫星象与其职业成就高度吻合',
  },
  {
    id: 'li-na',
    name: '李娜',
    category: '体育',
    description: '中国网球大满贯得主',
    year: 1982, month: 2, day: 26, hour: 2,  // 寅时
    gender: 'female',
    notable: '七杀化气，命中注定与人竞争，大限流年与法网夺冠时间点精准对应',
  },

  // ─── 历史人物 ─────────────────────────────────────────────
  {
    id: 'kangxi',
    name: '康熙帝',
    category: '历史',
    description: '清朝第四位皇帝，在位61年',
    year: 1654, month: 5, day: 4, hour: 4,  // 约卯时
    gender: 'male',
    notable: '紫微坐命，帝座之尊，命盘是研究帝王格局的极佳案例',
  },
  {
    id: 'qianlong',
    name: '乾隆帝',
    category: '历史',
    description: '清朝第六位皇帝，在位60年',
    year: 1711, month: 9, day: 25, hour: 1,  // 约丑时
    gender: 'male',
    notable: '文昌文曲双星会照，乾隆一朝文化繁盛，命盘与"十全武功"成就高度对应',
  },
  {
    id: 'zhu-yuanzhang',
    name: '朱元璋',
    category: '历史',
    description: '明朝开国皇帝，从乞丐到天子',
    year: 1328, month: 10, day: 21, hour: 6, // 约午时
    gender: 'male',
    notable: '杀破狼格局的极致体现，从社会最底层登顶九五，命盘诠释"时势造英雄"',
  },
  {
    id: 'wang-yangming',
    name: '王阳明',
    category: '历史',
    description: '明朝思想家、军事家，心学创立者',
    year: 1472, month: 10, day: 31, hour: 2, // 约丑时
    gender: 'male',
    notable: '命宫星曜与"致良知""知行合一"的思想体系形成有趣对照',
  },
  {
    id: 'su-shi',
    name: '苏轼',
    category: '历史',
    description: '北宋文学家，书画家，唐宋八大家之一',
    year: 1037, month: 1, day: 8, hour: 3,   // 约寅时
    gender: 'male',
    notable: '文昌文曲双夹命宫，一生宦海沉浮而文艺成就登峰造极，是研究命途与成就关系的经典案例',
  },
  {
    id: 'zeng-guofan',
    name: '曾国藩',
    category: '历史',
    description: '清朝重臣，湘军创立者，中国近代化先驱',
    year: 1811, month: 11, day: 26, hour: 4, // 约卯时
    gender: 'male',
    notable: '命盘稳重而持久，十二正曜分布均匀，是研究"厚积薄发"格局的教科书案例',
  },
];

/** 按分类获取名人 */
export function getFamousByCategory(category: FamousPerson['category']): FamousPerson[] {
  return FAMOUS_PERSONS.filter(p => p.category === category);
}

/** 获取所有分类 */
export const FAMOUS_CATEGORIES: FamousPerson['category'][] = [
  '商业', '文艺', '科技', '体育', '历史',
];