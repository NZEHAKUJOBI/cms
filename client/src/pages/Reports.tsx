import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';
import { facilitiesApi } from '@/api/facilities';
import { useAuth } from '@/context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  Adequate: 'text-green-600',
  Low: 'text-amber-600',
  Critical: 'text-red-600',
  'Out of Stock': 'text-red-700 font-bold',
};

function StockReport() {
  const { isFacilityManager, facilityId: authFacilityId } = useAuth();
  const [facilityId, setFacilityId] = useState(authFacilityId ?? '');
  const { data: facilities } = useQuery({ queryKey: ['facilities-all'], queryFn: () => facilitiesApi.getAll(1, 200), enabled: !isFacilityManager });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stock-report', facilityId],
    queryFn: () => reportsApi.getStockReport(facilityId),
    enabled: !!facilityId,
  });

  return (
    <div className="space-y-4">
      {!isFacilityManager && (
        <div className="flex items-center gap-3">
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"
          >
            <option value="">Select facility…</option>
            {facilities?.items.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      )}

      {!facilityId && !isFacilityManager && <p className="text-gray-400 text-sm">Select a facility to view its stock report.</p>}
      {facilityId && isLoading && <p className="text-gray-400 text-sm">Loading…</p>}
      {facilityId && isError && <p className="text-red-500 text-sm">Failed to load report.</p>}

      {data && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="font-semibold text-gray-900">{data.facilityName}</div>
            <div className="text-xs text-gray-500">{data.facilityRegion} · Report date: {new Date(data.reportDate).toLocaleDateString()}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left font-semibold">Product</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Stock</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Reorder Lvl</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {item.productName}
                      <div className="text-xs text-gray-400">{item.genericName}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{item.category}</td>
                    <td className="px-5 py-3.5 text-right">{item.currentStock} <span className="text-gray-400 text-xs">{item.unit}</span></td>
                    <td className="px-5 py-3.5 text-right text-gray-600">{item.reorderLevel}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-medium ${STATUS_COLORS[item.stockStatus] ?? 'text-gray-600'}`}>{item.stockStatus}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No inventory data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderReport() {
  const today = new Date().toISOString().substring(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().substring(0, 10);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order-report', from, to],
    queryFn: () => reportsApi.getOrderReport(from, to),
    enabled: submitted,
  });

  const ORDER_STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-blue-100 text-blue-700',
    Rejected: 'bg-red-100 text-red-700',
    Fulfilled: 'bg-green-100 text-green-700',
    Cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white" />
        </div>
        <button
          onClick={() => setSubmitted(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
        >
          Generate
        </button>
      </div>

      {submitted && isLoading && <p className="text-gray-400 text-sm">Loading…</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: data.totalOrders, color: 'bg-blue-50 text-blue-700' },
              { label: 'Pending', value: data.pendingOrders, color: 'bg-amber-50 text-amber-700' },
              { label: 'Approved', value: data.approvedOrders, color: 'bg-green-50 text-green-700' },
              { label: 'Rejected', value: data.rejectedOrders, color: 'bg-red-50 text-red-700' },
              { label: 'Fulfilled', value: data.fulfilledOrders, color: 'bg-teal-50 text-teal-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`${color} rounded-xl px-4 py-3 text-center`}>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs font-medium">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left font-semibold">Order #</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Facility</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Date</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.orders.map((o, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-indigo-600">{o.orderNumber}</td>
                      <td className="px-5 py-3.5 text-gray-700">{o.facilityName}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right text-gray-600">{o.totalItems}</td>
                    </tr>
                  ))}
                  {data.orders.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  const { isAdmin, isFacilityManager } = useAuth();
  const [tab, setTab] = useState<'stock' | 'orders'>('stock');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Analytics and stock insights</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('stock')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'stock' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Stock Report
        </button>
        {(isAdmin || isFacilityManager) && (
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Order Report
          </button>
        )}
      </div>

      {tab === 'stock' && <StockReport />}
      {tab === 'orders' && (isAdmin || isFacilityManager) && <OrderReport />}
    </div>
  );
}
