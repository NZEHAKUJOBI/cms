import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import InstallPrompt from './InstallPrompt';
import LowStockBanner from './LowStockBanner';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Package,
  BoxesIcon,
  ClipboardList,
  Truck,
  BarChart3,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'FacilityManager'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
  { to: '/facility-users', label: 'My Users', icon: Users, roles: ['Pharmacist'] },
  { to: '/facilities', label: 'Facilities', icon: Building2, roles: ['Admin', 'Pharmacist'] },
  { to: '/products', label: 'Products', icon: Package, roles: ['Admin', 'FacilityManager', 'Pharmacist'] },
  { to: '/inventory', label: 'Inventory', icon: BoxesIcon, roles: ['Admin', 'FacilityManager', 'Pharmacist'] },
  { to: '/orders', label: 'Orders', icon: ClipboardList, roles: ['Admin', 'FacilityManager', 'Pharmacist'] },
  { to: '/shipments', label: 'Shipments', icon: Truck, roles: ['Admin', 'FacilityManager', 'Pharmacist'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'FacilityManager', 'Pharmacist'] },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter((item) => !user?.role || item.roles.includes(user.role));

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      <div className="flex items-center gap-2 px-6 py-5 border-b border-blue-800">
        <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          Rx
        </div>
        <span className="text-white font-semibold text-lg">PSCMS</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-blue-800">
        <div className="text-blue-200 text-xs mb-3">
          <div className="font-medium text-white">{user?.username}</div>
          <div>{user?.role}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-blue-200 hover:text-white text-sm w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-64 h-full bg-blue-900">
            <button
              className="absolute top-3 right-3 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <Menu size={22} />
          </button>
          <span className="font-semibold text-blue-900">PSCMS</span>
        </header>

        <LowStockBanner />

        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Outlet />
        </main>
      </div>

    {/* Bottom navigation – mobile only */}
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {bottomNavItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    <InstallPrompt />
  </div>
  );
}
