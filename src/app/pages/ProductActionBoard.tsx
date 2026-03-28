import { useState } from 'react';
import { Link } from 'react-router';
import { 
  AlertCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  History,
  Target,
  Zap,
  Info,
  Activity
} from 'lucide-react';
import { products, evidencePacks, rootCauses, strategies, actions } from '../data/mockData';

export function ProductActionBoard() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const evidence = evidencePacks[selectedProductId as keyof typeof evidencePacks] || [];
  const causes = rootCauses[selectedProductId as keyof typeof rootCauses] || [];
  const strategyList = strategies[selectedProductId as keyof typeof strategies] || [];
  const productActions = actions.filter(a => a.productId === selectedProductId);
  const pendingActions = productActions.filter(a => a.status === 'pending');
  const runningActions = productActions.filter(a => a.status === 'running');

  if (!selectedProduct) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left: Product Queue */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">商品操盘队列</h2>
          
          {/* Filters */}
          <div className="space-y-2">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>全部风险等级</option>
              <option>高风险优先</option>
              <option>中风险</option>
              <option>低风险</option>
            </select>
            
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>全部品类</option>
              <option>床上四件套</option>
              <option>被芯被罩</option>
              <option>枕头枕芯</option>
            </select>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto">
          {products.map((product, index) => (
            <button
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              className={`w-full px-6 py-4 border-b border-gray-100 text-left transition-colors ${
                selectedProductId === product.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
              }`}
            >
              {/* Rank & Priority */}
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
                    <span className="text-xs font-mono text-gray-500">{product.id}</span>
                    {product.riskLevel === 'high' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 text-xs rounded">
                        高风险
                      </span>
                    )}
                    {product.riskLevel === 'medium' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-orange-700 text-xs rounded">
                        中风险
                      </span>
                    )}
                  </div>
                  
                  <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                    {product.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">{product.brand}</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-semibold text-gray-900">{product.priority}</div>
                  <div className="text-xs text-gray-500">优先级</div>
                </div>
              </div>

              {/* Problem */}
              {product.issues.length > 0 && (
                <div className="flex items-start gap-1.5 text-xs text-red-600 mb-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{product.issues[0]}</span>
                </div>
              )}

              {/* Metrics */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">{product.actionCount} 动作</span>
                </div>
                <div className={`flex items-center gap-1 ${
                  product.metrics.ctr_7d < product.metrics.category_ctr_p30 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {product.metrics.ctr_7d < product.metrics.category_ctr_p30 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span>CTR {product.metrics.ctr_7d}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
          共 {products.length} 个商品 · 高风险 {products.filter(p => p.riskLevel === 'high').length} 个
        </div>
      </div>

      {/* Middle: Diagnosis Summary */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="max-w-[800px] mx-auto space-y-6">
          {/* Product Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{selectedProduct.id}</span>
                  {selectedProduct.riskLevel === 'high' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      高风险
                    </span>
                  )}
                  {selectedProduct.riskLevel === 'medium' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                      <AlertTriangle className="w-4 h-4" />
                      中风险
                    </span>
                  )}
                </div>
                
                <h1 className="text-xl font-semibold text-gray-900 mb-2">{selectedProduct.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedProduct.brand}</span>
                  <span>·</span>
                  <span>{selectedProduct.category}</span>
                  <span>·</span>
                  <span>{selectedProduct.sku}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-semibold text-gray-900">{selectedProduct.priority}</div>
                <div className="text-sm text-gray-500">优先级评分</div>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">CTR 7日</div>
                <div className="flex items-baseline gap-2">
                  <div className={`text-xl font-semibold ${
                    selectedProduct.metrics.ctr_7d < selectedProduct.metrics.category_ctr_p30 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedProduct.metrics.ctr_7d}%
                  </div>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-xs text-gray-500 mt-1">基准 {selectedProduct.metrics.category_ctr_p30}%</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">曝光量</div>
                <div className="text-xl font-semibold text-gray-900">
                  {(selectedProduct.metrics.impression_7d / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-500 mt-1">7日总计</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">转化率</div>
                <div className="text-xl font-semibold text-gray-900">
                  {selectedProduct.metrics.conversion_7d}%
                </div>
                <div className="text-xs text-gray-500 mt-1">环比 -5.2%</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">收入 7日</div>
                <div className="text-xl font-semibold text-gray-900">
                  ¥{(selectedProduct.metrics.revenue_7d / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-500 mt-1">环比 -12.3%</div>
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Problem - 当前问题</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {selectedProduct.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-red-800">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-red-700">{idx + 1}</span>
                    </div>
                    <span className="font-medium">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Root Cause Top 3 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">RootCause - 根因诊断 Top 3</h3>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {causes.slice(0, 3).map((cause, index) => (
                <div key={cause.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                      index === 0 ? 'bg-red-100 text-red-700' :
                      index === 1 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{cause.name}</div>
                      <div className="text-sm text-gray-600 mb-3">{cause.description}</div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>置信度</span>
                            <span className="font-medium text-gray-900">{(cause.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${cause.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>影响度</span>
                            <span className="font-medium text-gray-900">{(cause.impact * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-600 rounded-full"
                              style={{ width: `${cause.impact * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Strategies */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Strategy - 推荐策略</h3>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {strategyList.map((strategy, index) => (
                <div key={strategy.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">针对根因: </span>
                        {strategy.targetRootCause.map(rc => 
                          causes.find(c => c.id === rc)?.name
                        ).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
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

          {/* Risk Warning */}
          {selectedProduct.riskLevel === 'high' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900 mb-1">风险提醒</div>
                  <div className="text-sm text-red-700">
                    该商品优先级评分 {selectedProduct.priority}，风险等级高，建议立即处理。
                    当前 CTR 持续低于基准，可能影响整体 GMV 达成。
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Action Plan & Next Steps */}
      <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
        {/* Action Plan Summary */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Action Plan - 动作计划</h3>
            </div>
          </div>

          <div className="p-6">
            {productActions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm text-gray-500">暂无动作计划</div>
              </div>
            ) : (
              <div className="space-y-3">
                {productActions.map((action) => (
                  <div key={action.id} className={`rounded-lg p-3 border ${
                    action.status === 'pending' ? 'bg-orange-50 border-orange-200' :
                    action.status === 'running' ? 'bg-blue-50 border-blue-200' :
                    action.status === 'approved' ? 'bg-green-50 border-green-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      {action.status === 'pending' && <Clock className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />}
                      {action.status === 'running' && <Activity className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                      {action.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1">{action.name}</div>
                        <div className="text-xs text-gray-600 mb-2">{action.type}</div>
                        
                        {action.status === 'pending' && (
                          <div className="text-xs text-orange-700 bg-orange-100 rounded px-2 py-1">
                            等待审批
                          </div>
                        )}
                        {action.status === 'running' && (
                          <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                            执行中
                          </div>
                        )}
                        {action.status === 'approved' && (
                          <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                            已批准
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 bg-white rounded px-2 py-1.5">
                      {action.expectedImpact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approval Status */}
        {pendingActions.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">待审批</h3>
                </div>
                <span className="text-lg font-semibold text-orange-700">{pendingActions.length}</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-orange-900 mb-3">
                  有 {pendingActions.length} 个动作等待您的审批
                </div>
                <Link
                  to="/approvals"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  前往审批中心
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

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
              <div className="text-xs text-purple-700 mb-3">
                针对主图质量评分低的优化指南
              </div>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                查看详情
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-900 mb-1">标题优化指南</div>
              <div className="text-xs text-purple-700 mb-3">
                提升标题匹配度的策略方法
              </div>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                查看详情
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">历史诊断</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium text-gray-900">v2.3.1</div>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">当前</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">2026-03-28 09:00:00</div>
                <div className="text-xs text-gray-600">
                  识别 {selectedProduct.problemCount} 个问题，{causes.length} 个根因
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">v2.3.0</div>
                <div className="text-xs text-gray-600 mb-2">2026-03-27 09:00:00</div>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  查看版本差异 →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Step - Prominent CTA */}
        <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">下一步建议</h3>
            </div>
            <div className="text-sm text-blue-700">
              查看完整诊断详情，了解 Evidence 和决策解释
            </div>
          </div>

          <Link
            to={`/products/${selectedProductId}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            进入商品诊断详情
            <ArrowRight className="w-5 h-5" />
          </Link>

          {pendingActions.length > 0 && (
            <Link
              to="/approvals"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 mt-3 border-2 border-orange-600 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              审批 {pendingActions.length} 个待审批动作
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}