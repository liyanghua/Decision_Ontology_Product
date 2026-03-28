import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { 
  ArrowLeft, 
  AlertCircle, 
  AlertTriangle,
  TrendingDown, 
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  History,
  X,
  Info,
  Target,
  Zap,
  FileText,
  ShieldAlert,
  Calendar,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import { products, evidencePacks, rootCauses, strategies, actions, knowledgeSupport } from '../data/mockData';

export function ProductDiagnosisDetail() {
  const { productId } = useParams();
  const product = products.find(p => p.id === productId);
  const evidence = evidencePacks[productId as keyof typeof evidencePacks] || [];
  const causes = rootCauses[productId as keyof typeof rootCauses] || [];
  const strategyList = strategies[productId as keyof typeof strategies] || [];
  const productActions = actions.filter(a => a.productId === productId);

  const [selectedVersion, setSelectedVersion] = useState('v2.3.1');
  const [knowledgeDrawerOpen, setKnowledgeDrawerOpen] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(null);
  const [selectedRootCause, setSelectedRootCause] = useState<string | null>(null);
  const [explainDrawerOpen, setExplainDrawerOpen] = useState(false);

  if (!product) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">商品未找到</h2>
          <p className="text-gray-600 mb-6">无法找到商品 {productId}</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4" />
            返回商品操盘台
          </Link>
        </div>
      </div>
    );
  }

  const openKnowledgeDrawer = (knowledgeKey: string) => {
    setSelectedKnowledge(knowledgeKey);
    setKnowledgeDrawerOpen(true);
  };

  const openRootCauseExplain = (rootCauseId: string) => {
    setSelectedRootCause(rootCauseId);
    setExplainDrawerOpen(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar: Product Info & History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回操盘台
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-500">{product.id}</span>
            {product.riskLevel === 'high' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                <AlertCircle className="w-3 h-3" />
                高风险
              </span>
            )}
          </div>
          
          <h2 className="font-semibold text-gray-900 mb-1">{product.name}</h2>
          <div className="text-sm text-gray-600">{product.brand} · {product.category}</div>
        </div>

        {/* Version Selector */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">诊断版本</h3>
          </div>
          <select 
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="v2.3.1">v2.3.1 - 当前版本</option>
            <option value="v2.3.0">v2.3.0 - 2026-03-27</option>
            <option value="v2.2.9">v2.2.9 - 2026-03-26</option>
          </select>
        </div>

        {/* Time Window */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">时间窗口</h3>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">诊断时间</div>
              <div className="text-sm font-medium text-gray-900">2026-03-28 09:00</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">数据窗口</div>
              <div className="text-sm font-medium text-gray-900">最近 7 天</div>
            </div>
          </div>
        </div>

        {/* Historical Versions */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">历史诊断</h3>
            </div>
            
            <div className="space-y-2">
              <button className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium text-blue-900">v2.3.1</div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">当前</span>
                </div>
                <div className="text-xs text-blue-700 mb-2">2026-03-28 09:00:00</div>
                <div className="flex items-center gap-3 text-xs text-blue-600">
                  <span>{product.problemCount} 问题</span>
                  <span>·</span>
                  <span>{causes.length} 根因</span>
                  <span>·</span>
                  <span>{strategyList.length} 策略</span>
                </div>
              </button>

              <button className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors">
                <div className="text-sm font-medium text-gray-900 mb-2">v2.3.0</div>
                <div className="text-xs text-gray-600 mb-2">2026-03-27 09:00:00</div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>2 问题</span>
                  <span>·</span>
                  <span>2 根因</span>
                  <span>·</span>
                  <span>2 策略</span>
                </div>
              </button>

              <button className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center gap-1">
                查看版本差异
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">优先级</div>
              <div className="text-xl font-semibold text-gray-900">{product.priority}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">待审批动作</div>
              <div className="text-xl font-semibold text-orange-600">
                {productActions.filter(a => a.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Main Diagnosis Flow */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          {/* Core Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">核心经营指标</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">CTR 7日</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <div className={`text-2xl font-semibold ${
                    product.metrics.ctr_7d < product.metrics.category_ctr_p30 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {product.metrics.ctr_7d}%
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-xs text-gray-500">基准 {product.metrics.category_ctr_p30}%</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">曝光量</div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {(product.metrics.impression_7d / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-500">7日总计</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">转化率</div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {product.metrics.conversion_7d}%
                </div>
                <div className="text-xs text-gray-500">环比 -5.2%</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">收入 7日</div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  ¥{(product.metrics.revenue_7d / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-500">环比 -12.3%</div>
              </div>
            </div>
          </div>

          {/* Step 1: Evidence Pack */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Evidence - 证据包</h3>
                  <p className="text-sm text-gray-600">系统采集的异常数据证据</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {evidence.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 rounded-lg border ${
                    ev.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    ev.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium text-gray-900">{ev.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ev.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          ev.severity === 'warning' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ev.severity === 'critical' ? '严重' : ev.severity === 'warning' ? '警告' : '信息'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">指标</div>
                          <div className="text-sm font-medium text-gray-900">{ev.metric}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">实际值</div>
                          <div className="text-sm font-semibold text-red-600">{ev.actual}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">期望值</div>
                          <div className="text-sm font-medium text-gray-900">{ev.expected}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-600 mb-1">偏差</div>
                      <div className={`text-xl font-semibold ${
                        ev.deviation < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {ev.deviation > 0 ? '+' : ''}{ev.deviation.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Problem / State */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-700">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Problem - 当前问题</h3>
                  <p className="text-sm text-red-700">基于证据包识别的商品问题</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3">
                {product.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-red-700">{idx + 1}</span>
                    </div>
                    <span className="font-medium text-red-900">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step 3: RootCause */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-700">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">RootCause - 根因诊断</h3>
                  <p className="text-sm text-orange-700">按置信度和影响度排序</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {causes.map((cause, index) => (
                <button
                  key={cause.id}
                  onClick={() => openRootCauseExplain(cause.id)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                      index === 0 ? 'bg-red-100 text-red-700' :
                      index === 1 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-gray-900">{cause.name}</div>
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{cause.description}</div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>置信度</span>
                            <span className="font-medium text-gray-900">{(cause.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${cause.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>影响度</span>
                            <span className="font-medium text-gray-900">{(cause.impact * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-600 rounded-full"
                              style={{ width: `${cause.impact * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Strategy */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-700">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Strategy - 推荐策略</h3>
                  <p className="text-sm text-green-700">针对根因的优化策略建议</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {strategyList.map((strategy, index) => (
                <div key={strategy.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-green-700">{index + 1}</span>
                        </div>
                        <div className="font-medium text-gray-900">{strategy.name}</div>
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          优先级 {strategy.priority}
                        </span>
                      </div>
                      
                      <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3">
                        <span className="font-medium">预期影响: </span>
                        {strategy.expectedImpact}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">针对根因: </span>
                        {strategy.targetRootCause.map(rc => 
                          causes.find(c => c.id === rc)?.name
                        ).join(', ')}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (strategy.id === 'S001') {
                          openKnowledgeDrawer('main_image_optimization');
                        } else if (strategy.id === 'S002') {
                          openKnowledgeDrawer('title_optimization');
                        }
                      }}
                      className="px-3 py-2 border border-purple-300 text-purple-700 text-sm rounded-lg hover:bg-purple-50 flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      知识支持
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">包含动作:</div>
                    <ul className="space-y-1">
                      {strategy.actions.map((action, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-gray-400" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 5: Action Plan */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Action Plan - 可执行动作</h3>
                  <p className="text-sm text-blue-700">基于策略生成的具体动作计划</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {productActions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-sm text-gray-500">暂无可执行动作</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {productActions.map((action) => (
                    <div key={action.id} className={`rounded-lg p-4 border ${
                      action.status === 'pending' ? 'bg-orange-50 border-orange-200' :
                      action.status === 'approved' ? 'bg-green-50 border-green-200' :
                      action.status === 'running' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium text-gray-900">{action.name}</div>
                            {action.status === 'pending' && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                待审批
                              </span>
                            )}
                            {action.status === 'approved' && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                已批准
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{action.type} · {action.reason}</div>
                          <div className="text-sm text-green-600 bg-white rounded px-3 py-2">
                            {action.expectedImpact}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 6: Expected Impact */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-purple-700">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Expected Impact - 预期效果</h3>
                  <p className="text-sm text-purple-700">策略执行后的预期影响</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-700 mb-2">主图优化策略</div>
                  <div className="text-2xl font-semibold text-green-900 mb-1">+40-60%</div>
                  <div className="text-sm text-green-700">CTR 预期提升</div>
                  <div className="text-xs text-green-600 mt-2">7日增收 ¥8,000-12,000</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-700 mb-2">标题优化策略</div>
                  <div className="text-2xl font-semibold text-green-900 mb-1">+25-35%</div>
                  <div className="text-sm text-green-700">搜索流量预期提升</div>
                  <div className="text-xs text-green-600 mt-2">曝光量增加 5,000+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Knowledge & Actions */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
        {/* Knowledge Support */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">知识支持</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <button 
              onClick={() => openKnowledgeDrawer('main_image_optimization')}
              className="w-full bg-purple-50 border border-purple-200 rounded-lg p-3 text-left hover:bg-purple-100 transition-colors"
            >
              <div className="text-sm font-medium text-purple-900 mb-1">主图优化最佳实践</div>
              <div className="text-xs text-purple-700 mb-2">
                针对主图质量评分低的优化指南
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                查看详情
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>

            <button 
              onClick={() => openKnowledgeDrawer('title_optimization')}
              className="w-full bg-purple-50 border border-purple-200 rounded-lg p-3 text-left hover:bg-purple-100 transition-colors"
            >
              <div className="text-sm font-medium text-purple-900 mb-1">标题优化指南</div>
              <div className="text-xs text-purple-700 mb-2">
                提升标题匹配度的策略方法
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                查看详情
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* Approval Entry */}
        {productActions.filter(a => a.status === 'pending').length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">待审批动作</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-orange-900 mb-1">
                  {productActions.filter(a => a.status === 'pending').length} 个动作等待审批
                </div>
                <div className="text-xs text-orange-700 mb-3">
                  审批后将进入执行队列
                </div>
                <Link
                  to="/approvals"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <PlayCircle className="w-4 h-4" />
                  立即审批
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Risk & Constraints */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">风险与约束</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm font-medium text-green-900 mb-1">低风险</div>
              <div className="text-xs text-green-700">
                主图优化和 A/B 测试为低风险操作
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-900 mb-1">中风险</div>
              <div className="text-xs text-orange-700">
                标题调整可能影响搜索排名，建议谨慎
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">约束条件</div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• A/B 测试需至少运行 3-5 天</li>
                <li>• 主图更新需内容团队审核</li>
                <li>• 标题修改每月限 2 次</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Cases */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">相关案例</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">案例 #1247</div>
              <div className="text-xs text-gray-600 mb-2">
                床上用品品类主图优化
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600">CTR +52%</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">2026-02</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">案例 #1189</div>
              <div className="text-xs text-gray-600 mb-2">
                四件套标题关键词优化
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600">流量 +38%</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">2026-01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
          <Link
            to="/approvals"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            发起执行审批
          </Link>

          <button
            onClick={() => setExplainDrawerOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Info className="w-5 h-5" />
            查看完整解释
          </button>
        </div>
      </div>

      {/* Knowledge Drawer */}
      {knowledgeDrawerOpen && selectedKnowledge && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setKnowledgeDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[600px] bg-white shadow-xl flex flex-col">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">知识支持</h2>
              </div>
              <button
                onClick={() => setKnowledgeDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {selectedKnowledge && knowledgeSupport[selectedKnowledge as keyof typeof knowledgeSupport] && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {knowledgeSupport[selectedKnowledge as keyof typeof knowledgeSupport].title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-6">
                    {knowledgeSupport[selectedKnowledge as keyof typeof knowledgeSupport].type}
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-700">
                      {knowledgeSupport[selectedKnowledge as keyof typeof knowledgeSupport].content}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">来源</div>
                    <div className="text-sm text-gray-900">
                      {knowledgeSupport[selectedKnowledge as keyof typeof knowledgeSupport].source}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">相关策略</div>
                    <div className="flex flex-wrap gap-2">
                      {knowledgeSupport[selectedKnowledge as keyof typeof knowledgeSupport].relatedStrategies.map((sid: string) => {
                        const strategy = strategyList.find(s => s.id === sid);
                        return strategy ? (
                          <span key={sid} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                            {strategy.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explain Drawer */}
      {explainDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setExplainDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[600px] bg-white shadow-xl flex flex-col">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">决策解释</h2>
              </div>
              <button
                onClick={() => setExplainDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">诊断逻辑</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                    <p>1. 系统监测到商品 CTR 7日为 1.2%，显著低于品类基准 2.1%</p>
                    <p>2. 进一步分析发现主图质量评分 0.42，低于基准 0.75</p>
                    <p>3. 标题相关性评分 0.87，略低于目标 0.92</p>
                    <p>4. 综合判断：主图吸引力弱是主要根因（置信度 89%）</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">策略选择依据</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                    <p>• 主图优化策略：针对最高置信度根因，预期 CTR 提升 40-60%</p>
                    <p>• 标题优化策略：补充优化措施，预期流量提升 25-35%</p>
                    <p>• 建议优先执行主图优化，通过 A/B 测试验证效果</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">风险评估</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-900 mb-1">低风险动作</div>
                      <div className="text-sm text-green-700">
                        主图优化和 A/B 测试为低风险操作，不会影响现有流量
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-orange-900 mb-1">中风险动作</div>
                      <div className="text-sm text-orange-700">
                        标题关键词调整可能影响搜索排名，建议谨慎执行
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">参考数据</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">品类样本量</div>
                        <div className="font-medium text-gray-900">1,247 个商品</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">时间窗口</div>
                        <div className="font-medium text-gray-900">最近 30 天</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">置信区间</div>
                        <div className="font-medium text-gray-900">95%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">模型版本</div>
                        <div className="font-medium text-gray-900">v2.3.1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
