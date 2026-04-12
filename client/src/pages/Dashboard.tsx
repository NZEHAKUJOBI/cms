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
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  to,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  to?: string;
}) {
  const card = (
    <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 ${to ? 'hover:shadow-md transition-shadow' : ''}`}>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

function HorizontalBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.max(1, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
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
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Facilities" value={data.totalFacilities} icon={Building2} color="bg-blue-500" to="/facilities" />
        <StatCard label="Total Products" value={data.totalProducts} icon={Package} color="bg-indigo-500" to="/products" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={ClipboardList} color="bg-amber-500" to="/orders" />
        <StatCard label="Active Shipments" value={data.activeShipments} icon={Truck} color="bg-green-500" to="/shipments" />
        <StatCard label="Low Stock Alerts" value={data.lowStockAlerts} icon={AlertTriangle} color="bg-red-500" to="/inventory" />
        <StatCard label="Near Expiry Alerts" value={data.nearExpiryAlerts} icon={Clock} color="bg-orange-500" to="/inventory" />
      </div>

      {data.facilitySummaries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Facility Low-Stock Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Items at or below reorder level</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {data.facilitySummaries.map((f) => (
              <div key={f.facilityId} className="flex items-center gap-3">
                <div className="w-36 text-sm text-gray-700 truncate flex-shrink-0">{f.facilityName}</div>
                <HorizontalBar
                  value={f.lowStockCount}
                  max={maxLow}
                  colorClass={f.outOfStockCount > 0 ? 'bg-red-500' : f.lowStockCount > 0 ? 'bg-amber-400' : 'bg-green-400'}
                />
                <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">
                  {f.outOfStockCount > 0 && <span className="text-red-600 font-medium">{f.outOfStockCount} OOS · </span>}
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.facilityName}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Products" value={data.totalProducts} icon={Package} color="bg-indigo-500" to="/inventory" />
        <StatCard label="Low Stock" value={data.lowStockItems} icon={AlertTriangle} color="bg-amber-500" to="/inventory" />
        <StatCard label="Out of Stock" value={data.outOfStockItems} icon={AlertTriangle} color="bg-red-500" to="/inventory" />
        <StatCard label="Near Expiry" value={data.nearExpiryItems} icon={Clock} color="bg-orange-500" to="/inventory" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={ClipboardList} color="bg-blue-500" to="/orders" />
        <StatCard label="Incoming Ships" value={data.incomingShipments} icon={Truck} color="bg-green-500" to="/shipments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Stock by Category</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {data.categoryBreakdown.map((c) => (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 truncate flex-shrink-0">{c.category}</div>
                  <HorizontalBar
                    value={c.itemCount}
                    max={maxCat}
                    colorClass={c.lowCount > 0 ? 'bg-amber-400' : 'bg-blue-500'}
                  />
                  <div className="w-24 text-right text-xs text-gray-500 flex-shrink-0">
                    {c.itemCount} items
                    {c.lowCount > 0 && <span className="text-amber-600"> · {c.lowCount} low</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.topLowStockItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Top Low-Stock Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {data.topLowStockItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <BoxesIcon size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-800 truncate">{item.productName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-sm font-semibold ${item.isOutOfStock ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.currentStock}
                    </span>
                    <span className="text-xs text-gray-400">/ {item.reorderLevel} min</span>
                    {item.isOutOfStock && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">OOS</span>
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
