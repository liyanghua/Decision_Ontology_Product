import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  AlertTriangle, 
  Target,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight,
  Users,
  Activity
} from 'lucide-react';
import { products, actions, todaySignals, highValueLeads, goalSummary, todayFocusProducts } from '../data/liveCatalog';
import { resolveKnowledgeSupport, type TodaySignalType } from '../data/expertKnowledge';
import { StrategySupportDrawer } from '../components/knowledge/StrategySupportDrawer';
import { StrategySupportTrigger } from '../components/knowledge/StrategySupportTrigger';

export function TodayCommand() {
  const [strategySupportOpen, setStrategySupportOpen] = useState(false);
  const highRiskProducts = [...products]
    .filter((p) => p.riskLevel === 'high')
    .sort((a, b) => b.priority - a.priority);
  const pendingActions = actions.filter((a) => a.status === 'pending');
  const pendingProductCount = new Set(pendingActions.map((a) => a.productId)).size;
  const criticalSignals = todaySignals.filter(s => s.severity === 'critical');
  const opportunities = highValueLeads.filter(l => l.type === 'opportunity');
  const risks = highValueLeads.filter(l => l.type === 'risk');

  const todayCategoryRaw = todayFocusProducts[0]?.category?.trim() || 'default';
  const todayCategoryKey =
    todayCategoryRaw === '' || todayCategoryRaw === '—' ? 'default' : todayCategoryRaw;
  const firstOppGoodsId = opportunities[0]?.productIds?.[0];

  const todaySignalType = useMemo((): TodaySignalType => {
    if (criticalSignals.length) return 'critical';
    if (opportunities.length) return 'opportunity';
    if (risks.length) return 'risk';
    return 'neutral';
  }, [criticalSignals.length, opportunities.length, risks.length]);

  const todayResolved = useMemo(
    () =>
      resolveKnowledgeSupport({
        page: 'today_command',
        category: todayCategoryKey,
        goodsId: firstOppGoodsId,
        signalType: todaySignalType,
        themeKey: opportunities[0]?.id,
      }),
    [todayCategoryKey, firstOppGoodsId, todaySignalType, opportunities],
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Top: Goal Summary */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6" />
                <h2 className="text-xl font-semibold">3月目标达成情况</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-blue-100 mb-1">目标 GMV</div>
                  <div className="text-2xl font-semibold">¥{(goalSummary.target / 10000).toFixed(0)}万</div>
                </div>
                <div>
                  <div className="text-sm text-blue-100 mb-1">当前完成</div>
                  <div className="text-2xl font-semibold">¥{(goalSummary.current / 10000).toFixed(1)}万</div>
                </div>
                <div>
                  <div className="text-sm text-blue-100 mb-1">完成率</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-semibold">{goalSummary.progress}%</div>
                    {goalSummary.trend === 'down' && (
                      <div className="flex items-center gap-1 text-sm text-red-200">
                        <TrendingDown className="w-4 h-4" />
                        {Math.abs(goalSummary.deviation)}%
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-100 mb-1">剩余缺口</div>
                  <div className="text-2xl font-semibold text-orange-200">
                    ¥{((goalSummary.target - goalSummary.current) / 10000).toFixed(1)}万
                  </div>
                </div>
              </div>

              <div className="mt-4 h-2 bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${goalSummary.progress}%` }}
                />
              </div>
            </div>

            <div className="ml-6 text-right">
              <div className="text-sm text-blue-100 mb-1">距离月末</div>
              <div className="text-3xl font-semibold">4天</div>
              <Link 
                to="/products"
                className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                进入操盘台
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-200 bg-violet-50/60 px-4 py-3">
        <p className="text-sm text-violet-950">
          <span className="font-medium">策略与机会支持</span>
          <span className="text-violet-800/90"> · 今日品类与机会商品语境</span>
        </p>
        <StrategySupportTrigger
          compact
          onClick={() => setStrategySupportOpen(true)}
        />
      </div>

      {/* 今日重点商品（真实优先级队列 Top N） */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-indigo-900">今日重点商品</h2>
            <p className="text-sm text-indigo-800/90 mt-0.5">
              综合评分排序 · 展示 Top {todayFocusProducts.length} · 待处理涉及 {pendingProductCount} 个商品
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            操盘台
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {todayFocusProducts.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-xs font-mono text-gray-500 truncate">{p.id}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.priorityLevel && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                      {p.priorityLevel}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-900">{p.priority}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{p.name}</div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {p.diagnosisBrief || p.issues[0] || '暂无摘要'}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content: 3 columns */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Left + Center: High Value Leads */}
        <div className="col-span-8 space-y-6">
          {/* Opportunities */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-900">高价值机会</h2>
                    <p className="text-sm text-green-700">今日系统发现的增长机会</p>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-green-700">{opportunities.length}</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {opportunities.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{lead.title}</h3>
                        {lead.urgency === 'high' && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                            紧急
                          </span>
                        )}
                        {lead.urgency === 'medium' && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full">
                            重要
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{lead.description}</p>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-3">
                        <div className="text-sm font-medium text-green-900">{lead.impact}</div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Activity className="w-4 h-4" />
                          涉及 {lead.productCount} 个商品
                        </div>
                        {lead.actionable && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="w-4 h-4" />
                            有可执行动作
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/products"
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      立即处理
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-700" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-red-900">高风险预警</h2>
                    <p className="text-sm text-red-700">需要立即关注的风险点</p>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-red-700">{risks.length}</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {risks.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{lead.title}</h3>
                        {lead.urgency === 'high' && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                            高风险
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{lead.description}</p>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-3">
                        <div className="text-sm font-medium text-red-900">{lead.impact}</div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Activity className="w-4 h-4" />
                          涉及 {lead.productCount} 个商品
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/products"
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      立即处理
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Products */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">高风险商品</h2>
                  <p className="text-sm text-gray-600 mt-1">需要优先诊断处理</p>
                </div>
                <Link 
                  to="/products"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {highRiskProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-gray-500">{product.id}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          高风险
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {product.actionCount} 个待审批动作
                        </div>
                      </div>
                      
                      <div className="font-medium text-gray-900 mb-1">{product.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{product.brand} · {product.category}</div>
                      
                      {product.issues.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{product.issues[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="flex flex-col items-end gap-1">
                        {product.priorityLevel && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                            {product.priorityLevel}
                          </span>
                        )}
                        <div className="text-2xl font-semibold text-gray-900">{product.priority}</div>
                        <div className="text-xs text-gray-500">优先级</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions & Alerts */}
        <div className="col-span-4 space-y-6">
          {/* Pending Actions */}
          <div className="bg-white rounded-lg border-2 border-orange-200">
            <div className="px-6 py-4 border-b border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-700" />
                  <h2 className="font-semibold text-orange-900">待拍板动作</h2>
                </div>
                <div className="text-2xl font-semibold text-orange-700">{pendingActions.length}</div>
              </div>
              <p className="text-sm text-orange-700">
                需要您今日审批 · 待处理商品 {pendingProductCount} 个（去重）
              </p>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {pendingActions.map((action) => (
                <div key={action.id} className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {action.riskLevel === 'high' && (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    {action.riskLevel === 'medium' && (
                      <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    {action.riskLevel === 'low' && (
                      <div className="w-4 h-4 rounded-full bg-green-100 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-1 text-sm">{action.name}</div>
                      <div className="text-xs text-gray-600 mb-2 line-clamp-1">{action.productName}</div>
                      <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                        {action.expectedImpact}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                      批准
                    </button>
                    <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors">
                      详情
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-gray-200">
              <Link 
                to="/approvals"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
              >
                进入审批中心
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Critical Signals */}
          <div className="bg-white rounded-lg border-2 border-red-200">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                  <h2 className="font-semibold text-red-900">最近异常</h2>
                </div>
                <div className="text-2xl font-semibold text-red-700">{todaySignals.length}</div>
              </div>
              <p className="text-sm text-red-700">系统检测到的异常信号</p>
            </div>

            <div className="divide-y divide-gray-100">
              {todaySignals.slice(0, 4).map((signal) => (
                <div key={signal.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      signal.severity === 'critical' ? 'bg-red-100' :
                      signal.severity === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${
                        signal.severity === 'critical' ? 'text-red-600' :
                        signal.severity === 'warning' ? 'text-orange-600' : 'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium mb-1 ${
                        signal.severity === 'critical' ? 'text-red-900' :
                        signal.severity === 'warning' ? 'text-orange-900' : 'text-blue-900'
                      }`}>
                        {signal.type}
                      </div>
                      <div className="text-xs text-gray-900 mb-2">{signal.message}</div>
                      <Link 
                        to={`/products/${signal.productId}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        查看 {signal.productName}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Collaboration */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">协同提醒</h2>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  算法团队已更新模型
                </div>
                <div className="text-xs text-blue-700">
                  v2.3.1 优化了主图质量评分算法，建议重新诊断
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-900 mb-1">
                  张伟提交了品类报告
                </div>
                <div className="text-xs text-purple-700">
                  床上四件套 Q1 分析报告已提交，请查阅
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Priority Products List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">重点商品优先级</h2>
              <p className="text-sm text-gray-600 mt-1">基于综合评分排序的操盘优先级</p>
            </div>
            <Link 
              to="/products"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              进入商品操盘台
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">风险</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主要问题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR 7日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">待审批</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        index === 0 ? 'bg-red-100 text-red-700' :
                        index === 1 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-gray-500 mb-1">{product.id}</div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.brand}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl font-semibold text-gray-900">{product.priority}</span>
                      {product.priorityLevel && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                          {product.priorityLevel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.riskLevel === 'high' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        高
                      </span>
                    )}
                    {product.riskLevel === 'medium' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        中
                      </span>
                    )}
                    {product.riskLevel === 'low' && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                        低
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-red-600">{product.issues[0]}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${
                      product.metrics.ctr_7d < product.metrics.category_ctr_p30 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {product.metrics.ctr_7d}%
                    </div>
                    <div className="text-xs text-gray-500">基准 {product.metrics.category_ctr_p30}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.actionCount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      查看
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StrategySupportDrawer
        open={strategySupportOpen}
        onClose={() => setStrategySupportOpen(false)}
        snippets={todayResolved.strategySnippets}
        contextHint={`品类 ${todayCategoryKey} · 信号 ${todaySignalType}${firstOppGoodsId ? ` · ${firstOppGoodsId}` : ''}`}
      />
    </div>
  );
}
