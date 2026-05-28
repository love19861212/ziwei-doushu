import type { Book } from '../types';

export const qingNangJing: Book = {
  slug: 'qingnangjing',
  title: '青囊经',
  dynasty: '秦汉',
  author: '相传黄石公',
  intro: '理气派开山祖经，分上中下三卷。"形止气蓄"成语出于此经。地纪堪舆研读的核心经典之一。本平台作传统文化研读，重义理源流。',
  wordCount: 300,
  chapters: [
    {
      title: '01上卷·化始',
      subtitle: '天地之数 · 阴阳化生',
      paragraphs: [
        { id: 'qingnangjing-0-0', idx: 0, text: '天尊地卑，阳奇阴偶。一六共宗，二七同道，三八为朋，四九为友，五十同途。' },
        { id: 'qingnangjing-0-1', idx: 1, text: '阳以相阴，阴以含阳。阳生于阴，柔生于刚。阴德弘济，阳德顺昌。' },
        { id: 'qingnangjing-0-2', idx: 2, text: '是故阳本阴，阴育阳。天依形，地附气。此之谓化始。' },
      ],
    },
    {
      title: '02中卷·化机',
      subtitle: '天星地行 · 因形察气',
      paragraphs: [
        { id: 'qingnangjing-1-0', idx: 0, text: '天有五星，地有五行。天分星宿，地列山川。气行于地，形丽于天。' },
        { id: 'qingnangjing-1-1', idx: 1, text: '因形察气，以立人纪。' },
        { id: 'qingnangjing-1-2', idx: 2, text: '阴用阳朝，阳用阴应。阴阳相见，福禄永贞。冲阳和阴，万物化生。' },
      ],
    },
    {
      title: '03下卷·化成',
      subtitle: '无极太极 · 形止气蓄为上地',
      paragraphs: [
        { id: 'qingnangjing-2-0', idx: 0, text: '无极而太极也。理寓于气，气囿于形。' },
        { id: 'qingnangjing-2-1', idx: 1, text: '地德上载，天光下临。阴用阳朝，阳用阴应。' },
        { id: 'qingnangjing-2-2', idx: 2, text: '是故形止气蓄，化生万物，为上地也。' },
      ],
    },
  ],
};