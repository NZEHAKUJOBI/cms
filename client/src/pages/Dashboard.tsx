import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Building2,
  Package,
  ClipboardList,
  Truck,
  AlertTriangle,
  Clock,
  BoxesIcon,
  TrendingDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  to,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  to?: string;
}) {
  const card = (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient} ${to ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer' : ''}`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative">
        <Icon size={20} className="mb-3 opacity-80" />
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
        <div className="text-sm opacity-80 mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

function AnimatedBar({ pct, colorClass, delay = 0 }: { pct: number; colorClass: string; delay?: number }) {
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full animate-bar-grow ${colorClass}`}
        style={{ '--bar-width': `${pct}%`, animationDelay: `${delay}ms` } as React.CSSProperties}
      />
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.getDashboard,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard…</div>;
  if (isError || !data) return <div className="flex items-center justify-center h-64 text-red-500">Failed to load dashboard data.</div>;

  const maxLow = Math.max(...data.facilitySummaries.map((f) => f.lowStockCount), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">System-wide overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Total Facilities" value={data.totalFacilities} icon={Building2} gradient="bg-gradient-to-br from-blue-500 to-blue-600" to="/facilities" />
        <StatCard label="Total Products" value={data.totalProducts} icon={Package} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" to="/products" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={ClipboardList} gradient="bg-gradient-to-br from-amber-500 to-orange-500" to="/orders" />
        <StatCard label="Active Shipments" value={data.activeShipments} icon={Truck} gradient="bg-gradient-to-br from-emerald-500 to-green-600" to="/shipments" />
        <StatCard label="Low Stock Alerts" value={data.lowStockAlerts} icon={AlertTriangle} gradient="bg-gradient-to-br from-rose-500 to-red-600" to="/inventory" />
        <StatCard label="Near Expiry" value={data.nearExpiryAlerts} icon={Clock} gradient="bg-gradient-to-br from-orange-400 to-amber-500" to="/inventory" />
      </div>

      {data.facilitySummaries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Facility Low-Stock Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Items at or below reorder level</p>
          </div>

          {/* Mobile: card-style */}
          <div className="sm:hidden divide-y divide-gray-50">
            {data.facilitySummaries.map((f, i) => (
              <div key={f.facilityId} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{f.facilityName}</span>
                  <span className="text-xs text-gray-400">{f.totalProducts} products</span>
                </div>
                <AnimatedBar
                  pct={Math.max(2, Math.round((f.lowStockCount / maxLow) * 100))}
                  colorClass={f.outOfStockCount > 0 ? 'bg-rose-500' : f.lowStockCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}
                  delay={i * 80}
                />
                <div className="flex gap-3 text-xs">
                  {f.outOfStockCount > 0 && <span className="text-rose-600 font-medium">{f.outOfStockCount} out of stock</span>}
                  {f.lowStockCount > 0 && <span className="text-amber-600">{f.lowStockCount} low stock</span>}
                  {f.nearExpiryCount > 0 && <span className="text-orange-500">{f.nearExpiryCount} near expiry</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: bar chart */}
          <div className="hidden sm:block px-5 py-4 space-y-3">
            {data.facilitySummaries.map((f, i) => (
              <div key={f.facilityId} className="flex items-center gap-3">
                <div className="w-40 text-sm text-gray-700 truncate flex-shrink-0">{f.facilityName}</div>
                <AnimatedBar
                  pct={Math.max(2, Math.round((f.lowStockCount / maxLow) * 100))}
                  colorClass={f.outOfStockCount > 0 ? 'bg-rose-500' : f.lowStockCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}
                  delay={i * 80}
                />
                <div className="w-24 text-right text-xs text-gray-500 flex-shrink-0">
                  {f.outOfStockCount > 0 && <span className="text-rose-600 font-medium">{f.outOfStockCount} OOS · </span>}
                  {f.lowStockCount} low
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FacilityManagerDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['facility-dashboard'],
    queryFn: reportsApi.getFacilityDashboard,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard…</div>;
  if (isError || !data) return <div className="flex items-center justify-center h-64 text-red-500">Failed to load dashboard data.</div>;

  const maxCat = Math.max(...data.categoryBreakdown.map((c) => c.itemCount), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.facilityName}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Products" value={data.totalProducts} icon={Package} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" to="/inventory" />
        <StatCard label="Low Stock" value={data.lowStockItems} icon={AlertTriangle} gradient="bg-gradient-to-br from-amber-500 to-orange-500" to="/inventory" />
        <StatCard label="Out of Stock" value={data.outOfStockItems} icon={TrendingDown} gradient="bg-gradient-to-br from-rose-500 to-red-600" to="/inventory" />
        <StatCard label="Near Expiry" value={data.nearExpiryItems} icon={Clock} gradient="bg-gradient-to-br from-orange-400 to-amber-500" to="/inventory" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={ClipboardList} gradient="bg-gradient-to-br from-blue-500 to-blue-600" to="/orders" />
        <StatCard label="Incoming Ships" value={data.incomingShipments} icon={Truck} gradient="bg-gradient-to-br from-emerald-500 to-green-600" to="/shipments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {data.categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Stock by Category</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {data.categoryBreakdown.map((c, i) => (
                <div key={c.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{c.category}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {c.itemCount} items
                      {c.lowCount > 0 && <span className="text-amber-600"> · {c.lowCount} low</span>}
                    </span>
                  </div>
                  <AnimatedBar
                    pct={Math.max(2, Math.round((c.itemCount / maxCat) * 100))}
                    colorClass={c.lowCount > 0 ? 'bg-amber-400' : 'bg-indigo-500'}
                    delay={i * 80}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {data.topLowStockItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Top Low-Stock Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {data.topLowStockItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isOutOfStock ? 'bg-rose-500' : 'bg-amber-400'}`} />
                    <span className="text-sm text-gray-800 truncate">{item.productName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-sm font-semibold tabular-nums ${item.isOutOfStock ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.currentStock}
                    </span>
                    <span className="text-xs text-gray-400">/ {item.reorderLevel}</span>
                    {item.isOutOfStock && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700 uppercase tracking-wide">OOS</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, isFacilityManager } = useAuth();

  if (!isAdmin && !isFacilityManager) {
    return <Navigate to="/inventory" replace />;
  }

  return isAdmin ? <AdminDashboard /> : <FacilityManagerDashboard />;
}
