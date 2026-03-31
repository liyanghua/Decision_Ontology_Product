import { Outlet, NavLink } from 'react-router';
import { OperatorJourneyProvider } from '../contexts/OperatorJourneyContext';
import { TaskFlowOverrideProvider } from '../contexts/TaskFlowOverrideContext';
import { ReviewLedgerProvider } from '../contexts/ReviewLedgerContext';
import { ReviewLearningStrip } from './review/ReviewLearningStrip';
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  PlayCircle,
  ArrowRight,
  Sunrise,
} from 'lucide-react';

export function Layout() {
  const navItems = [
    { path: '/', label: '经营搭档', icon: LayoutDashboard },
    { path: '/products', label: '商品诊断', icon: Package },
    { path: '/approvals', label: '动作拍板', icon: CheckCircle },
    { path: '/replay', label: '结果复盘', icon: PlayCircle },
  ];

  return (
    <TaskFlowOverrideProvider>
    <OperatorJourneyProvider>
    <ReviewLedgerProvider>
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div>
            <h1 className="font-semibold text-gray-900">经营搭档 Demo</h1>
            <div className="text-xs text-gray-500 mt-0.5">一条可重复的操盘闭环演示</div>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <NavLink
              to="/today"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-gray-50'
                }`
              }
            >
              <Sunrise className="w-5 h-5" />
              <span>更多盘面</span>
            </NavLink>
            <NavLink
              to="/execution"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-gray-50'
                }`
              }
            >
              <ArrowRight className="w-5 h-5" />
              <span>推进结果</span>
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div className="mb-1">当前用户</div>
            <div className="font-medium text-gray-900">李明</div>
            <div className="text-gray-500">商品运营负责人</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <div className="text-sm font-medium text-slate-900">省时间、控风险、可复盘</div>
            <div className="text-xs text-slate-500 mt-0.5">
              用一条主线把今日重点、动作拍板、推进结果和经验沉淀串起来。
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-slate-900">李明</div>
            <div className="text-xs text-slate-500">商品运营负责人</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          <ReviewLearningStrip />
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </ReviewLedgerProvider>
    </OperatorJourneyProvider>
    </TaskFlowOverrideProvider>
  );
}
