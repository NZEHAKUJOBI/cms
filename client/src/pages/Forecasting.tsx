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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';

// ─── Colour palette (Google minimal) ─────────────────────────────────────────
const RISK_BADGE: Record<string, string> = {
  Critical: 'bg-[#fce8e6] text-[#d93025]',
  Warning:  'bg-[#fef7e0] text-[#f29900]',
  OK:       'bg-[#e6f4ea] text-[#1e8e3e]',
};

const RISK_DOT: Record<string, string> = {
  Critical: 'bg-[#d93025]',
  Warning:  'bg-[#f29900]',
  OK:       'bg-[#1e8e3e]',
};

const RISK_TEXT: Record<string, string> = {
  Critical: 'text-[#d93025]',
  Warning:  'text-[#f29900]',
  OK:       'text-[#1e8e3e]',
};

const RISK_HEX: Record<string, string> = {
  Critical: '#d93025',
  Warning:  '#f29900',
  OK:       '#1e8e3e',
};

// ─── ForecastModal ────────────────────────────────────────────────────────────
function ForecastModal({
  inventoryId,
  productName,
  onClose,
}: {
  inventoryId: string;
  productName: string;
  onClose: () => void;
}) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col border border-[#e8eaed]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8eaed] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={16} className="text-[#1a73e8]" />
            <span className="text-sm font-medium text-[#202124]">ML Forecast — {productName}</span>
          </div>
          <button onClick={onClose} className="text-[#5f6368] hover:text-[#202124] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center text-[#5f6368] py-12 text-sm">Running ML model…</div>
          ) : !data ? (
            <div className="text-center text-[#5f6368] py-12 text-sm">No forecast data available.</div>
          ) : (
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${RISK_BADGE[data.riskLevel]}`}>
                  {data.riskLevel} Risk
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                  data.modelUsed === 'SSA' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'bg-[#f8f9fa] text-[#5f6368]'
                }`}>
                  {data.modelUsed === 'SSA' ? 'ML · SSA' : 'Simple Average'}
                </span>
                {data.modelUsed === 'Average' && (
                  <span className="text-xs text-[#80868b]">Need ≥8 weekly snapshots for SSA</span>
                )}
              </div>

              {/* KPI grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Current Stock', value: data.currentStock, unit: '' },
                  { label: 'Avg Weekly Use', value: data.avgWeeklyConsumption.toFixed(1), unit: '/wk' },
                  { label: 'Weeks to Stockout', value: data.weeksUntilStockout == null ? '∞' : data.weeksUntilStockout.toFixed(1), unit: 'wks' },
                  { label: 'Stock in 4 Weeks', value: data.forecastedStockIn4Weeks, unit: '' },
                ].map(k => (
                  <div key={k.label} className="bg-[#f8f9fa] rounded-lg p-3 border border-[#e8eaed]">
                    <div className="text-xs text-[#5f6368] mb-1">{k.label}</div>
                    <div className="text-xl font-normal text-[#202124] tabular-nums">
                      {k.value}
                      <span className="text-xs text-[#80868b] ml-1">{k.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reorder alert */}
              {data.suggestedReorderQuantity > 0 && (
                <div className="flex items-center gap-2.5 p-3 bg-[#fef7e0] rounded-lg border border-[#feefc3]">
                  <AlertTriangle size={14} className="text-[#f29900] flex-shrink-0" />
                  <span className="text-sm text-[#202124]">
                    Suggested reorder:{' '}
                    <strong className="font-medium">{data.suggestedReorderQuantity} units</strong> to cover 8 weeks of demand
                  </span>
                </div>
              )}

              {/* Forecast chart */}
              {chartData.length >= 2 ? (
                <div>
                  <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide mb-3">
                    Stock History &amp; ML Forecast
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9aa0a6' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9aa0a6' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: 12 }}
                        formatter={(v, name) => [
                          v,
                          name === 'historicalStock'
                            ? 'Actual Stock'
                            : name === 'forecastStock'
                            ? 'Forecast'
                            : name === 'upper'
                            ? 'Upper CI'
                            : 'Lower CI',
                        ]}
                      />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="#1a73e8" fillOpacity={0.08} legendType="none" />
                      <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" />
                      <ReferenceLine
                        y={data.reorderLevel}
                        stroke="#f29900"
                        strokeDasharray="4 4"
                        label={{ value: 'Reorder', position: 'insideTopLeft', fontSize: 10, fill: '#f29900' }}
                      />
                      <Line type="monotone" dataKey="historicalStock" stroke="#1a73e8" strokeWidth={2} dot={false} connectNulls={false} />
                      <Line type="monotone" dataKey="forecastStock" stroke="#1a73e8" strokeWidth={2} strokeDasharray="5 4" strokeOpacity={0.6} dot={false} connectNulls={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-[#80868b] italic">
                  Not enough historical snapshots for chart. Data accumulates weekly.
                </p>
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
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#f8f9fa] cursor-pointer transition-colors border-b border-[#f8f9fa] last:border-0"
      onClick={onClick}
    >
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${RISK_DOT[item.riskLevel]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[#202124] truncate">{item.productName}</div>
        <div className="text-xs text-[#5f6368] truncate">{item.facilityName}</div>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-sm flex-shrink-0">
        <div className="text-right">
          <div className="tabular-nums text-[#202124] font-medium">{item.currentStock}</div>
          <div className="text-xs text-[#80868b]">stock</div>
        </div>
        <div className="text-right">
          <div className="tabular-nums text-[#5f6368]">{item.avgWeeklyConsumption.toFixed(1)}</div>
          <div className="text-xs text-[#80868b]">/wk</div>
        </div>
        <div className="text-right w-20">
          <div className={`tabular-nums font-medium ${RISK_TEXT[item.riskLevel]}`}>
            {item.weeksUntilStockout == null ? '∞' : `${item.weeksUntilStockout.toFixed(1)}w`}
          </div>
          <div className="text-xs text-[#80868b]">to stockout</div>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex-shrink-0 ${RISK_BADGE[item.riskLevel]}`}>
        {item.riskLevel}
      </span>
      <ChevronRight size={13} className="text-[#dadce0] flex-shrink-0" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Forecasting() {
  const { facilityId: authFacilityId, isLaboratory } = useAuth();
  const [riskFilter, setRiskFilter] = useState<'All' | 'Critical' | 'Warning' | 'OK'>('All');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedItem, setSelectedItem] = useState<RiskItemDto | null>(null);

  const fId = isLaboratory ? authFacilityId ?? undefined : undefined;

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['risk-summary', fId],
    queryFn: () => inventoryApi.getRiskSummary(fId),
    staleTime: 60_000,
  });

  const { data: inventoryPage, isLoading: invLoading } = useQuery({
    queryKey: ['inventory-all-forecast', page, fId, riskFilter],
    queryFn: () => inventoryApi.getAll(page, pageSize, fId),
    staleTime: 30_000,
  });

  const inventoryItems: InventoryDto[] = inventoryPage?.items ?? [];
  const totalPages = inventoryPage ? Math.ceil(inventoryPage.totalCount / pageSize) : 0;

  // Chart data — facility risk distribution
  const facilityChartData = (summary?.facilityBreakdown ?? []).map(f => ({
    name: f.facilityName.length > 18 ? f.facilityName.slice(0, 16) + '…' : f.facilityName,
    Critical: f.criticalCount,
    Warning: f.warningCount,
    Safe: f.okCount,
  }));

  // Chart data — weeks until stockout per high-risk item
  const stockoutChartData = (summary?.topRiskItems ?? [])
    .filter(i => i.weeksUntilStockout !== null)
    .slice(0, 12)
    .map(i => ({
      name: i.productName.length > 14 ? i.productName.slice(0, 13) + '…' : i.productName,
      weeks: i.weeksUntilStockout as number,
      risk: i.riskLevel,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-normal text-[#202124] tracking-tight flex items-center gap-2.5">
            <TrendingUp size={20} className="text-[#1a73e8]" />
            Demand Forecasting
          </h1>
          <p className="text-sm text-[#5f6368] mt-0.5">
            ML-powered demand predictions using Singular Spectrum Analysis
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium border border-[#c5d8fd]">
          ML · SSA Model
        </span>
      </div>

      {/* Risk summary cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#f8f9fa] rounded-xl animate-pulse border border-[#e8eaed]" />
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-[#e8eaed] rounded-xl p-4">
            <div className="text-xs text-[#5f6368] mb-1">Total Items</div>
            <div className="text-3xl font-normal text-[#202124] tabular-nums">{summary.totalItems}</div>
            <div className="text-xs text-[#80868b] mt-0.5">inventory records</div>
          </div>
          <div
            className="bg-white border border-[#e8eaed] rounded-xl p-4 cursor-pointer hover:border-[#d93025] transition-colors"
            onClick={() => setRiskFilter('Critical')}
          >
            <div className="flex items-center gap-1.5 text-xs text-[#d93025] mb-1 font-medium">
              <AlertTriangle size={11} /> Critical
            </div>
            <div className="text-3xl font-normal text-[#d93025] tabular-nums">{summary.criticalCount}</div>
            <div className="text-xs text-[#80868b] mt-0.5">stockout &lt; 2 weeks</div>
          </div>
          <div
            className="bg-white border border-[#e8eaed] rounded-xl p-4 cursor-pointer hover:border-[#f29900] transition-colors"
            onClick={() => setRiskFilter('Warning')}
          >
            <div className="text-xs text-[#f29900] mb-1 font-medium">Warning</div>
            <div className="text-3xl font-normal text-[#f29900] tabular-nums">{summary.warningCount}</div>
            <div className="text-xs text-[#80868b] mt-0.5">stockout 2–4 weeks</div>
          </div>
          <div
            className="bg-white border border-[#e8eaed] rounded-xl p-4 cursor-pointer hover:border-[#1e8e3e] transition-colors"
            onClick={() => setRiskFilter('OK')}
          >
            <div className="flex items-center gap-1.5 text-xs text-[#1e8e3e] mb-1 font-medium">
              <CheckCircle2 size={11} /> Safe
            </div>
            <div className="text-3xl font-normal text-[#1e8e3e] tabular-nums">{summary.okCount}</div>
            <div className="text-xs text-[#80868b] mt-0.5">adequate stock</div>
          </div>
        </div>
      )}

      {/* ── ML Charts ─────────────────────────────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Weeks Until Stockout */}
          {stockoutChartData.length > 0 && (
            <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8eaed] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#202124]">Weeks Until Stockout</p>
                  <p className="text-xs text-[#5f6368] mt-0.5">ML forecast — highest-risk items</p>
                </div>
                <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded font-medium">SSA</span>
              </div>
              <div className="px-2 py-4" style={{ height: Math.max(200, stockoutChartData.length * 30 + 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockoutChartData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                    <XAxis type="number" domain={[0, 12]} tick={{ fontSize: 10, fill: '#9aa0a6' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#5f6368' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f8f9fa' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: 12 }}
                      formatter={(v) => [`${v} weeks`, 'Stockout']}
                    />
                    <ReferenceLine x={2} stroke="#d93025" strokeDasharray="4 3" strokeOpacity={0.6} />
                    <ReferenceLine x={4} stroke="#f29900" strokeDasharray="4 3" strokeOpacity={0.6} />
                    <Bar dataKey="weeks" radius={[0, 4, 4, 0]} barSize={14}>
                      {stockoutChartData.map((entry, idx) => (
                        <Cell key={idx} fill={RISK_HEX[entry.risk]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="px-5 pb-3 flex items-center gap-4 text-xs text-[#80868b]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 border-t-2 border-dashed border-[#d93025]" /> Critical (&lt;2w)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 border-t-2 border-dashed border-[#f29900]" /> Warning (&lt;4w)
                </span>
              </div>
            </div>
          )}

          {/* Facility Risk Overview */}
          {facilityChartData.length > 0 && (
            <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e8eaed] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#202124]">Facility Risk Overview</p>
                  <p className="text-xs text-[#5f6368] mt-0.5">Stock risk distribution per facility</p>
                </div>
                <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded font-medium">ML</span>
              </div>
              <div className="px-2 py-4" style={{ height: Math.max(200, facilityChartData.length * 34 + 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facilityChartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9aa0a6' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#5f6368' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f8f9fa' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: 12 }}
                    />
                    <Bar dataKey="Critical" fill="#d93025" barSize={10} stackId="a" />
                    <Bar dataKey="Warning"  fill="#f29900" barSize={10} stackId="a" />
                    <Bar dataKey="Safe"     fill="#1e8e3e" radius={[0, 4, 4, 0]} barSize={10} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="px-5 pb-3 flex items-center gap-4 text-xs text-[#80868b]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#d93025] inline-block" /> Critical</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f29900] inline-block" /> Warning</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1e8e3e] inline-block" /> Safe</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* High-risk shortlist */}
      {summary && summary.topRiskItems.length > 0 && (
        <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e8eaed] flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#202124]">High-Risk Items</p>
              <p className="text-xs text-[#5f6368] mt-0.5">Closest to stockout — click any row for full ML forecast</p>
            </div>
            <span className="text-xs bg-[#fce8e6] text-[#d93025] px-2 py-0.5 rounded font-medium">
              {summary.topRiskItems.length} items
            </span>
          </div>
          <div>
            {summary.topRiskItems.map(item => (
              <RiskRow key={item.inventoryId} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        </div>
      )}

      {/* All inventory */}
      <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8eaed] flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-medium text-[#202124]">All Inventory — Forecast View</p>
          <div className="flex gap-1 flex-wrap">
            {(['All', 'Critical', 'Warning', 'OK'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setRiskFilter(f); setPage(1); }}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  riskFilter === f
                    ? f === 'Critical'
                      ? 'bg-[#fce8e6] text-[#d93025]'
                      : f === 'Warning'
                      ? 'bg-[#fef7e0] text-[#f29900]'
                      : f === 'OK'
                      ? 'bg-[#e6f4ea] text-[#1e8e3e]'
                      : 'bg-[#e8f0fe] text-[#1a73e8]'
                    : 'bg-[#f8f9fa] text-[#5f6368] hover:bg-[#f1f3f4]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {invLoading ? (
          <div className="py-10 text-center text-[#5f6368] text-sm">Loading inventory…</div>
        ) : inventoryItems.length === 0 ? (
          <div className="py-10 text-center text-[#80868b] text-sm">No items found.</div>
        ) : (
          <div className="divide-y divide-[#f8f9fa]">
            {inventoryItems.map(item => {
              const stockRatio = item.reorderLevel > 0 ? item.currentStock / item.reorderLevel : 1;
              const quickRisk: RiskItemDto['riskLevel'] =
                stockRatio === 0 ? 'Critical' : stockRatio < 0.5 ? 'Critical' : stockRatio < 1 ? 'Warning' : 'OK';
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8eaed]">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-[#e8eaed] rounded-lg disabled:opacity-40 hover:bg-[#f8f9fa] text-[#5f6368] transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#5f6368]">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-[#e8eaed] rounded-lg disabled:opacity-40 hover:bg-[#f8f9fa] text-[#5f6368] transition-colors"
            >
              Next
            </button>
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
