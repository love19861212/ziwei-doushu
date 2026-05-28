import type { Book } from '../types';

export const zangShu: Book = {
  title: '葬书',
  slug: 'zangshu',
  dynasty: '东晋',
  author: '郭璞',
  intro: '风水形势派开山祖经，"风水"一词典出于此。郭璞《葬书》立"乘生气""藏风聚气""得水为上"等堪舆总纲，是地纪堪舆研读的第一经典。本平台作传统文化研读，重义理源流。',
  wordCount: 500,
  chapters: [
    {
      title: '01生气篇',
      subtitle: '葬乘生气 · 风水定义',
      paragraphs: [
        { id: 'zangshu-0-0', idx: 0, text: '葬者，乘生气也。五气行乎地中，发而生乎万物。' },
        { id: 'zangshu-0-1', idx: 1, text: '气乘风则散，界水则止。古人聚之使不散，行之使有止，故谓之风水。' },
        { id: 'zangshu-0-2', idx: 2, text: '风水之法，得水为上，藏风次之。' },
      ],
    },
    {
      title: '02形势篇',
      subtitle: '土气水之辨 · 势形方次第',
      paragraphs: [
        { id: 'zangshu-1-0', idx: 0, text: '土者气之体，有土斯有气。气者水之母，有气斯有水。' },
        { id: 'zangshu-1-1', idx: 1, text: '葬者，原其起，乘其止。' },
        { id: 'zangshu-1-2', idx: 2, text: '占山之法，以势为难，而形次之，方又次之。' },
      ],
    },
    {
      title: '03四神砂水篇',
      subtitle: '青龙白虎朱雀玄武 · 形止气蓄',
      paragraphs: [
        { id: 'zangshu-2-0', idx: 0, text: '夫葬以左为青龙，右为白虎，前为朱雀，后为玄武。玄武垂头，朱雀翔舞，青龙蜿蜒，白虎驯俯。' },
        { id: 'zangshu-2-1', idx: 1, text: '形止气蓄，化生万物，为上地也。' },
        { id: 'zangshu-2-2', idx: 2, text: '夫土欲细而坚，润而不泽，裁肪切玉，备具五色。' },
      ],
    },
  ],
};