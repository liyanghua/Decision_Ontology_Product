import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { executions, actions } from '../data/mockData';
import { inferPhaseForContext } from '../data/sop/diagnosisFlowSkeleton';
import { resolveKnowledgeSupport } from '../data/expertKnowledge';
import { SopFlowCompactBar } from '../components/knowledge/SopFlowCompactBar';
import { FlowSupportDrawer } from '../components/knowledge/FlowSupportDrawer';

export function ExecutionOutcome() {
  const [flowSupportOpen, setFlowSupportOpen] = useState(false);
  const allExecutions = executions;
  const runningExecutions = executions.filter(e => e.status === 'running');
  const completedExecutions = executions.filter(e => e.status === 'completed');
  const failedExecutions = executions.filter(e => e.status === 'failed');

  const executionSopPhase = useMemo(
    () =>
      inferPhaseForContext({
        route: 'execution',
        hasGoodsId: true,
        hasMetricsRow: true,
        hasStructuredDiagnosis: true,
        pendingActionCount: 0,
      }),
    [],
  );

  const executionResolved = useMemo(
    () =>
      resolveKnowledgeSupport({
        page: 'execution',
        stageKey: executionSopPhase,
      }),
    [executionSopPhase],
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">执行与结果</h1>
        <p className="text-gray-600">跟踪动作执行状态和效果反馈</p>
      </div>

      <div className="mb-8 space-y-2">
        <SopFlowCompactBar
          stageKey={executionSopPhase}
          onOpenFlow={() => setFlowSupportOpen(true)}
        />
        <p className="text-xs text-gray-600">
          当前贴近「结果输出 / 复盘跟踪」：执行侧请对照 Flow Support 中的执行提醒与风险检查项。
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">执行中</div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-blue-600">{runningExecutions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">已完成</div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-green-600">{completedExecutions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">失败/异常</div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-red-600">{failedExecutions.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">平均成功率</div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-purple-600">85%</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            <button className="py-4 border-b-2 border-blue-600 text-blue-600 font-medium">
              全部 ({allExecutions.length})
            </button>
            <button className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
              执行中 ({runningExecutions.length})
            </button>
            <button className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
              已完成 ({completedExecutions.length})
            </button>
            <button className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
              失败/异常 ({failedExecutions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Executions List */}
      <div className="space-y-4">
        {allExecutions.map((execution) => (
          <div key={execution.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{execution.actionName}</h3>
                    {execution.status === 'running' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        <Play className="w-3 h-3" />
                        执行中
                      </span>
                    )}
                    {execution.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        已完成
                      </span>
                    )}
                    {execution.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                        <XCircle className="w-3 h-3" />
                        失败
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{execution.productName}</span>
                    <span>·</span>
                    <span>开始时间: {execution.startTime}</span>
                    {execution.endTime && (
                      <>
                        <span>·</span>
                        <span>结束时间: {execution.endTime}</span>
                      </>
                    )}
                  </div>
                </div>

                {execution.status === 'running' && (
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-blue-600">{execution.progress}%</div>
                    <div className="text-sm text-gray-600">进度</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {execution.status === 'running' && (
                <div className="mb-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${execution.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Expected vs Actual Outcome */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">预期效果</div>
                  <div className="text-sm text-gray-900">{execution.expectedOutcome}</div>
                </div>
                
                {execution.actualOutcome && (
                  <div className={`rounded-lg p-4 ${
                    execution.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-sm mb-2 ${
                      execution.status === 'completed' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      实际结果
                    </div>
                    <div className={`text-sm ${
                      execution.status === 'completed' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {execution.actualOutcome}
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Logs */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-3">
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  执行日志 ({execution.logs.length} 条)
                </summary>
                
                <div className="bg-gray-900 rounded-lg p-4 space-y-2 font-mono text-sm">
                  {execution.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <span className="text-gray-500">{log.timestamp}</span>
                      <span className={`flex-shrink-0 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className={
                        log.level === 'error' ? 'text-red-300' :
                        log.level === 'warning' ? 'text-yellow-300' :
                        'text-gray-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </details>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                {execution.status === 'running' && (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    暂停执行
                  </button>
                )}
                {execution.status === 'failed' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      重新执行
                    </button>
                    <Link
                      to="/replay"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      查看回放分析
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </>
                )}
                {execution.status === 'completed' && (
                  <Link
                    to="/replay"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    查看详细分析
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  下载日志
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Completed Summary */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">最近完成动作效果摘要</h2>
        
        <div className="space-y-3">
          {actions.filter(a => a.status === 'completed').map((action) => (
            <div key={action.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">{action.name}</div>
                <div className="text-sm text-gray-600">{action.productName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600 mb-1">✓ 效果达到预期</div>
                <div className="text-sm text-gray-600">{action.actualImpact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FlowSupportDrawer
        open={flowSupportOpen}
        onClose={() => setFlowSupportOpen(false)}
        flowBundle={executionResolved.flowBundle}
      />
    </div>
  );
}
