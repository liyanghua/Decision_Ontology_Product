import { useState } from 'react';
import { Link } from 'react-router';
import { 
  CheckCircle2, 
  X, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  Info,
  ExternalLink
} from 'lucide-react';
import { actions } from '../data/mockData';

export function ActionApprovalCenter() {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | null>(null);

  const pendingActions = actions.filter(a => a.status === 'pending');

  const toggleActionSelection = (actionId: string) => {
    setSelectedActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleBatchApproval = (type: 'approve' | 'reject') => {
    setApprovalType(type);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    // Simulate approval action
    console.log(`${approvalType} actions:`, selectedActions);
    setShowApprovalDialog(false);
    setSelectedActions([]);
    setApprovalType(null);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">动作审批中心</h1>
        <p className="text-gray-600">审批系统推荐的优化动作</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">待审批</div>
          <div className="text-3xl font-semibold text-orange-600">{pendingActions.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">已选中</div>
          <div className="text-3xl font-semibold text-blue-600">{selectedActions.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">今日已批准</div>
          <div className="text-3xl font-semibold text-green-600">
            {actions.filter(a => a.status === 'approved' && a.approvedAt?.includes('2026-03-28')).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">今日已驳回</div>
          <div className="text-3xl font-semibold text-red-600">0</div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedActions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                已选中 {selectedActions.length} 个动作
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBatchApproval('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                批量批准
              </button>
              <button
                onClick={() => handleBatchApproval('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                批量驳回
              </button>
              <button
                onClick={() => setSelectedActions([])}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">风险等级:</label>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>全部</option>
              <option>高风险</option>
              <option>中等风险</option>
              <option>低风险</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">动作类型:</label>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>全部</option>
              <option>内容优化</option>
              <option>测试验证</option>
              <option>数据分析</option>
              <option>推广优化</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">商品:</label>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>全部商品</option>
              <option>P100891 - 春夏凉感四件套</option>
              <option>P100892 - 冰丝夏季薄款被子</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {pendingActions.map((action) => (
          <div
            key={action.id}
            className={`bg-white rounded-lg border-2 transition-all ${
              selectedActions.includes(action.id)
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedActions.includes(action.id)}
                    onChange={() => toggleActionSelection(action.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">
                          <Clock className="w-3 h-3" />
                          待审批
                        </span>
                        {action.riskLevel === 'high' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            高风险
                          </span>
                        )}
                        {action.riskLevel === 'medium' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            中等风险
                          </span>
                        )}
                        {action.riskLevel === 'low' && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                            低风险
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span className="font-medium">{action.type}</span>
                        <span>·</span>
                        <Link 
                          to={`/products/${action.productId}`}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          {action.productName}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        创建时间: {action.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        建议原因
                      </div>
                      <div className="text-sm text-gray-900">{action.reason}</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-700 mb-2 font-medium">预期影响</div>
                      <div className="text-sm text-green-900">{action.expectedImpact}</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-blue-900">
                      <span className="font-medium">策略上下文:</span> 此动作属于"{
                        action.strategyId === 'S001' ? '主图优化策略' :
                        action.strategyId === 'S002' ? '标题优化策略' :
                        action.strategyId === 'S003' ? '价格调整策略' :
                        action.strategyId === 'S004' ? '详情页优化策略' :
                        action.strategyId === 'S005' ? '关键词优化策略' : '优化策略'
                      }"，针对已识别的根因问题
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedActions([action.id]);
                        handleBatchApproval('approve');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      批准
                    </button>
                    <button
                      onClick={() => {
                        setSelectedActions([action.id]);
                        handleBatchApproval('reject');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      驳回
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      延后处理
                    </button>
                    <Link
                      to={`/products/${action.productId}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      查看商品诊断
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {pendingActions.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无待审批动作</h3>
            <p className="text-gray-600">所有动作已处理完成</p>
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowApprovalDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              确认{approvalType === 'approve' ? '批准' : '驳回'}
            </h3>
            <p className="text-gray-600 mb-6">
              您即将{approvalType === 'approve' ? '批准' : '驳回'} {selectedActions.length} 个动作。
              {approvalType === 'approve' && '批准后动作将进入执行队列。'}
              {approvalType === 'reject' && '驳回后需要重新分析和生成新的动作建议。'}
            </p>
            
            {approvalType === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  驳回原因 (可选)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请说明驳回原因..."
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApprovalDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmApproval}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  approvalType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                确认{approvalType === 'approve' ? '批准' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
