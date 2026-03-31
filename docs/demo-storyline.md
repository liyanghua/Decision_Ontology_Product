# 可演示故事线（DEMO 串联）

面向产品演示与高管汇报：从经营搭档首页出发，用一条完整路径讲清「今日重点 → 商品诊断 → 动作拍板 → 推进结果 → 结果复盘 → 形成经验」。

高管 / 内部对齐的一页口径见 [ceo-demo-brief.md](./ceo-demo-brief.md)。

## 环境前提

- 本地已加载商品队列（CSV 驱动 `liveCatalog` 非空）。队列为空时首页会引导前往商品操盘台。

## 故事线说明（6 步话术）

1. **今日重点**：首页先讲三件事，今天看什么、现在先做什么、这次处理有没有被记住。
2. **商品诊断**：进入单个商品，看根因、推荐打法、动作区和主线下一步；从这里开始，后续页面都跟同一条 `actionId` 继续走。
3. **动作拍板**：进入动作拍板，只确认这条推荐打法要不要放行，不展开后台集成细节。
4. **推进结果**：放行后去推进结果，看这条动作是在推进中、需要恢复，还是已经处理完成。
5. **结果复盘**：进入结果复盘，对照处理前后的盘面变化，说明为什么当时这么判断。
6. **形成经验**：在结果复盘页点「形成经验」，让首页出现“系统已记住这次处理”的反馈，完成闭环。

## 涉及页面（路由）

| 路径 | 角色 |
|------|------|
| `/` | 经营搭档首页 |
| `/products/:productId` | 商品诊断详情 |
| `/approvals` | 动作拍板 |
| `/execution` | 推进结果 |
| `/replay` | 结果复盘（主线建议带 `?actionId=&goodsId=`） |
| （全局弹窗） | 复盘沉淀对话框 |

## 建议演示顺序

| 步骤 | 停留点 | 操作 |
|------|--------|------|
| 1 | 首页 | 指「今日重点」「现在先做什么」「这次处理有没有被记住」 |
| 2 | 首页 | 点当前最该处理的一条 → 进入详情 |
| 3 | 详情 | 滚动浏览诊断 / 推荐打法 / 动作区；指「主线下一步」 |
| 4 | 拍板 | 点「去拍板」，走 1～2 个演示操作 |
| 5 | 推进结果 | 点「去推进结果」，指正在推进 / 需要恢复 / 已处理完成 |
| 6 | 结果复盘 | 点「看结果复盘」，指前后对照、主线进度和沉淀路径 |
| 7 | 结果复盘 | 点「形成经验」，完成闭环 |

## 本轮涉及文件（实现清单）

- [`docs/demo-storyline.md`](demo-storyline.md)（本文档）
- [`src/app/data/operatorHome/operatorHomeData.ts`](../src/app/data/operatorHome/operatorHomeData.ts) — 欢迎语、摘要、快捷任务；优先跟进与待审商品对齐（可选排序）
- [`src/app/data/decisionCards/mapFromOperatorHome.ts`](../src/app/data/decisionCards/mapFromOperatorHome.ts) — 决策卡默认句微调
- [`src/app/pages/OperatorHome.tsx`](../src/app/pages/OperatorHome.tsx) — 空队列提示
- [`src/app/components/operatorHome/TodaySummaryPanel.tsx`](../src/app/components/operatorHome/TodaySummaryPanel.tsx)
- [`src/app/components/operatorHome/OpportunityRiskBoard.tsx`](../src/app/components/operatorHome/OpportunityRiskBoard.tsx)
- [`src/app/components/operatorHome/SuggestedActionList.tsx`](../src/app/components/operatorHome/SuggestedActionList.tsx)
- [`src/app/components/operatorHome/InProgressTaskList.tsx`](../src/app/components/operatorHome/InProgressTaskList.tsx)
- [`src/app/components/operatorHome/QuickTaskGrid.tsx`](../src/app/components/operatorHome/QuickTaskGrid.tsx)
- [`src/app/pages/ProductDiagnosisDetail.tsx`](../src/app/pages/ProductDiagnosisDetail.tsx) — 下一跳条、用户向弱技术文案
- [`src/app/pages/ApprovalCenter.tsx`](../src/app/pages/ApprovalCenter.tsx)
- [`src/app/pages/ExecutionOutcome.tsx`](../src/app/pages/ExecutionOutcome.tsx)
- [`src/app/pages/ReplayExplain.tsx`](../src/app/pages/ReplayExplain.tsx)
- [`src/app/components/review/ReviewLearningStrip.tsx`](../src/app/components/review/ReviewLearningStrip.tsx)
- [`src/app/components/review/ReviewDepositionDialog.tsx`](../src/app/components/review/ReviewDepositionDialog.tsx)
