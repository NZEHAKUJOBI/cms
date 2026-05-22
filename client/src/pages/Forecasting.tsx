import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  X,
} from 'lucide-react';
import type { DemandForecastDto, InventoryDto, RiskItemDto } from '@/types';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';

// ─── Risk colour helpers ──────────────────────────────────────────────────────
const RISK_BG: Record<string, string> = {
  Critical: 'bg-rose-100 text-rose-700',
  Warning: 'bg-amber-100 text-amber-700',
  OK: 'bg-emerald-100 text-emerald-700',
};

const RISK_DOT: Record<string, string> = {
  Critical: 'bg-rose-500',
  Warning: 'bg-amber-400',
  OK: 'bg-emerald-500',
};

// ─── Inline ForecastModal (SSA) ───────────────────────────────────────────────
function ForecastModal({ inventoryId, productName, onClose }: { inventoryId: string; productName: string; onClose: () => void }) {
  const { data, isLoading } = useQuery<DemandForecastDto>({
    queryKey: ['forecast', inventoryId],
    queryFn: () => inventoryApi.getForecast(inventoryId),
  });

  const chartData = (() => {
    if (!data) return [];
    const historical = [...data.snapshots].reverse().map(s => ({
      week: new Date(s.weekStartDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      historicalStock: s.stockOnHand,
      forecastStock: undefined as number | undefined,
      lower: undefined as number | undefined,
      upper: undefined as number | undefined,
    }));

    const forecastPoints = data.forecastedWeeklyDemand.map((_d, i) => {
      const cumDemand = data.forecastedWeeklyDemand.slice(0, i + 1).reduce((a, b) => a + b, 0);
      const cumLower = data.confidenceLower.slice(0, i + 1).reduce((a, b) => a + b, 0);
      const cumUpper = data.confidenceUpper.slice(0, i + 1).reduce((a, b) => a + b, 0);
      return {
        week: `Wk+${i + 1}`,
        historicalStock: undefined as number | undefined,
        forecastStock: Math.max(0, Math.round(data.currentStock - cumDemand)),
        lower: Math.max(0, Math.round(data.currentStock - cumUpper)),
        upper: Math.max(0, Math.round(data.currentStock - cumLower)),
      };
    });

    const joinPoint = historical.length > 0 ? {
      week: historical[historical.length - 1].week,
      historicalStock: historical[historical.length - 1].historicalStock,
      forecastStock: historical[historical.length - 1].historicalStock,
      lower: historical[historical.length - 1].historicalStock,
      upper: historical[historical.length - 1].historicalStock,
    } : null;

    return [...historical, ...(joinPoint ? [joinPoint] : []), ...forecastPoints];
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <h2 className="font-semibold text-gray-900">ML Forecast — {productName}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">Running ML model…</div>
          ) : !data ? (
            <div className="text-center text-gray-400 py-12">No forecast data available.</div>
          ) : (
            <div className="space-y-5">
              {/* Model badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${RISK_BG[data.riskLevel]}`}>{data.riskLevel} Risk</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${data.modelUsed === 'SSA' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {data.modelUsed === 'SSA' ? '🤖 ML · SSA' : '📊 Simple Average'}
                </span>
                {data.modelUsed === 'Average' && <span className="text-xs text-gray-400">Need ≥8 weekly snapshots for SSA</span>}
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Current Stock', value: data.currentStock, unit: '' },
                  { label: 'Avg Weekly Use', value: data.avgWeeklyConsumption.toFixed(1), unit: '/wk' },
                  { label: 'Weeks to Stockout', value: data.weeksUntilStockout == null ? '∞' : data.weeksUntilStockout.toFixed(1), unit: 'wks' },
                  { label: 'Stock in 4 Weeks', value: data.forecastedStockIn4Weeks, unit: '' },
                ].map(k => (
                  <div key={k.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                    <div className="text-xl font-bold text-gray-900">{k.value}<span className="text-xs font-normal text-gray-400 ml-1">{k.unit}</span></div>
                  </div>
                ))}
              </div>

              {data.suggestedReorderQuantity > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-amber-800">Suggested reorder: <strong>{data.suggestedReorderQuantity} units</strong> to cover 8 weeks of demand</span>
                </div>
              )}

              {/* Chart */}
              {chartData.length >= 2 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Stock History &amp; ML Forecast</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v, name) => [v, name === 'historicalStock' ? 'Actual Stock' : name === 'forecastStock' ? 'Forecast' : name === 'upper' ? 'Upper 95% CI' : 'Lower 95% CI']} />
                      <Legend formatter={(v) => v === 'historicalStock' ? 'Actual Stock' : v === 'forecastStock' ? 'ML Forecast' : undefined} />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="#a855f7" fillOpacity={0.12} legendType="none" />
                      <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" />
                      <ReferenceLine y={data.reorderLevel} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Reorder', position: 'insideTopLeft', fontSize: 10, fill: '#f97316' }} />
                      <Line type="monotone" dataKey="historicalStock" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
                      <Line type="monotone" dataKey="forecastStock" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Not enough historical snapshots for chart. Data accumulates weekly.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Risk Row ─────────────────────────────────────────────────────────────────
function RiskRow({ item, onClick }: { item: RiskItemDto; onClick: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
      onClick={onClick}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${RISK_DOT[item.riskLevel]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{item.productName}</div>
        <div className="text-xs text-gray-500 truncate">{item.facilityName}</div>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-sm flex-shrink-0">
        <div className="text-right">
          <div className="font-semibold tabular-nums text-gray-900">{item.currentStock}</div>
          <div className="text-xs text-gray-400">stock</div>
        </div>
        <div className="text-right">
          <div className="font-semibold tabular-nums text-gray-600">{item.avgWeeklyConsumption.toFixed(1)}</div>
          <div className="text-xs text-gray-400">/wk</div>
        </div>
        <div className="text-right w-20">
          <div className={`font-semibold tabular-nums ${item.riskLevel === 'Critical' ? 'text-rose-600' : item.riskLevel === 'Warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
            {item.weeksUntilStockout == null ? '∞' : `${item.weeksUntilStockout.toFixed(1)}w`}
          </div>
          <div className="text-xs text-gray-400">to stockout</div>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${RISK_BG[item.riskLevel]}`}>{item.riskLevel}</span>
      <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Forecasting() {
  const { facilityId: authFacilityId, isFacilityManager } = useAuth();
  const [riskFilter, setRiskFilter] = useState<'All' | 'Critical' | 'Warning' | 'OK'>('All');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedItem, setSelectedItem] = useState<RiskItemDto | null>(null);

  const fId = isFacilityManager ? authFacilityId ?? undefined : undefined;

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['risk-summary', fId],
    queryFn: () => inventoryApi.getRiskSummary(fId),
    staleTime: 60_000,
  });

  // For the paginated list we re-use the inventory endpoint + client-side risk display
  const { data: inventoryPage, isLoading: invLoading } = useQuery({
    queryKey: ['inventory-all-forecast', page, fId, riskFilter],
    queryFn: () => inventoryApi.getAll(page, pageSize, fId),
    staleTime: 30_000,
  });

  const inventoryItems: InventoryDto[] = inventoryPage?.items ?? [];
  const totalPages = inventoryPage ? Math.ceil(inventoryPage.totalCount / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp size={22} className="text-purple-600" /> Demand Forecasting
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">ML-powered demand predictions using Singular Spectrum Analysis</p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
          🤖 ML.NET · SSA Model
        </span>
      </div>

      {/* Risk summary cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalItems}</div>
            <div className="text-xs text-gray-400 mt-0.5">inventory records</div>
          </div>
          <div className="bg-rose-50 rounded-2xl border border-rose-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRiskFilter('Critical')}>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 mb-1 font-medium"><AlertTriangle size={12} /> Critical</div>
            <div className="text-3xl font-bold text-rose-700">{summary.criticalCount}</div>
            <div className="text-xs text-rose-400 mt-0.5">stockout &lt; 2 weeks</div>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRiskFilter('Warning')}>
            <div className="text-xs text-amber-600 mb-1 font-medium">⚠ Warning</div>
            <div className="text-3xl font-bold text-amber-700">{summary.warningCount}</div>
            <div className="text-xs text-amber-400 mt-0.5">stockout 2–4 weeks</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRiskFilter('OK')}>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-1 font-medium"><CheckCircle2 size={12} /> Safe</div>
            <div className="text-3xl font-bold text-emerald-700">{summary.okCount}</div>
            <div className="text-xs text-emerald-400 mt-0.5">adequate stock</div>
          </div>
        </div>
      )}

      {/* Top-risk shortlist */}
      {summary && summary.topRiskItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">High-Risk Items</h2>
              <p className="text-xs text-gray-400 mt-0.5">Closest to stockout — click any row for full ML forecast</p>
            </div>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">{summary.topRiskItems.length} items</span>
          </div>
          <div>
            {summary.topRiskItems.map(item => (
              <RiskRow key={item.inventoryId} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        </div>
      )}

      {/* Full inventory list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-900">All Inventory — Forecast View</h2>
          <div className="flex gap-1 flex-wrap">
            {(['All', 'Critical', 'Warning', 'OK'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setRiskFilter(f); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  riskFilter === f
                    ? f === 'Critical' ? 'bg-rose-100 text-rose-700' : f === 'Warning' ? 'bg-amber-100 text-amber-700' : f === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {invLoading ? (
          <div className="py-10 text-center text-gray-400">Loading inventory…</div>
        ) : inventoryItems.length === 0 ? (
          <div className="py-10 text-center text-gray-400">No items found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {inventoryItems.map(item => {
              // Derive quick risk from stock vs reorder level as proxy
              const stockRatio = item.reorderLevel > 0 ? item.currentStock / item.reorderLevel : 1;
              const quickRisk: RiskItemDto['riskLevel'] = stockRatio === 0 ? 'Critical' : stockRatio < 0.5 ? 'Critical' : stockRatio < 1 ? 'Warning' : 'OK';
              if (riskFilter !== 'All' && quickRisk !== riskFilter) return null;

              const proxyItem: RiskItemDto = {
                inventoryId: item.id,
                productName: item.productName,
                facilityName: item.facilityName,
                currentStock: item.currentStock,
                reorderLevel: item.reorderLevel,
                avgWeeklyConsumption: 0,
                weeksUntilStockout: null,
                riskLevel: quickRisk,
              };
              return <RiskRow key={item.id} item={proxyItem} onClick={() => setSelectedItem(proxyItem)} />;
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>

      {/* Forecast modal */}
      {selectedItem && (
        <ForecastModal
          inventoryId={selectedItem.inventoryId}
          productName={selectedItem.productName}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
