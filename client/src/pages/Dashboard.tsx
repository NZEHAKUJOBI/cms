import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';
import { inventoryApi } from '@/api/inventory';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  Building2,
  Package,
  ClipboardList,
  Truck,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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

      <DemandRiskWidget />
      <DrugCharts />
    </div>
  );
}

function DemandRiskWidget({ facilityId }: { facilityId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['risk-summary', facilityId],
    queryFn: () => inventoryApi.getRiskSummary(facilityId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading demand risk…</div>;
  if (!data) return null;

  const total = data.totalItems || 1;
  const critPct = Math.round((data.criticalCount / total) * 100);
  const warnPct = Math.round((data.warningCount / total) * 100);
  const okPct = Math.round((data.okCount / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-900">Demand Risk Summary</h2>
          <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md ml-1">ML.NET · SSA</span>
        </div>
        <Link to="/forecasting" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          View All Forecasts →
        </Link>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-center">
            <div className="text-2xl font-bold text-rose-600">{data.criticalCount}</div>
            <div className="text-xs text-rose-500 font-medium mt-0.5">Critical</div>
            <div className="text-[10px] text-rose-400">&lt;2 wks</div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{data.warningCount}</div>
            <div className="text-xs text-amber-500 font-medium mt-0.5">Warning</div>
            <div className="text-[10px] text-amber-400">2–4 wks</div>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{data.okCount}</div>
            <div className="text-xs text-emerald-500 font-medium mt-0.5">Safe</div>
            <div className="text-[10px] text-emerald-400">&gt;4 wks</div>
          </div>
        </div>

        {/* Stacked progress bar */}
        <div className="flex rounded-full overflow-hidden h-2 gap-px bg-gray-100">
          {critPct > 0 && <div className="bg-rose-500 transition-all duration-700" style={{ width: `${critPct}%` }} />}
          {warnPct > 0 && <div className="bg-amber-400 transition-all duration-700" style={{ width: `${warnPct}%` }} />}
          {okPct > 0 && <div className="bg-emerald-400 transition-all duration-700" style={{ width: `${okPct}%` }} />}
        </div>

        {/* Top at-risk items */}
        {data.topRiskItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Highest-Risk Items</p>
            <div className="divide-y divide-gray-50">
              {data.topRiskItems.slice(0, 5).map((item) => (
                <div key={item.inventoryId} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.riskLevel === 'Critical' ? 'bg-rose-500' :
                      item.riskLevel === 'Warning' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <span className="text-sm text-gray-800 truncate">{item.productName}</span>
                    <span className="text-xs text-gray-400 truncate hidden sm:inline">{item.facilityName}</span>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${
                    item.riskLevel === 'Critical' ? 'text-rose-600' :
                    item.riskLevel === 'Warning' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {item.weeksUntilStockout == null ? '∞' : `${item.weeksUntilStockout.toFixed(1)}w`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DrugCharts() {
  const { data, isLoading } = useQuery({
    queryKey: ['drug-charts'],
    queryFn: reportsApi.getDrugChartData,
  });

  if (isLoading) return <div className="flex items-center justify-center h-32 text-gray-400">Loading drug analytics…</div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Products by Category</h3>
          <p className="text-xs text-gray-400 mt-0.5">Number of drug regimens per treatment category</p>
        </div>
        <span className="text-xs text-gray-400">{data.totalDrugs} total · {data.activeDrugs} active</span>
      </div>
      <div className="px-2 py-4" style={{ height: Math.max(280, data.productsByCategory.length * 36) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.productsByCategory} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="category"
              type="category"
              width={180}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,.07)' }}
              formatter={(value) => [`${value} products`, 'Count']}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
              {data.productsByCategory.map((_, idx) => (
                <Cell key={idx} fill={idx % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
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

      <DemandRiskWidget facilityId={data.facilityId} />
      <DrugCharts />
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
