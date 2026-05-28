import type { Book } from '../types';

export const huangDiNeiJing: Book = {
  title: '黄帝内经·素问',
  slug: 'huangdineijing',
  dynasty: '先秦两汉',
  author: '托名黄帝',
  intro: '中医理论根基，托名黄帝与岐伯等问答。现存最早的中医理论专著，奠定脏腑经络、阴阳五行、病因病机、诊法治则的理论基础。本平台作传统医学文化研读，不构成诊疗建议。',
  wordCount: 54689,
  chapters: [
    {
      title: '01上古天真论',
      subtitle: '法于阴阳 · 恬惔虚无',
      paragraphs: [
        { id: 'huangdineijing-0-0', idx: 0, text: '上古之人，其知道者，法于阴阳，和于术数，食饮有节，起居有常，不妄作劳，故能形与神俱，而尽终其天年，度百岁乃去。' },
        { id: 'huangdineijing-0-1', idx: 1, text: '恬惔虚无，真气从之，精神内守，病安从来。' },
        { id: 'huangdineijing-0-2', idx: 2, text: '志闲而少欲，心安而不惧，形劳而不倦，气从以顺。' },
      ],
    },
    {
      title: '02四气调神大论',
      subtitle: '四时阴阳 · 治未病',
      paragraphs: [
        { id: 'huangdineijing-1-0', idx: 0, text: '春三月，此谓发陈，天地俱生，万物以荣。夜卧早起，广步于庭，被发缓形，以使志生。' },
        { id: 'huangdineijing-1-1', idx: 1, text: '夫四时阴阳者，万物之根本也。所以圣人春夏养阳，秋冬养阴，以从其根。' },
        { id: 'huangdineijing-1-2', idx: 2, text: '是故圣人不治已病治未病，不治已乱治未乱，此之谓也。' },
      ],
    },
    {
      title: '03阴阳应象大论',
      subtitle: '阴阳为天地之道 · 治病求本',
      paragraphs: [
        { id: 'huangdineijing-2-0', idx: 0, text: '阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也。' },
        { id: 'huangdineijing-2-1', idx: 1, text: '治病必求于本。' },
        { id: 'huangdineijing-2-2', idx: 2, text: '清阳为天，浊阴为地。地气上为云，天气下为雨。' },
      ],
    },
  ],
};