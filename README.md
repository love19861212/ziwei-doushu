# 紫微斗数 myys 站

> 在线排盘 + AI 解读 + 知识库反查 + 全盘报告 — 仿 Oracle 站 (wdyziweidoushu666.com) 核心功能完整版

🌐 **在线**: https://myys.54321.asia

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| **紫微斗数排盘** | 支持 14 主星 × 12 宫 × 大限流年 |
| **AI 解读** | 8 大主题 (overall/career/love/wealth/health/family/year/decade) 深度分析 |
| **知识库反查** | 168 条倪海夏《天纪》+《紫微斗数全书》+《骨髓赋》原文 |
| **24 种双星同宫** | 紫微+破军/天府+太阴/武曲+贪狼 等智能识别 |
| **三方四正 + 夹宫** | 智能计算宫位的三合方/对宫/夹宫 |
| **14 主星亮度表 (5 派)** | 默认/《全书》/现代修正 v1/中州/现代修正 v2 |
| **大限详解卡片** | 12 运 × 主星 × 四化 (禄权科忌) |
| **6 档时间维度 tab** | 本命 / 大限 / 流年 / 流月 / 流日 / 流时 |
| **AI 对话历史** | localStorage 持久化，刷新不丢 |
| **全盘报告 (付费墙)** | 仿 Oracle 站 402 状态 + PRO 完整 Markdown |
| **命盘分享** | URL 一键分享，扫码可看 |
| **方阵分析** | 紫微方阵 vs 天府方阵主星分布 |

## 🚀 技术栈

| 项 | 选型 |
|---|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 排盘核心 | 自研 lib/ziwei/ (从 iztro 改进) |
| AI 解读 | MiniMax API (主) + 文心一言 (备) |
| 知识库 | 本地 JSON (lib/ziwei/oracle_kb.json 217KB) + 反查 |
| 部署 | PM2 + nginx 反代 |
| 反查 | curl Oracle 站 SSR 知识库 → 解析 → 本地 JSON |

## 📁 目录结构

```
myys/
├── app/
│   ├── page.tsx                 # 首页 (排盘表单)
│   ├── chart/page.tsx           # 排盘结果页 (onStarClick 弹窗)
│   ├── api/
│   │   ├── chart/route.ts       # 排盘 API
│   │   ├── lookup-tabs/         # 知识库查表 API
│   │   ├── analysis/            # 主题分析 API (8 topic)
│   │   └── report/              # 全盘报告 API (402/200)
│   ├── diji/                    # 地纪 (玄空风水)
│   ├── heming/                  # 赫咩 (奇门遁甲)
│   ├── library/                 # 知识库浏览
│   └── calendar/                # 农历/公历转换
├── components/
│   ├── chart/                   # 排盘核心组件
│   │   ├── ChartBoard.tsx       # 12 宫盘
│   │   ├── TimeNav.tsx          # 6 档时间 tab
│   │   ├── TopBar.tsx
│   │   └── ...
│   ├── insight/
│   │   └── InsightPanel.tsx     # AI 解读 (8 主题)
│   ├── ShareModal.tsx           # 命盘分享弹窗
│   ├── ShareCardCanvas.tsx      # 命盘卡片
│   ├── ReportModal.tsx          # 全盘报告弹窗
│   ├── BrightnessSchoolSelector.tsx  # 亮度表选择
│   ├── DaXianPanel.tsx          # 大限卡片
│   ├── StarDetailPanel.tsx      # 星曜弹窗
│   ├── PatternsCard.tsx         # 格局卡
│   └── ...
├── lib/ziwei/                   # 排盘核心算法
│   ├── types.ts                 # 类型定义
│   ├── constants.ts             # 常量 (14主星/12地支/十天干/四化)
│   ├── chart.ts                 # 排盘主函数
│   ├── patterns.ts              # 37 格局识别
│   ├── double-stars.ts          # 24 种双星同宫
│   ├── sanfang.ts               # 三方四正 + 夹宫
│   ├── brightness-schools.ts    # 5 派亮度表 (840 数据)
│   ├── fang-zhen.ts             # 紫微方阵 vs 天府方阵
│   ├── school-config.ts         # 9 类排盘开关
│   ├── oracle_kb.json           # ★ 168 条 Oracle 反查数据 (217KB)
│   ├── history.ts               # 历史记录
│   └── share.ts                 # URL 序列化
└── public/
    └── lib/jspdf.umd.min.js     # PDF 导出库 (CDN 备用)
```

