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
  to,
  accent = 'blue',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  to?: string;
  accent?: 'blue' | 'red' | 'amber' | 'green' | 'gray';
}) {
  const iconColors = {
    blue: 'text-[#1a73e8]',
    red: 'text-[#d93025]',
    amber: 'text-[#f29900]',
    green: 'text-[#1e8e3e]',
    gray: 'text-[#5f6368]',
  };
  const card = (
    <div className={`bg-white border border-[#e8eaed] rounded-xl p-5 transition-all duration-150 ${to ? 'hover:shadow-md hover:border-[#dadce0] cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-[#5f6368] font-medium">{label}</span>
        <Icon size={18} className={iconColors[accent]} />
      </div>
      <div className="text-3xl font-normal text-[#202124] tabular-nums leading-none">{value.toLocaleString()}</div>
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
        <h1 className="text-2xl font-normal text-[#202124] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#5f6368] mt-0.5">System-wide overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Total Facilities" value={data.totalFacilities} icon={Building2} accent="blue" to="/facilities" />
        <StatCard label="Total Products" value={data.totalProducts} icon={Package} accent="gray" to="/products" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={ClipboardList} accent="amber" to="/orders" />
        <StatCard label="Active Shipments" value={data.activeShipments} icon={Truck} accent="green" to="/shipments" />
        <StatCard label="Low Stock Alerts" value={data.lowStockAlerts} icon={AlertTriangle} accent="red" to="/inventory" />
        <StatCard label="Near Expiry" value={data.nearExpiryAlerts} icon={Clock} accent="amber" to="/inventory" />
      </div>

      {data.facilitySummaries.length > 0 && (
        <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e8eaed]">
            <p className="text-sm font-medium text-[#202124]">Facility Low-Stock Overview</p>
            <p className="text-xs text-[#5f6368] mt-0.5">Items at or below reorder level</p>
          </div>

          {/* Mobile: card-style */}
          <div className="sm:hidden divide-y divide-[#e8eaed]">
            {data.facilitySummaries.map((f, i) => (
              <div key={f.facilityId} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#202124]">{f.facilityName}</span>
                  <span className="text-xs text-[#5f6368]">{f.totalProducts} products</span>
                </div>
                <AnimatedBar
                  pct={Math.max(2, Math.round((f.lowStockCount / maxLow) * 100))}
                  colorClass={f.outOfStockCount > 0 ? 'bg-[#d93025]' : f.lowStockCount > 0 ? 'bg-[#f29900]' : 'bg-[#1e8e3e]'}
                  delay={i * 80}
                />
                <div className="flex gap-3 text-xs">
                  {f.outOfStockCount > 0 && <span className="text-[#d93025] font-medium">{f.outOfStockCount} out of stock</span>}
                  {f.lowStockCount > 0 && <span className="text-[#f29900]">{f.lowStockCount} low stock</span>}
                  {f.nearExpiryCount > 0 && <span className="text-[#5f6368]">{f.nearExpiryCount} near expiry</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block px-5 py-4 space-y-3">
            {data.facilitySummaries.map((f, i) => (
              <div key={f.facilityId} className="flex items-center gap-3">
                <div className="w-40 text-sm text-[#5f6368] truncate flex-shrink-0">{f.facilityName}</div>
                <AnimatedBar
                  pct={Math.max(2, Math.round((f.lowStockCount / maxLow) * 100))}
                  colorClass={f.outOfStockCount > 0 ? 'bg-[#d93025]' : f.lowStockCount > 0 ? 'bg-[#f29900]' : 'bg-[#1e8e3e]'}
                  delay={i * 80}
                />
                <div className="w-24 text-right text-xs text-[#5f6368] flex-shrink-0">
                  {f.outOfStockCount > 0 && <span className="text-[#d93025] font-medium">{f.outOfStockCount} OOS · </span>}
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

  if (isLoading) return (
    <div className="bg-white border border-[#e8eaed] rounded-xl p-5 animate-pulse h-40" />
  );
  if (!data) return null;

  const total = data.totalItems || 1;

  return (
    <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e8eaed] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TrendingUp size={16} className="text-[#1a73e8]" />
          <span className="text-sm font-medium text-[#202124]">Demand Risk</span>
          <span className="text-[10px] font-medium bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded ml-1">ML · SSA</span>
        </div>
        <Link to="/forecasting" className="text-xs text-[#1a73e8] hover:underline font-medium">
          View forecasts →
        </Link>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 divide-x divide-[#e8eaed]">
          <div className="pr-4 text-center">
            <div className="text-2xl font-normal text-[#d93025] tabular-nums">{data.criticalCount}</div>
            <div className="text-xs text-[#5f6368] mt-1">Critical</div>
            <div className="text-[10px] text-[#80868b]">&lt;2 weeks</div>
          </div>
          <div className="px-4 text-center">
            <div className="text-2xl font-normal text-[#f29900] tabular-nums">{data.warningCount}</div>
            <div className="text-xs text-[#5f6368] mt-1">Warning</div>
            <div className="text-[10px] text-[#80868b]">2–4 weeks</div>
          </div>
          <div className="pl-4 text-center">
            <div className="text-2xl font-normal text-[#1e8e3e] tabular-nums">{data.okCount}</div>
            <div className="text-xs text-[#5f6368] mt-1">Safe</div>
            <div className="text-[10px] text-[#80868b]">&gt;4 weeks</div>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="flex h-1.5 rounded-full overflow-hidden bg-[#f8f9fa]">
          {data.criticalCount > 0 && <div className="bg-[#d93025]" style={{ width: `${(data.criticalCount / total) * 100}%` }} />}
          {data.warningCount > 0 && <div className="bg-[#f29900]" style={{ width: `${(data.warningCount / total) * 100}%` }} />}
          {data.okCount > 0 && <div className="bg-[#1e8e3e]" style={{ width: `${(data.okCount / total) * 100}%` }} />}
        </div>

        {data.topRiskItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[#5f6368] font-medium uppercase tracking-wide">Highest Risk</p>
            {data.topRiskItems.slice(0, 4).map((item) => (
              <div key={item.inventoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    item.riskLevel === 'Critical' ? 'bg-[#d93025]' : 'bg-[#f29900]'
                  }`} />
                  <span className="text-sm text-[#202124] truncate">{item.productName}</span>
                </div>
                <span className={`text-xs font-medium flex-shrink-0 ml-2 ${
                  item.riskLevel === 'Critical' ? 'text-[#d93025]' : 'text-[#f29900]'
                }`}>
                  {item.weeksUntilStockout == null ? '∞' : `${item.weeksUntilStockout.toFixed(1)}w`}
                </span>
              </div>
            ))}
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

  if (isLoading) return <div className="bg-white border border-[#e8eaed] rounded-xl h-40 animate-pulse" />;
  if (!data) return null;

  return (
    <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e8eaed] flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#202124]">Products by Category</p>
          <p className="text-xs text-[#5f6368] mt-0.5">Drug regimens per treatment category</p>
        </div>
        <span className="text-xs text-[#5f6368]">{data.totalDrugs} total · {data.activeDrugs} active</span>
      </div>
      <div className="px-2 py-4" style={{ height: Math.max(240, data.productsByCategory.length * 34) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.productsByCategory} layout="vertical" margin={{ left: 10, right: 24, top: 4, bottom: 4 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9aa0a6' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="category"
              type="category"
              width={180}
              tick={{ fontSize: 11, fill: '#5f6368' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f8f9fa' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', boxShadow: '0 2px 8px rgba(0,0,0,.08)', fontSize: 12 }}
              formatter={(value) => [`${value} products`, 'Count']}
            />
            <Bar dataKey="count" fill="#1a73e8" radius={[0, 4, 4, 0]} barSize={16}>
              {data.productsByCategory.map((_, idx) => (
                <Cell key={idx} fill={idx % 2 === 0 ? '#1a73e8' : '#4285f4'} />
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

  if (isLoading) return <div className="flex items-center justify-center h-64 text-[#5f6368]">Loading dashboard…</div>;
  if (isError || !data) return <div className="flex items-center justify-center h-64 text-[#d93025]">Failed to load dashboard data.</div>;

  const maxCat = Math.max(...data.categoryBreakdown.map((c) => c.itemCount), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-normal text-[#202124] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#5f6368] mt-0.5">{data.facilityName}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Products" value={data.totalProducts} icon={Package} accent="blue" to="/inventory" />
        <StatCard label="Low Stock" value={data.lowStockItems} icon={AlertTriangle} accent="amber" to="/inventory" />
        <StatCard label="Out of Stock" value={data.outOfStockItems} icon={TrendingDown} accent="red" to="/inventory" />
        <StatCard label="Near Expiry" value={data.nearExpiryItems} icon={Clock} accent="amber" to="/inventory" />
        <StatCard label="Pending Orders" value={data.pendingOrders} icon={ClipboardList} accent="gray" to="/orders" />
        <StatCard label="Incoming Ships" value={data.incomingShipments} icon={Truck} accent="green" to="/shipments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {data.categoryBreakdown.length > 0 && (
          <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8eaed]">
              <p className="text-sm font-medium text-[#202124]">Stock by Category</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {data.categoryBreakdown.map((c, i) => (
                <div key={c.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5f6368] truncate">{c.category}</span>
                    <span className="text-xs text-[#80868b] flex-shrink-0 ml-2">
                      {c.itemCount} items
                      {c.lowCount > 0 && <span className="text-[#f29900]"> · {c.lowCount} low</span>}
                    </span>
                  </div>
                  <AnimatedBar
                    pct={Math.max(2, Math.round((c.itemCount / maxCat) * 100))}
                    colorClass={c.lowCount > 0 ? 'bg-[#f29900]' : 'bg-[#1a73e8]'}
                    delay={i * 80}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {data.topLowStockItems.length > 0 && (
          <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e8eaed]">
              <p className="text-sm font-medium text-[#202124]">Top Low-Stock Items</p>
            </div>
            <div className="divide-y divide-[#f8f9fa]">
              {data.topLowStockItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3 hover:bg-[#f8f9fa] transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.isOutOfStock ? 'bg-[#d93025]' : 'bg-[#f29900]'}`} />
                    <span className="text-sm text-[#202124] truncate">{item.productName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-sm font-medium tabular-nums ${item.isOutOfStock ? 'text-[#d93025]' : 'text-[#f29900]'}`}>
                      {item.currentStock}
                    </span>
                    <span className="text-xs text-[#80868b]">/ {item.reorderLevel}</span>
                    {item.isOutOfStock && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#fce8e6] text-[#d93025] uppercase tracking-wide">OOS</span>
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
