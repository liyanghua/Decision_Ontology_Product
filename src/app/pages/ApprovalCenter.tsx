import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  Settings,
  TrendingUp,
  ShieldAlert,
  History,
  BookOpen,
  FileText,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import { actions, products, strategies } from '../data/mockData';
import { inferPhaseForContext } from '../data/sop/diagnosisFlowSkeleton';
import { inferProblemKeyFromText, resolveKnowledgeSupport } from '../data/expertKnowledge';
import { SopFlowCompactBar } from '../components/knowledge/SopFlowCompactBar';
import { FlowSupportDrawer } from '../components/knowledge/FlowSupportDrawer';

export function ApprovalCenter() {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(
    actions.filter(a => a.status === 'pending')[0]?.id || null
  );
  const [showParamsModal, setShowParamsModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [flowSupportOpen, setFlowSupportOpen] = useState(false);

  const pendingActions = actions.filter(a => a.status === 'pending');

  const approvalSopPhase = useMemo(
    () =>
      inferPhaseForContext({
        route: 'approvals',
        hasGoodsId: true,
        hasMetricsRow: true,
        hasStructuredDiagnosis: true,
        pendingActionCount: pendingActions.length,
      }),
    [pendingActions.length],
  );

  const selectedAction = actions.find(a => a.id === selectedActionId);
  const selectedProduct = selectedAction ? products.find(p => p.id === selectedAction.productId) : null;
  const relatedStrategy = selectedAction ? strategies[selectedAction.productId as keyof typeof strategies]?.find(
    s => s.id === selectedAction.strategyId
  ) : null;

  const approvalResolved = useMemo(() => {
    if (!selectedAction || !selectedProduct) {
      return resolveKnowledgeSupport({
        page: 'action_approval',
        stageKey: approvalSopPhase,
      });
    }
    return resolveKnowledgeSupport({
      page: 'action_approval',
      goodsId: selectedProduct.id,
      category: selectedProduct.category,
      problemKey: inferProblemKeyFromText(selectedAction.reason ?? ''),
      actionKey: selectedAction.id,
      riskKey: selectedAction.riskLevel,
      stageKey: approvalSopPhase,
    });
  }, [selectedAction, selectedProduct, approvalSopPhase]);

  const handleApprove = () => {
    alert('动作已批准，将进入执行队列');
  };

  const handleReject = () => {
    alert('动作已驳回');
  };

  const handleDefer = () => {
    alert('动作已延后处理');
  };

  if (!selectedAction || !selectedProduct) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">暂无待审批动作</div>
          <div className="text-sm text-gray-600 mb-6">所有动作已处理完成</div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回商品操盘台
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left: Action Queue */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-1">待审批动作</h2>
          <div className="text-sm text-gray-600">{pendingActions.length} 个待处理</div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>全部风险等级</option>
            <option>高风险优先</option>
            <option>中风险</option>
            <option>低风险</option>
          </select>
        </div>

        {/* Action List */}
        <div className="flex-1 overflow-y-auto">
          {pendingActions.map((action, index) => {
            const product = products.find(p => p.id === action.productId);
            return (
              <button
                key={action.id}
                onClick={() => setSelectedActionId(action.id)}
                className={`w-full px-6 py-4 border-b border-gray-100 text-left transition-colors ${
                  selectedActionId === action.id
                    ? 'bg-orange-50 border-l-4 border-l-orange-600'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Priority Badge */}
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    index === 0 ? 'bg-red-100 text-red-700' :
                    index === 1 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">{action.id}</span>
                      {action.riskLevel === 'high' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 text-xs rounded">
                          高风险
                        </span>
                      )}
                      {action.riskLevel === 'medium' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-orange-700 text-xs rounded">
                          中风险
                        </span>
                      )}
                      {action.riskLevel === 'low' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                          低风险
                        </span>
                      )}
                    </div>
                    
                    <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                      {action.name}
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {product?.name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {action.type}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Clock className="w-3 h-3" />
                  {action.createdAt}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-gray-600 mb-1">高风险</div>
              <div className="font-semibold text-red-600">
                {pendingActions.filter(a => a.riskLevel === 'high').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">中风险</div>
              <div className="font-semibold text-orange-600">
                {pendingActions.filter(a => a.riskLevel === 'medium').length}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">低风险</div>
              <div className="font-semibold text-green-600">
                {pendingActions.filter(a => a.riskLevel === 'low').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Action Details */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          <SopFlowCompactBar
            stageKey={approvalSopPhase}
            onOpenFlow={() => setFlowSupportOpen(true)}
          />
          <p className="text-xs text-gray-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
            当前处于 SOP「优化动作」阶段：对动作清单进行评审与放行。审批通过后进入结果输出与归档。
          </p>

          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-mono text-gray-500">{selectedAction.id}</span>
                  {selectedAction.riskLevel === 'high' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      高风险
                    </span>
                  )}
                  {selectedAction.riskLevel === 'medium' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                      <AlertTriangle className="w-4 h-4" />
                      中风险
                    </span>
                  )}
                  {selectedAction.riskLevel === 'low' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      低风险
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {selectedAction.type}
                  </span>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{selectedAction.name}</h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Link to={`/products/${selectedProduct.id}`} className="hover:text-blue-600 flex items-center gap-1">
                    {selectedProduct.name} ({selectedProduct.id})
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">提交时间</div>
                <div className="text-sm font-medium text-gray-900">{selectedAction.createdAt}</div>
              </div>
            </div>
          </div>

          {/* Action Target */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">动作目标</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="text-gray-900 mb-4">
                通过优化商品主图，提升用户点击意愿，改善 CTR 指标表现
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">目标商品</div>
                  <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">适用策略</div>
                  <div className="font-medium text-gray-900">{relatedStrategy?.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Worth Doing - 为什么值得做 */}
          <div className="bg-white rounded-lg border-2 border-green-200 overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">为什么值得做</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Reason */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">推荐原因</div>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
                  {selectedAction.reason}
                </div>
              </div>

              {/* Expected Impact */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">预期影响</div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-900 mb-1">{selectedAction.expectedImpact}</div>
                      <div className="text-sm text-green-700">
                        基于历史数据和品类基准预测，置信度 85%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Support */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">数据支持</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">当前 CTR</div>
                    <div className="text-lg font-semibold text-red-600">{selectedProduct.metrics.ctr_7d}%</div>
                    <div className="text-xs text-gray-500">低于基准 42.9%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">品类基准</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedProduct.metrics.category_ctr_p30}%</div>
                    <div className="text-xs text-gray-500">P30 分位值</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">主图评分</div>
                    <div className="text-lg font-semibold text-red-600">0.42</div>
                    <div className="text-xs text-gray-500">基准 0.75</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's the Risk - 风险是什么 */}
          <div className="bg-white rounded-lg border-2 border-orange-200 overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">风险与约束</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Risk Level */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">风险等级</div>
                <div className={`rounded-lg p-4 border ${
                  selectedAction.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                  selectedAction.riskLevel === 'medium' ? 'bg-orange-50 border-orange-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {selectedAction.riskLevel === 'high' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                    {selectedAction.riskLevel === 'medium' && <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />}
                    {selectedAction.riskLevel === 'low' && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                    <div>
                      <div className={`font-medium mb-1 ${
                        selectedAction.riskLevel === 'high' ? 'text-red-900' :
                        selectedAction.riskLevel === 'medium' ? 'text-orange-900' :
                        'text-green-900'
                      }`}>
                        {selectedAction.riskLevel === 'high' ? '高风险动作' :
                         selectedAction.riskLevel === 'medium' ? '中风险动作' :
                         '低风险动作'}
                      </div>
                      <div className={`text-sm ${
                        selectedAction.riskLevel === 'high' ? 'text-red-700' :
                        selectedAction.riskLevel === 'medium' ? 'text-orange-700' :
                        'text-green-700'
                      }`}>
                        {selectedAction.riskLevel === 'low' && '该动作为低风险操作，不会影响现有流量和排名'}
                        {selectedAction.riskLevel === 'medium' && '该动作可能影响部分指标，建议通过 A/B 测试验证'}
                        {selectedAction.riskLevel === 'high' && '该动作可能对业务产生重大影响，建议谨慎评估后执行'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">约束条件</div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>需要内容团队配合设计新主图方案</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>A/B 测试需至少运行 3-5 天才能获得可靠数据</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>主图更新需符合平台规范，避免违规</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Rollback Plan */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">回滚方案</div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-900">
                    如果测试效果不佳，可在 24 小时内一键回滚至原主图
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Details */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">执行详情</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Required Inputs */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">需要的输入参数</div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">新主图文件</div>
                      <button 
                        onClick={() => setShowParamsModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Settings className="w-4 h-4" />
                        配置
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">A/B 测试流量比例</div>
                      <div className="text-sm font-medium text-gray-900">50:50</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">测试时长</div>
                      <div className="text-sm font-medium text-gray-900">5 天</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-execution Checks */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">执行前检查项</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>商品状态正常，可执行优化</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>库存充足，无断货风险</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>无进行中的其他测试，可启动 A/B 测试</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>需要内容团队确认新主图方案</span>
                  </div>
                </div>
              </div>

              {/* Execution Timeline */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">预计执行时长</div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-900">
                    准备阶段 1-2 天 + 测试运行 5 天 + 数据分析 1 天 = 7-8 天
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                审批备注（可选）
              </label>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="添加审批意见或备注..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={handleApprove}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <ThumbsUp className="w-5 h-5" />
                批准执行
              </button>
              
              <button
                onClick={() => setShowParamsModal(true)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Settings className="w-5 h-5" />
                修改参数
              </button>
              
              <button
                onClick={handleDefer}
                className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <PauseCircle className="w-5 h-5" />
                延后处理
              </button>
              
              <button
                onClick={handleReject}
                className="px-4 py-3 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <ThumbsDown className="w-5 h-5" />
                驳回
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Impact & Support */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
        {/* Expected Impact */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">预期影响</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs text-green-700 mb-1">CTR 提升</div>
              <div className="text-2xl font-semibold text-green-900 mb-1">+40-60%</div>
              <div className="text-xs text-green-700">
                从 1.2% 提升至 1.7-1.9%
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs text-green-700 mb-1">7日增收预估</div>
              <div className="text-2xl font-semibold text-green-900 mb-1">¥8K-12K</div>
              <div className="text-xs text-green-700">
                基于历史转化率计算
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xs text-blue-700 mb-1">置信度</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-sm font-semibold text-blue-900">85%</span>
              </div>
              <div className="text-xs text-blue-700">
                基于 127 个相似案例
              </div>
            </div>
          </div>
        </div>

        {/* Risk Alert */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">风险提示</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className={`rounded-lg p-4 border ${
              selectedAction.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
              selectedAction.riskLevel === 'medium' ? 'bg-orange-50 border-orange-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className={`text-sm font-medium mb-2 ${
                selectedAction.riskLevel === 'high' ? 'text-red-900' :
                selectedAction.riskLevel === 'medium' ? 'text-orange-900' :
                'text-green-900'
              }`}>
                {selectedAction.riskLevel === 'low' && '✓ 低风险操作'}
                {selectedAction.riskLevel === 'medium' && '⚠ 建议谨慎评估'}
                {selectedAction.riskLevel === 'high' && '⚠ 需要特别关注'}
              </div>
              <div className={`text-sm ${
                selectedAction.riskLevel === 'high' ? 'text-red-700' :
                selectedAction.riskLevel === 'medium' ? 'text-orange-700' :
                'text-green-700'
              }`}>
                {selectedAction.riskLevel === 'low' && '不会影响现有流量和转化'}
                {selectedAction.riskLevel === 'medium' && '通过 A/B 测试控制风险'}
                {selectedAction.riskLevel === 'high' && '可能影响现有业务指标'}
              </div>
            </div>
          </div>
        </div>

        {/* Approval History */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">审批历史</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div className="text-sm font-medium text-gray-900">待审批</div>
                </div>
                <div className="text-xs text-gray-600">
                  {selectedAction.createdAt} 由系统自动提交
                </div>
              </div>

              <div className="text-center py-4 text-sm text-gray-500">
                暂无其他审批记录
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Support */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">知识支持</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-900 mb-1">主图优化最佳实践</div>
              <div className="text-xs text-purple-700 mb-2">
                了解如何设计高点击率的商品主图
              </div>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                查看详情
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-900 mb-1">A/B 测试指南</div>
              <div className="text-xs text-purple-700 mb-2">
                如何科学设计和评估 A/B 测试
              </div>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                查看详情
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Cases */}
        <div className="flex-1">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">相似案例</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">案例 #1247</div>
              <div className="text-xs text-gray-600 mb-2">
                床上四件套主图优化
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600">CTR 提升</span>
                <span className="font-semibold text-green-600">+52%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">执行时间</span>
                <span className="text-gray-900">7 天</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">案例 #1156</div>
              <div className="text-xs text-gray-600 mb-2">
                被芯主图场景化优化
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600">CTR 提升</span>
                <span className="font-semibold text-green-600">+48%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">执行时间</span>
                <span className="text-gray-900">6 天</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Params Modal */}
      <FlowSupportDrawer
        open={flowSupportOpen}
        onClose={() => setFlowSupportOpen(false)}
        flowBundle={approvalResolved.flowBundle}
      />

      {showParamsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowParamsModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">修改执行参数</h3>
              <button
                onClick={() => setShowParamsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  A/B 测试流量比例
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>50:50（推荐）</option>
                  <option>30:70（保守）</option>
                  <option>70:30（激进）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  测试时长（天）
                </label>
                <input
                  type="number"
                  defaultValue={5}
                  min={3}
                  max={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自动决策阈值
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>CTR 提升 &gt; 20%（推荐）</option>
                  <option>CTR 提升 &gt; 30%（保守）</option>
                  <option>CTR 提升 &gt; 10%（激进）</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowParamsModal(false);
                  handleApprove();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认并批准
              </button>
              <button
                onClick={() => setShowParamsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
