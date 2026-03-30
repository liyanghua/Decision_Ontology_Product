import { Outlet, NavLink } from 'react-router';
import { TaskFlowOverrideProvider } from '../contexts/TaskFlowOverrideContext';
import { ReviewLedgerProvider } from '../contexts/ReviewLedgerContext';
import { ReviewLearningStrip } from './review/ReviewLearningStrip';
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  Activity, 
  PlayCircle,
  ChevronDown,
  Search,
  Calendar,
  GitBranch,
  Sunrise,
} from 'lucide-react';

export function Layout() {
  const navItems = [
    { path: '/', label: '经营搭档', icon: LayoutDashboard },
    { path: '/today', label: '今日操盘台', icon: Sunrise },
    { path: '/products', label: '商品操盘台', icon: Package },
    { path: '/approvals', label: '动作审批中心', icon: CheckCircle },
    { path: '/execution', label: '执行与结果', icon: Activity },
    { path: '/replay', label: '回放与解释', icon: PlayCircle },
  ];

  return (
    <TaskFlowOverrideProvider>
    <ReviewLedgerProvider>
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="font-semibold text-gray-900">操盘智能</h1>
          <span className="ml-2 text-xs text-gray-500">MVP</span>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
              <GitBranch className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">环境</span>
              <button className="flex items-center gap-1 text-gray-900 font-medium hover:text-blue-600">
                正式 v2.3.1
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">时间:</span>
              <button className="flex items-center gap-1 text-gray-900 font-medium hover:text-blue-600">
                最近 7 天
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品、SKU..."
                className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              2026-03-28 10:45
            </div>
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
    </TaskFlowOverrideProvider>
  );
}
