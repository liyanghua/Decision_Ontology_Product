# 可演示故事线（DEMO 串联）

面向产品演示与高管汇报：从经营搭档首页出发，用一条完整路径讲清「发现重点 → 诊断与打法 → 审批推进 → 看执行 → 看结果 → 形成经验」。

## 环境前提

- 本地已加载商品队列（CSV 驱动 `liveCatalog` 非空）。队列为空时首页会引导前往商品操盘台。

## 故事线说明（8 步话术）

1. **今日重点**：首页「今日重点」看目标进度与盘面判断；下方「今日优先跟进」决策卡按优先级排队。
2. **点高优先级商品**：点击优先跟进卡片进入商品诊断详情（链接带 `from=home`，顶栏有轻提示）。
3. **看诊断 / 策略 / 动作**：中间栏按步骤浏览核心结论、策略决策卡与 Action Plan；侧边可看风险与待审批入口。
4. **去审批**：用主栏「下一步」条的 **去审批**，或侧栏「立即审批」进入动作审批中心。
5. **看执行**：审批演示完成后，用 **看执行** 进入「执行与结果」看进度与完成态。
6. **看结果**：用 **看结果** 进入「回放与解释」，按商品对比指标与诊断快照（演示数据）。
7. **形成经验**：在执行页、诊断页复盘区或首页「已完成」任务上 **沉淀复盘 / 记入复盘**；提交后顶栏可出现「系统已记住」提示，并可跳转回放页查看沉淀路径示意。
8. **可选收口**：强调「同一套语言贯穿：今日重点、关键风险、优先处理、推荐打法、去推进、看结果、形成经验」。

## 涉及页面（路由）

| 路径 | 角色 |
|------|------|
| `/` | 经营搭档首页 |
| `/products/:productId` | 商品诊断详情 |
| `/approvals` | 动作审批中心 |
| `/execution` | 执行与结果 |
| `/replay` | 回放与解释（可带 `?goodsId=`） |
| （全局弹窗） | 复盘沉淀对话框 |

## 建议演示顺序

| 步骤 | 停留点 | 操作 |
|------|--------|------|
| 1 | 首页 | 指「今日重点」KPI 与优先跟进卡片 |
| 2 | 首页 | 点第一条优先跟进 → 进入详情 |
| 3 | 详情 | 滚动浏览诊断 / 策略 / 动作；指「下一步」条 |
| 4 | 审批 | 点「去审批」，走 1～2 个演示操作 |
| 5 | 执行 | 点「看执行」，指进行中/已完成示例 |
| 6 | 回放 | 点「看结果」，指对比与路径示意 |
| 7 | 执行或详情或首页 | 点「沉淀复盘/记入复盘」，完成闭环 |

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
