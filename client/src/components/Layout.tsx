import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import InstallPrompt from './InstallPrompt';
import LowStockBanner from './LowStockBanner';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { notificationsApi } from '@/api/notifications';
import {
  LayoutDashboard,
  Building2,
  Package,
  BoxesIcon,
  ClipboardList,
  Truck,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Users,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'StateManager', 'Laboratory'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
  { to: '/facility-users', label: 'My Users', icon: Users, roles: ['Pharmacist'] },
  { to: '/state-users', label: 'State Users', icon: Users, roles: ['StateManager'] },
  { to: '/facilities', label: 'Facilities', icon: Building2, roles: ['Admin', 'StateManager', 'Pharmacist'] },
  { to: '/products', label: 'Products', icon: Package, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
  { to: '/inventory', label: 'Inventory', icon: BoxesIcon, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
  { to: '/orders', label: 'Orders', icon: ClipboardList, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
  { to: '/shipments', label: 'Shipments', icon: Truck, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
  { to: '/forecasting', label: 'Forecasting', icon: TrendingUp, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'] },
];

const bottomNavItems = [
  { to: '/inventory', label: 'Inventory', icon: BoxesIcon },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/shipments', label: 'Shipments', icon: Truck },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pending orders badge count (only for admins)
  const { data: pendingOrders } = useQuery({
    queryKey: ['orders-pending-count'],
    queryFn: () => ordersApi.getAll(1, 1, undefined, 'Pending'),
    enabled: user?.role === 'Admin',
    staleTime: 60_000,
  });
  const pendingCount = pendingOrders?.totalCount ?? 0;

  // Notification center
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Breadcrumb mapping
  const breadcrumbMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/facilities': 'Facilities',
    '/products': 'Products',
    '/inventory': 'Inventory',
    '/orders': 'Orders',
    '/shipments': 'Shipments',
    '/transfers': 'Transfers',
    '/forecasting': 'Forecasting',
    '/reports': 'Reports',
    '/users': 'Users',
    '/facility-users': 'My Users',
  };
  const currentPage = breadcrumbMap[location.pathname] ?? 'PSCMS';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter((item) => !user?.role || item.roles.includes(user.role));

  const roleColor =
    user?.role === 'Admin'
      ? 'bg-purple-500/20 text-purple-300'
      : user?.role === 'FacilityManager'
        ? 'bg-blue-500/20 text-blue-300'
        : 'bg-emerald-500/20 text-emerald-300';

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
          Rx
        </div>
        <div>
          <span className="text-white font-semibold text-lg tracking-tight">PSCMS</span>
          <div className="text-[10px] text-slate-400 -mt-0.5 font-medium">Supply Chain</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-200" />
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-white text-sm truncate">{user?.username}</div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-0.5 ${roleColor}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs w-full px-1 py-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/80">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 flex-shrink-0 border-r border-slate-800">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-72 h-full bg-slate-900 shadow-2xl animate-slide-in-left">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header — visible on all screens */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-400 font-medium hidden md:inline">PSCMS</span>
              <ChevronRight size={14} className="text-gray-300 hidden md:inline" />
              <span className="font-semibold text-gray-800">{currentPage}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Notifications</span>
                    {notifications.length > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{notifications.length}</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">All clear — no alerts right now.</div>
                  ) : (
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {notifications.map((n, i) => {
                        const colors: Record<string, string> = {
                          order: 'bg-amber-100 text-amber-700',
                          stock: 'bg-red-100 text-red-700',
                          expiry: 'bg-orange-100 text-orange-700',
                          shipment: 'bg-blue-100 text-blue-700',
                        };
                        return (
                          <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <span className={`mt-0.5 text-xs px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wide ${colors[n.type] ?? 'bg-gray-100 text-gray-600'}`}>{n.type}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span>Welcome back,</span>
            <span className="font-medium text-gray-800">{user?.username}</span>
          </div>
        </header>

        <LowStockBanner />

        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom navigation – mobile only */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-200/60 flex z-30"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {bottomNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-all ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative p-1 rounded-lg transition-colors ${isActive ? 'bg-indigo-50' : ''}`}>
                  <Icon size={20} />
                  {to === '/orders' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <InstallPrompt />
    </div>
  );
}
