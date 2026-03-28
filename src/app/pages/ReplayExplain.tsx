import { useState } from 'react';
import { 
  PlayCircle, 
  Code, 
  GitCompare, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { products, evidencePacks, rootCauses, strategies, executions } from '../data/mockData';

export function ReplayExplain() {
  const [selectedProduct, setSelectedProduct] = useState('P100891');
  const [expandedSections, setExpandedSections] = useState<string[]>(['evidence', 'rootcause']);
  
  const product = products.find(p => p.id === selectedProduct);
  const evidence = evidencePacks[selectedProduct as keyof typeof evidencePacks] || [];
  const causes = rootCauses[selectedProduct as keyof typeof rootCauses] || [];
  const strategyList = strategies[selectedProduct as keyof typeof strategies] || [];

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">回放与解释</h1>
        <p className="text-gray-600">诊断过程回放、差异对比与决策解释 - 面向策略产品、业务专家和算法团队</p>
      </div>

      {/* Product Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">选择商品:</label>
          <select 
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-600">版本对比:</label>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>v2.3.1 (当前)</option>
              <option>v2.3.0</option>
              <option>v2.2.5</option>
            </select>
            <span className="text-gray-500">vs</span>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>v2.3.0</option>
              <option>v2.2.5</option>
              <option>v2.2.0</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Process Flow */}
        <div className="col-span-2 space-y-6">
          {/* Input Context */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('input')}
              className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Code className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Input Context - 输入上下文</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('input') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('input') && (
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-gray-300 whitespace-pre-wrap">
{`{
  "product_id": "${selectedProduct}",
  "time_window": "7d",
  "metrics": {
    "ctr_7d": ${product?.metrics.ctr_7d},
    "impression_7d": ${product?.metrics.impression_7d},
    "conversion_7d": ${product?.metrics.conversion_7d},
    "revenue_7d": ${product?.metrics.revenue_7d}
  },
  "category_benchmark": {
    "category_ctr_p30": ${product?.metrics.category_ctr_p30}
  },
  "feature_scores": {
    "main_image_quality_score": 0.42,
    "title_relevance_score": 0.87,
    "price_competitiveness": 0.68
  }
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Evidence */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('evidence')}
              className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Evidence - 证据提取</h3>
                <span className="text-sm text-gray-500">({evidence.length} 条)</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('evidence') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('evidence') && (
              <div className="p-6 space-y-3">
                {evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      ev.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      ev.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-2">{ev.type} ({ev.metric})</div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">实际值</div>
                            <div className="font-semibold text-red-600">{ev.actual}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">期望值</div>
                            <div className="font-medium text-gray-900">{ev.expected}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">偏差</div>
                            <div className={`font-semibold ${
                              ev.deviation < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {ev.deviation > 0 ? '+' : ''}{ev.deviation.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Problem */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('problem')}
              className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Problem - 问题识别</h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('problem') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('problem') && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {product?.issues.map((issue, idx) => (
                      <li key={idx} className="text-red-800 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">问题判定逻辑:</div>
                  <div className="text-sm text-gray-900 space-y-1">
                    <div>• CTR 7日 (1.2%) {'<'} 品类基准 P30 (2.1%) → 点击率偏低</div>
                    <div>• main_image_quality_score (0.42) {'<'} 基准 (0.75) → 主图质量问题</div>
                    <div>• title_relevance_score (0.87) {'<'} 目标 (0.92) → 标题匹配度待优化</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Root Cause */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('rootcause')}
              className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">RootCause - 根因分析</h3>
                <span className="text-sm text-gray-500">({causes.length} 个)</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('rootcause') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('rootcause') && (
              <div className="p-6 space-y-3">
                {causes.map((cause, index) => (
                  <div key={cause.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 font-semibold text-gray-700 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-2">{cause.name}</div>
                        <div className="text-sm text-gray-600 mb-3">{cause.description}</div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 mb-1">置信度</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${cause.confidence * 100}%` }}
                                />
                              </div>
                              <span className="font-medium text-gray-900 w-12">{(cause.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">影响度</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-orange-600 rounded-full"
                                  style={{ width: `${cause.impact * 100}%` }}
                                />
                              </div>
                              <span className="font-medium text-gray-900 w-12">{(cause.impact * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm">
                          <div className="text-gray-600 mb-1">支持证据:</div>
                          <div className="flex flex-wrap gap-1">
                            {cause.evidence.map((evId) => {
                              const ev = evidence.find(e => e.id === evId);
                              return ev ? (
                                <span key={evId} className="px-2 py-0.5 bg-white border border-gray-300 text-gray-700 rounded text-xs">
                                  {ev.type}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategy */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('strategy')}
              className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Strategy - 策略生成</h3>
                <span className="text-sm text-gray-500">({strategyList.length} 个)</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.includes('strategy') ? 'rotate-180' : ''
              }`} />
            </button>
            
            {expandedSections.includes('strategy') && (
              <div className="p-6 space-y-3">
                {strategyList.map((strategy) => (
                  <div key={strategy.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="font-medium text-gray-900">{strategy.name}</div>
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        优先级 {strategy.priority}
                      </span>
                    </div>
                    
                    <div className="text-sm text-green-600 bg-green-50 rounded px-3 py-2 mb-3">
                      {strategy.expectedImpact}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      针对根因: {strategy.targetRootCause.map(rc => 
                        causes.find(c => c.id === rc)?.name
                      ).join(', ')}
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">包含动作:</div>
                      <ul className="space-y-1">
                        {strategy.actions.map((action, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Metadata & Comparison */}
        <div className="space-y-6">
          {/* Version Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">版本信息</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600">当前版本</div>
                <div className="font-medium text-gray-900">v2.3.1</div>
              </div>
              <div>
                <div className="text-gray-600">诊断时间</div>
                <div className="font-medium text-gray-900">2026-03-28 09:00:00</div>
              </div>
              <div>
                <div className="text-gray-600">模型版本</div>
                <div className="font-medium text-gray-900">ProductDiagnosis-v2.3</div>
              </div>
              <div>
                <div className="text-gray-600">执行耗时</div>
                <div className="font-medium text-gray-900">2.3s</div>
              </div>
            </div>
          </div>

          {/* Version Diff */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitCompare className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">版本差异</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="font-medium text-green-900 mb-1">新增</div>
                <ul className="space-y-1 text-green-700">
                  <li>+ 1 个新问题: 价格带偏差</li>
                  <li>+ 1 个根因: 价格带偏差</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-blue-900 mb-1">变化</div>
                <ul className="space-y-1 text-blue-700">
                  <li>• 主图质量评分: 0.45 → 0.42</li>
                  <li>• CTR: 1.5% → 1.2%</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">预期 vs 实际</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-gray-600 mb-2">已执行策略效果</div>
                {executions.filter(e => e.status === 'completed').map((exec) => (
                  <div key={exec.id} className="bg-green-50 rounded-lg p-3 mb-2">
                    <div className="font-medium text-green-900 mb-1">{exec.actionName}</div>
                    <div className="space-y-1 text-green-700">
                      <div>预期: {exec.expectedOutcome}</div>
                      <div>实际: {exec.actualOutcome}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">导出分析</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                导出 JSON
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                导出诊断报告
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                分享链接
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
