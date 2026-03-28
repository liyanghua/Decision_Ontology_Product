设计一个企业级 SaaS Web 产品原型，产品名称为：

**操盘智能 MVP / Operator Intelligence MVP**

该产品面向电商经营增长场景，当前只聚焦一个最小闭环场景：
**商品诊断 Product Diagnosis**

这个产品不是本体建设后台，不是通用知识管理平台，也不是聊天式问答工具。
它是一个面向经营操盘者的决策交互产品，帮助用户围绕具体商品完成：

* 发现高优先级优化对象
* 理解商品当前经营问题
* 查看根因、策略与动作建议
* 批准或调整动作
* 跟踪执行与结果反馈

## 产品角色

核心用户是：

* 经营操盘者
* 品类负责人
* 商品运营负责人
* 增长负责人

辅助用户是：

* 策略产品经理
* 算法工程师
* 业务专家

## MVP 核心目标

围绕某个商品，完成这条链路：

1. 看到它为什么值得关注
2. 看见其经营诊断结果
3. 看见 Evidence / Problem / RootCause / Strategy / Action Plan
4. 能查看解释和知识支持
5. 能进行动作审批
6. 能看到执行状态和结果反馈

## 产品总体风格

请设计成一个专业、克制、可信的企业级 SaaS 工作台，偏“经营控制面 / 操盘台”风格。

要求：

* 桌面端，1440 或 1600 宽
* 左侧固定导航栏
* 顶部为全局筛选、版本、时间窗口、搜索
* 主区域适合：

  * 表格
  * 卡片
  * 结构化诊断结果
  * JSON / schema 摘要
  * 抽屉
  * tabs
  * 差异对比
  * 审批按钮
  * 执行状态时间线
* 右侧支持详情抽屉、知识支持抽屉、审批抽屉
* 浅色界面，蓝色强调色，灰色结构层，少量绿色/橙色/红色表示风险和状态
* 不要过度炫技，不要大屏风，不要复杂图谱大画布，不要聊天机器人布局

## 页面结构

请生成以下核心页面原型，并确保页面间能形成交互流：

### 1. Today Command / 今日操盘台

操盘首页。展示：

* 今日最值得关注的商品
* 高风险商品
* 待拍板动作
* 当前目标偏离
* 最近异常信号

### 2. Product Action Board / 商品操盘台

商品列表 + 商品诊断摘要。
展示：

* 商品优先级
* 当前问题
* 根因
* 推荐策略
* 风险等级
* 可执行动作数

### 3. Product Diagnosis Detail / 商品诊断详情

这是 MVP 核心页。展示：

* 商品基本信息
* 核心经营指标
* Evidence Pack 摘要
* Problem / State
* RootCause 排序
* Strategy 建议
* Action Plan
* Knowledge Support
* 历史诊断结果
* 决策解释

### 4. Action Approval Center / 动作审批中心

展示：

* 待审批动作
* 风险等级
* 适用商品
* 建议原因
* 预期影响
* 批准 / 驳回 / 延后入口

### 5. Execution & Outcome / 执行与结果

展示：

* 已下发动作
* 当前执行状态
* 执行日志摘要
* 异常与失败
* 实际效果 vs 预期效果

### 6. Replay & Explain / 回放与解释

给策略产品、业务专家和算法团队使用。
展示：

* 输入上下文
* Evidence
* Problem
* RootCause
* Strategy
* Action Plan
* Knowledge Support
* 版本差异
* expected vs actual

## 关键交互要求

请确保以下交互被体现：

* 从首页点击商品进入商品操盘台
* 从商品操盘台点击某商品进入商品诊断详情
* 从商品诊断详情点击“批准动作”进入审批中心
* 从执行与结果页点击某条执行记录查看详情
* 从诊断详情点击“查看解释”打开右侧抽屉
* 从诊断详情点击“知识支持”打开知识抽屉
* 从诊断详情点击“历史版本”查看版本差异
* 从 Replay 页面点击某个根因、策略或 evidence 进入对应详情抽屉
* 所有主按钮都要有对应结果，不要出现无效按钮

## 页面必须体现的状态

每个核心页面请体现：

* loading
* empty
* error
* normal
* warning
* pending approval
* approved
* rejected
* running
* failed
* completed

## 商品诊断场景的核心结构

请让系统围绕以下结构组织信息：

* 商品 Product
* 线索 Signal
* 诊断结果 Diagnosis
* Evidence
* Problem
* RootCause
* Strategy
* Action Plan
* Approval
* Execution
* Outcome
* Knowledge Support

## 对知识库的处理方式

当前知识库是非结构化文档，不是本体真源。
在原型中请把知识库作为：

* supporting knowledge
* expert guidance
* related knowledge
* strategy explanation source

不要把知识库设计成资产真源编辑器。

## 真实感 mock 数据要求

请使用真实电商经营语境，不要使用 lorem ipsum。
例如：

* 商品：P100891 / 春夏凉感四件套
* 类目：床上四件套
* 品牌：梓晨家居
* ctr_7d = 1.2%
* impression_7d = 18,230
* category_ctr_p30 = 2.1%
* main_image_quality_score = 0.42
* title_relevance_score = 0.87
* root cause：主图吸引力弱 / 标题匹配低 / 价格带偏差
* strategy：主图优化策略 / 标题优化策略
* action：生成新主图方案 / 发起 AB test / 调整标题关键词

## 请输出要求

请生成接近可评审、可演示、可继续细化的高保真原型，而不是概念图。
优先保证：

* 页面逻辑清晰
* 主操作链可走通
* 信息层级合理
* 角色视角明确
* 按钮、tab、卡片、抽屉、状态都具备交互意义