## 📦 重要文件

| 文件 | 大小 | 用途 |
|------|------|------|
| `lib/ziwei/oracle_kb.json` | 217KB | Oracle 反查数据 (168 条) |
| `lib/ziwei/double-stars.ts` | 14KB | 24 种双星同宫定义 |
| `lib/ziwei/sanfang.ts` | 7KB | 三方四正 + 夹宫 |
| `lib/ziwei/brightness-schools.ts` | 12KB | 5 派亮度表 |
| `lib/ziwei/fang-zhen.ts` | 4KB | 紫微方阵 vs 天府方阵 |
| `lib/ziwei/school-config.ts` | 5KB | 9 类排盘开关 |
| `app/api/report/route.ts` | 7.5KB | 全盘报告 API (402/200) |
| `app/api/lookup-tabs/route.ts` | - | 知识库查表 |
| `app/api/analysis/route.ts` | - | 主题分析 |
| `components/ReportModal.tsx` | 14KB | 报告弹窗 |
| `components/insight/InsightPanel.tsx` | - | AI 解读 (历史持久化) |

## 🔄 Git 提交记录 (近 10 个)

| 提交 | 功能 |
|------|------|
| edf0ba7 | 📄 全盘报告按钮 + ReportModal (前端接 402 付费墙) |
| 8fd84ab | /api/report API (402 状态 + PRO 完整报告) |
| 272bae6 | AI 问答历史 localStorage 持久化 |
| 806e85b | 6 档时间维度 tab (本命/大限/流年/流月/流日/流时) |
| e210d8b | 大限详解卡片 (12 运 + 四化) |
| 183e8b3 | 14 主星亮度表 5 派系切换 |
| 6d18e92 | 三方四正 + 夹宫智能计算 |
| 881e3ce | 24 种双星同宫智能识别 |
| a16e513 | API 反查 Oracle 知识库 (168 条) |
| d705239 | 流日/流时切换 + /api/lookup-tabs + /api/analysis |

## 🎯 Oracle 站 vs myys 站 对标

| Oracle 站功能 | myys 站 |
|-------------|---------|
| /api/lookup-tabs | ✅ 优先 oracle_kb，fallback 本地 |
| /api/analysis | ✅ 8 主题结构化输出 |
| /api/report (402 付费墙) | ✅ FREE 402 + PRO 200 |
| 14 主星亮度表 (5 派) | ✅ |
| 24 种双星同宫 | ✅ |
| 37 格局 | ✅ detectPatterns() |
| 三方四正 | ✅ |
| 大限详解 | ✅ |
| 6 档时间维度 | ✅ |
| 紫微方阵/天府方阵 | ✅ analyzeFangZhen() |
| 9 类排盘开关 | ✅ lib/ziwei/school-config.ts |
| AI 对话历史 | ✅ localStorage 持久化 |
| 真太阳时 | ✅ calcTrueSolarBranch() |
| 命盘分享 URL | ✅ /chart?n=...&y=... |

## 🛠️ 本地开发

```bash
cd /root/ziwei-doushu
npm install
npm run dev  # http://localhost:3000
```

## 🚀 部署 (PM2 + VPS)

```bash
# VPS: 150.109.76.177 (root)
ssh root@150.109.76.177
cd /root/ziwei-doushu
git pull origin master
npm install
npm run build
pm2 delete ziwei-doushu
pm2 start npm --name ziwei-doushu -- start
pm2 save
```

## 📚 知识库数据来源

- **倪海夏《天纪 01-14》** — 主解读
- **《紫微斗数全书》** — 古籍原典
- **《骨髓赋》** — 格局论断
- **《紫微斗数全集》** — 补充
- **陈世兴《现代紫微斗数》** — 现代修正 v1
- **陆斌兆 + 方外人** — 中州派

## ⚠️ 鉴权状态

- 鉴权系统暂未实现（演示版）
- /api/report 用 `options.pro` 模拟 PRO 用户
- 正式商用前需接入：
  - NextAuth.js 鉴权
  - 微信/支付宝支付
  - 用户后台 + 订阅管理

## 🌐 域名

- 生产: https://myys.54321.asia (主)
- GitHub: https://github.com/love19861212/ziwei-doushu

## 👤 团队

- **金莲** 💃 (AI 助手) - 全栈开发
- **大郎** (产品/运营) - 项目负责人

## 📜 License

私有项目，未开源。
