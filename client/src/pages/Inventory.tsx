import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { inventoryApi } from '@/api/inventory';
import { facilitiesApi } from '@/api/facilities';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type { AdjustStockDto, BulkImportResultDto, BulkImportRowDto, CreateInventoryDto, InventoryDto, SetStockDto, StockLedgerDto, UpdateInventoryDto, WeeklySnapshotDto } from '@/types';
import { Plus, AlertTriangle, Clock, X, ArrowUpDown, Pencil, History, BarChart2, Upload, Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend, ReferenceLine, ComposedChart, Area,
} from 'recharts';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; item: InventoryDto }
  | { type: 'adjust'; item: InventoryDto }
  | { type: 'history'; item: InventoryDto }
  | null;

function CreateEditModal({ item, onClose, lockedFacilityId }: { item?: InventoryDto; onClose: () => void; lockedFacilityId?: string }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm<CreateInventoryDto & UpdateInventoryDto>({
    defaultValues: item
      ? {
          facilityId: item.facilityId,
          productId: item.productId,
          currentStock: item.currentStock,
          reorderLevel: item.reorderLevel,
          batchNumber: item.batchNumber ?? '',
          expiryDate: item.expiryDate ? item.expiryDate.substring(0, 10) : '',
        }
      : lockedFacilityId ? { facilityId: lockedFacilityId } : undefined,
  });

  const { data: facilities } = useQuery({ queryKey: ['facilities-all'], queryFn: () => facilitiesApi.getAll(1, 200), enabled: !lockedFacilityId || !!item });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll(1, 200) });

  const createMut = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Inventory record created'); onClose(); },
    onError: () => toast.error('Failed to create inventory record'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInventoryDto }) => inventoryApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Inventory updated'); onClose(); },
    onError: () => toast.error('Failed to update inventory'),
  });

  const onSubmit = (data: CreateInventoryDto & UpdateInventoryDto) => {
    const cleaned = {
      ...data,
      expiryDate: data.expiryDate || undefined,
      batchNumber: data.batchNumber || undefined,
    };
    if (item) updateMut.mutate({ id: item.id, dto: cleaned });
    else createMut.mutate(cleaned as CreateInventoryDto);
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{item ? 'Edit Inventory' : 'New Inventory Record'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {!item && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facility *</label>
                {lockedFacilityId ? (
                  <select disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed" {...register('facilityId')}>
                    {facilities?.items.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                ) : (
                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('facilityId', { required: true })}>
                    <option value="">Select…</option>
                    {facilities?.items.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('productId', { required: true })}>
                  <option value="">Select…</option>
                  {products?.items.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} ({p.strength})</option>)}
                </select>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
              <input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('currentStock', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
              <input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('reorderLevel', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('batchNumber')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('expiryDate')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustModal({ item, onClose }: { item: InventoryDto; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch } = useForm<AdjustStockDto & { isSet?: boolean }>({
    defaultValues: { adjustmentType: 'Add', quantity: 0, reason: '' },
  });
  const [mode, setMode] = useState<'adjust' | 'set'>('adjust');
  const { register: regSet, handleSubmit: handleSet } = useForm<SetStockDto>({
    defaultValues: { stockOnHand: item.currentStock, reason: '' },
  });

  const adjustMut = useMutation({
    mutationFn: (dto: AdjustStockDto) => inventoryApi.adjustStock(item.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock adjusted'); onClose(); },
    onError: () => toast.error('Failed to adjust stock'),
  });
  const setMut = useMutation({
    mutationFn: (dto: SetStockDto) => inventoryApi.setStock(item.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock updated'); onClose(); },
    onError: () => toast.error('Failed to set stock'),
  });

  const isPending = adjustMut.isPending || setMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Update Stock</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 mx-6 mt-4 rounded-xl">
          {(['adjust', 'set'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {m === 'adjust' ? 'Add / Subtract' : 'Set Physical Count'}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 px-6 pt-3">
          <span className="font-medium">{item.productName}</span> @ {item.facilityName}
          <br />Current stock: <span className="font-semibold">{item.currentStock} {item.productUnit}</span>
        </p>

        {mode === 'adjust' ? (
          <form onSubmit={handleSubmit((d) => adjustMut.mutate(d))} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" {...register('adjustmentType', { required: true })}>
                <option value="Add">Add Stock</option>
                <option value="Subtract">Subtract Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {watch('adjustmentType') === 'Add' ? 'Units to Add *' : 'Units to Remove *'}
              </label>
              <input type="number" min={1} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" {...register('quantity', { required: true, valueAsNumber: true, min: 1 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" {...register('reason', { required: true })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {isPending ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSet((d) => setMut.mutate(d))} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Stock on Hand *</label>
              <input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" {...regSet('stockOnHand', { required: true, valueAsNumber: true, min: 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <input placeholder="Physical count" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" {...regSet('reason')} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {isPending ? 'Saving…' : 'Save Count'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock History Modal
// ─────────────────────────────────────────────────────────────────────────────
const CHANGE_COLOR: Record<string, string> = {
  Add: 'bg-green-100 text-green-700',
  Subtract: 'bg-red-100 text-red-700',
  Set: 'bg-blue-100 text-blue-700',
  Initial: 'bg-gray-100 text-gray-600',
};

function StockHistoryModal({ item, onClose }: { item: InventoryDto; onClose: () => void }) {
  const { data: snapshots = [] } = useQuery<WeeklySnapshotDto[]>({
    queryKey: ['weekly-snapshots', item.id],
    queryFn: () => inventoryApi.getWeeklySnapshots(item.id, 16),
  });
  const { data: ledger = [] } = useQuery<StockLedgerDto[]>({
    queryKey: ['stock-history', item.id],
    queryFn: () => inventoryApi.getStockHistory(item.id, 90),
  });

  // 3-week simple moving average + demand forecast
  const chartData = snapshots.map((s, i, arr) => {
    const window = arr.slice(Math.max(0, i - 2), i + 1).map((x) => x.stockOnHand);
    const avg = Math.round(window.reduce((a, b) => a + b, 0) / window.length);
    return {
      week: new Date(s.weekStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      stock: s.stockOnHand,
      movingAvg: avg,
    };
  });

  // Projected demand: mean weekly change over last available weeks
  const weeklyDeltas = snapshots.slice(1).map((s, i) => snapshots[i].stockOnHand - s.stockOnHand);
  const avgWeeklyDemand = weeklyDeltas.length > 0
    ? Math.round(weeklyDeltas.reduce((a, b) => a + b, 0) / weeklyDeltas.length)
    : 0;
  const projectedNextWeek = snapshots.length > 0
    ? Math.max(0, snapshots[snapshots.length - 1].stockOnHand - avgWeeklyDemand)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">{item.productName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{item.facilityName} · Current: {item.currentStock} {item.productUnit}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Weekly Trend Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Week-on-Week Stock Trend</h3>
              {projectedNextWeek !== null && (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                  Projected next week: ~{projectedNextWeek} {item.productUnit}
                  {avgWeeklyDemand > 0 && ` (avg demand: ${avgWeeklyDemand}/wk)`}
                </span>
              )}
            </div>
            {chartData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl">
                No weekly data yet — data records on each stock update.
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                      formatter={(v, name) => [`${v} ${item.productUnit}`, name === 'movingAvg' ? '3-wk avg' : 'Stock on Hand']}
                    />
                    <Legend formatter={(v) => v === 'movingAvg' ? '3-wk moving avg' : 'Stock on Hand'} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="stock" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} name="stock" />
                    <Line type="monotone" dataKey="movingAvg" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" name="movingAvg" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Change Ledger */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Log (last 90 days)</h3>
            {ledger.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">No changes recorded yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-4 py-2.5 text-center font-semibold">Type</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Before</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Change</th>
                      <th className="px-4 py-2.5 text-right font-semibold">After</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ledger.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-500">
                          {new Date(e.changedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${CHANGE_COLOR[e.changeType] ?? 'bg-gray-100 text-gray-600'}`}>
                            {e.changeType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600">{e.previousStock}</td>
                        <td className={`px-4 py-2.5 text-right font-semibold ${e.changeAmount > 0 ? 'text-green-600' : e.changeAmount < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {e.changeAmount > 0 ? `+${e.changeAmount}` : e.changeAmount}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{e.newStock}</td>
                        <td className="px-4 py-2.5 text-gray-500">{e.reason ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock Graph Tab (week-on-week trends)
// ─────────────────────────────────────────────────────────────────────────────
function StockGraphTab({ facilityId: lockedFacilityId }: { facilityId?: string }) {
  const { data: allInventory } = useQuery({
    queryKey: ['inventory-graph', lockedFacilityId],
    queryFn: () =>
      inventoryApi.getAll(1, 200, lockedFacilityId).then((r) => r.items),
  });

  const items = allInventory ?? [];
  const [selectedId, setSelectedId] = useState<string>('');

  // Bar chart data — current stock vs reorder level, first 30 items
  const barData = items.slice(0, 30).map((inv) => ({
    name: inv.productName.split('(')[0].trim().substring(0, 18),
    stock: inv.currentStock,
    reorder: inv.reorderLevel,
  }));

  // weekly line trend for selected item
  const { data: snapshots = [] } = useQuery<WeeklySnapshotDto[]>({
    queryKey: ['weekly-snapshots', selectedId],
    queryFn: () => inventoryApi.getWeeklySnapshots(selectedId, 16),
    enabled: !!selectedId,
  });

  const lineData = snapshots.map((s) => ({
    week: new Date(s.weekStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    stock: s.stockOnHand,
  }));

  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Bar chart — snapshot of current stock */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Current Stock Levels</h3>
        <p className="text-xs text-gray-400 mb-4">Stock on hand vs reorder level (showing up to 30 items)</p>
        {items.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">No inventory data.</div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  angle={-45}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(v, name) => [v, name === 'stock' ? 'Stock on Hand' : 'Reorder Level']}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => v === 'stock' ? 'Stock on Hand' : 'Reorder Level'}
                />
                <Bar dataKey="stock" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="reorder" fill="#fbbf24" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekly trend for selected item */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Week-on-Week Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Select a product to view its 16-week stock history</p>
          </div>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white min-w-[200px] max-w-sm"
          >
            <option value="">— Select product —</option>
            {items.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.productName} {inv.facilityName ? `(${inv.facilityName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {!selectedId && (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl">
            Select a product above to view its stock trend.
          </div>
        )}

        {selectedId && lineData.length === 0 && (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl">
            No weekly data yet for this item — records update on each stock change.
          </div>
        )}

        {selectedId && lineData.length > 0 && (
          <>
            {selected && (
              <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{selected.productName}</span>
                <span>{selected.facilityName}</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${selected.isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  Current: {selected.currentStock} {selected.productUnit}
                </span>
              </div>
            )}
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                  {selected && (
                    <ReferenceLine y={selected.reorderLevel} stroke="#fbbf24" strokeDasharray="4 3" label={{ value: 'Reorder', fontSize: 10, fill: '#f59e0b', position: 'right' }} />
                  )}
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                    formatter={(v) => [`${v} ${selected?.productUnit ?? ''}`, 'Stock on Hand']}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    name="Stock on Hand"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BulkImportModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkImportRowDto[]>([]);
  const [parseError, setParseError] = useState('');
  const [result, setResult] = useState<BulkImportResultDto | null>(null);

  const importMut = useMutation({
    mutationFn: () => inventoryApi.bulkImport(rows),
    onSuccess: (res) => {
      setResult(res.data ?? null);
      qc.invalidateQueries({ queryKey: ['inventory'] });
      if ((res.data?.created ?? 0) + (res.data?.updated ?? 0) > 0)
        toast.success(`Import complete: ${res.data?.created} created, ${res.data?.updated} updated`);
    },
    onError: () => toast.error('Import failed'),
  });

  const handleFile = (file: File) => {
    setParseError('');
    setRows([]);
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const mapped: BulkImportRowDto[] = parsed.data.map((r) => ({
          facilityCode: r['FacilityCode'] ?? '',
          productName: r['ProductName'] ?? '',
          currentStock: parseInt(r['CurrentStock'] ?? '0', 10),
          reorderLevel: parseInt(r['ReorderLevel'] ?? '0', 10),
          batchNumber: r['BatchNumber'] || undefined,
          expiryDate: r['ExpiryDate'] || undefined,
        }));
        if (mapped.length === 0) { setParseError('No rows found in CSV.'); return; }
        setRows(mapped);
      },
      error: (err) => setParseError(err.message),
    });
  };

  const downloadTemplate = () => {
    const csv = 'FacilityCode,ProductName,CurrentStock,ReorderLevel,BatchNumber,ExpiryDate\nFAC001,Paracetamol 500mg,200,50,BATCH-001,2026-12-31\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'inventory_import_template.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Bulk Import Inventory</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {!result ? (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors"
              >
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Drop a CSV file here or <span className="text-indigo-600 font-medium">browse</span></p>
                <p className="text-xs text-gray-400 mt-1">Columns: FacilityCode, ProductName, CurrentStock, ReorderLevel, BatchNumber (opt), ExpiryDate (opt)</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              {parseError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{parseError}</p>}
              {rows.length > 0 && (
                <div className="bg-green-50 rounded-lg px-4 py-2.5 text-sm text-green-700 font-medium">
                  ✓ {rows.length} rows parsed — ready to import
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                  <Download size={13} /> Download template
                </button>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50">Cancel</button>
                  <button
                    onClick={() => importMut.mutate()}
                    disabled={rows.length === 0 || importMut.isPending}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {importMut.isPending ? 'Importing…' : `Import ${rows.length} rows`}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 rounded-xl py-4"><p className="text-2xl font-bold text-green-600">{result.created}</p><p className="text-xs text-green-700 mt-0.5">Created</p></div>
                <div className="bg-blue-50 rounded-xl py-4"><p className="text-2xl font-bold text-blue-600">{result.updated}</p><p className="text-xs text-blue-700 mt-0.5">Updated</p></div>
                <div className="bg-gray-50 rounded-xl py-4"><p className="text-2xl font-bold text-gray-600">{result.skipped}</p><p className="text-xs text-gray-500 mt-0.5">Skipped</p></div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 rounded-xl p-3 max-h-36 overflow-y-auto">
                  {result.errors.map((e, i) => <p key={i} className="text-xs text-red-700">{e}</p>)}
                </div>
              )}
              <div className="flex justify-end pt-1">
                <button onClick={onClose} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const RISK_COLORS = {
  Critical: 'bg-red-100 text-red-700',
  Warning: 'bg-amber-100 text-amber-700',
  OK: 'bg-green-100 text-green-700',
};

function ForecastModal({ item, onClose }: { item: InventoryDto; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['forecast', item.id],
    queryFn: () => inventoryApi.getForecast(item.id),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="font-semibold text-gray-900">Demand Forecast — {item.productName}</h2>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Loading forecast…</div>
          ) : !data ? (
            <div className="text-center text-gray-400 py-8">No forecast data available.</div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[130px] bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Current Stock</div>
                  <div className="text-2xl font-bold text-gray-900">{data.currentStock}</div>
                  <div className="text-xs text-gray-400">{item.productUnit}</div>
                </div>
                <div className="flex-1 min-w-[130px] bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Avg Weekly Use</div>
                  <div className="text-2xl font-bold text-gray-900">{data.avgWeeklyConsumption.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">{item.productUnit}/week</div>
                </div>
                <div className="flex-1 min-w-[130px] bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Weeks to Stockout</div>
                  <div className="text-2xl font-bold text-gray-900">{data.weeksUntilStockout == null ? '∞' : data.weeksUntilStockout.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">weeks</div>
                </div>
                <div className="flex-1 min-w-[130px] bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">Forecast in 4 Weeks</div>
                  <div className="text-2xl font-bold text-gray-900">{data.forecastedStockIn4Weeks.toFixed(0)}</div>
                  <div className="text-xs text-gray-400">{item.productUnit}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${RISK_COLORS[data.riskLevel]}`}>
                  {data.riskLevel} Risk
                </span>
                <span className="text-sm text-gray-600">
                  Suggested reorder: <strong>{data.suggestedReorderQuantity > 0 ? data.suggestedReorderQuantity : 'Not needed'}</strong> {data.suggestedReorderQuantity > 0 ? item.productUnit : ''}
                </span>
              </div>

              {/* Model badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  data.modelUsed === 'SSA'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {data.modelUsed === 'SSA' ? '🤖 ML · SSA Forecasting' : '📊 Simple Average'}
                </span>
                {data.modelUsed === 'Average' && (
                  <span className="text-xs text-gray-400">Collect ≥8 weekly snapshots to enable ML</span>
                )}
              </div>

              {/* Combined historical + forecast chart */}
              {(() => {
                const historical = [...data.snapshots].reverse().map(s => ({
                  week: new Date(s.weekStartDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                  historicalStock: s.stockOnHand,
                  forecastStock: undefined as number | undefined,
                  lower: undefined as number | undefined,
                  upper: undefined as number | undefined,
                }));

                // Project stock forward using forecasted weekly demand
                const forecastPoints = data.forecastedWeeklyDemand.map((_demand, i) => {
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

                // Join point — last historical into first forecast
                const joinPoint = historical.length > 0 ? {
                  week: historical[historical.length - 1].week,
                  historicalStock: historical[historical.length - 1].historicalStock,
                  forecastStock: historical[historical.length - 1].historicalStock,
                  lower: historical[historical.length - 1].historicalStock,
                  upper: historical[historical.length - 1].historicalStock,
                } : null;

                const chartData = [
                  ...historical,
                  ...(joinPoint ? [joinPoint] : []),
                  ...forecastPoints,
                ];

                if (chartData.length < 2) {
                  return <p className="text-sm text-gray-400 italic">Not enough historical data. Weekly snapshots will populate over time.</p>;
                }

                return (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Stock History &amp; ML Forecast</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v, name) => [
                          v,
                          name === 'historicalStock' ? 'Actual Stock'
                            : name === 'forecastStock' ? 'Forecast'
                            : name === 'upper' ? 'Upper 95% CI'
                            : 'Lower 95% CI',
                        ]} />
                        <Legend formatter={(v) => v === 'historicalStock' ? 'Actual Stock' : v === 'forecastStock' ? 'Forecast (ML)' : undefined} />
                        {/* Confidence band */}
                        <Area type="monotone" dataKey="upper" stroke="none" fill="#a855f7" fillOpacity={0.12} legendType="none" />
                        <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} legendType="none" />
                        {/* Reorder level reference */}
                        <ReferenceLine y={data.reorderLevel} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Reorder', position: 'insideTopLeft', fontSize: 10, fill: '#f97316' }} />
                        <Line type="monotone" dataKey="historicalStock" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
                        <Line type="monotone" dataKey="forecastStock" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 justify-end">
                      <span className="flex items-center gap-1"><span className="inline-block w-6 h-0.5 bg-blue-500"></span> Actual</span>
                      <span className="flex items-center gap-1"><span className="inline-block w-6 h-0.5 bg-purple-500 border-dashed border-t-2 border-purple-500"></span> Forecast</span>
                      <span className="flex items-center gap-1"><span className="inline-block w-4 h-3 bg-purple-200 opacity-60 rounded-sm"></span> 95% CI</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { isAdmin, isFacilityManager, facilityId: authFacilityId, user } = useAuth();
  const canAdjust = isAdmin || ['FacilityManager', 'Pharmacist'].includes(user?.role ?? '');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'all' | 'low' | 'expiry' | 'graph'>('all');
  const [modal, setModal] = useState<ModalState>(null);
  const [showImport, setShowImport] = useState(false);
  const [forecastItem, setForecastItem] = useState<InventoryDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, tab],
    queryFn: () => {
      if (tab === 'low') return inventoryApi.getLowStockAlerts().then(items => ({ items, totalCount: items.length, page: 1, pageSize: items.length, totalPages: 1 }));
      if (tab === 'expiry') return inventoryApi.getNearExpiryAlerts().then(items => ({ items, totalCount: items.length, page: 1, pageSize: items.length, totalPages: 1 }));
      if (tab === 'graph') return Promise.resolve({ items: [], totalCount: 0, page: 1, pageSize: 0, totalPages: 0 });
      return inventoryApi.getAll(page, 20);
    },
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Stock levels and expiry tracking</p>
        </div>
        {(isAdmin || isFacilityManager) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <Upload size={15} /> Import CSV
            </button>
            <button
              onClick={() => setModal({ type: 'create' })}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Add Record
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {([['all', 'All'], ['low', 'Low Stock'], ['expiry', 'Near Expiry'], ['graph', 'Stock Graph']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {key === 'graph' && <BarChart2 size={13} />}
            {label}
          </button>
        ))}
      </div>

      {tab === 'graph' && (
        <StockGraphTab facilityId={isFacilityManager ? (authFacilityId ?? undefined) : undefined} />
      )}

      {tab !== 'graph' && (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-400">No inventory records found.</div>
              ) : items.map((inv) => (
                <div key={inv.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="font-medium text-gray-900 truncate">{inv.productName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{inv.facilityName}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {inv.isLowStock && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle size={9} /> Low
                        </span>
                      )}
                      {inv.isNearExpiry && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Clock size={9} /> Expiring
                        </span>
                      )}
                      {!inv.isLowStock && !inv.isNearExpiry && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">OK</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                    <div>
                      <div className="text-gray-400 text-xs">Stock</div>
                      <div className="font-semibold text-gray-900">{inv.currentStock} <span className="text-gray-400 text-xs font-normal">{inv.productUnit}</span></div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Reorder Level</div>
                      <div className="text-gray-700">{inv.reorderLevel}</div>
                    </div>
                    {inv.batchNumber && (
                      <div>
                        <div className="text-gray-400 text-xs">Batch</div>
                        <div className="font-mono text-xs text-gray-700">{inv.batchNumber}</div>
                      </div>
                    )}
                    {inv.expiryDate && (
                      <div>
                        <div className="text-gray-400 text-xs">Expiry</div>
                        <div className={`text-xs ${inv.isNearExpiry ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
                          {new Date(inv.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                  {canAdjust && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ type: 'adjust', item: inv })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <ArrowUpDown size={13} /> Adjust Stock
                      </button>
                      <button
                        onClick={() => setModal({ type: 'history', item: inv })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <History size={13} /> History
                      </button>
                      <button
                        onClick={() => setModal({ type: 'edit', item: inv })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left font-semibold">Product</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Facility</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Stock</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Reorder Lvl</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Batch</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Expiry</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    {canAdjust && <th className="px-5 py-3.5" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{inv.productName}</td>
                      <td className="px-5 py-3 text-gray-600">{inv.facilityName}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">{inv.currentStock} <span className="text-gray-400 font-normal text-xs">{inv.productUnit}</span></td>
                      <td className="px-5 py-3 text-right text-gray-600">{inv.reorderLevel}</td>
                      <td className="px-5 py-3 text-gray-600 font-mono text-xs">{inv.batchNumber ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">
                        {inv.expiryDate
                          ? (() => {
                              const days = differenceInDays(parseISO(inv.expiryDate), new Date());
                              const cls = days < 0
                                ? 'text-red-700 font-semibold'
                                : days < 30
                                  ? 'text-red-600 font-medium'
                                  : days < 90
                                    ? 'text-amber-600 font-medium'
                                    : 'text-gray-600';
                              return <span className={cls}>{new Date(inv.expiryDate).toLocaleDateString()}{days < 30 && days >= 0 && <span className="ml-1">({days}d)</span>}{days < 0 && <span className="ml-1">(expired)</span>}</span>;
                            })()
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.isLowStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <AlertTriangle size={10} /> Low
                            </span>
                          )}
                          {inv.isNearExpiry && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <Clock size={10} /> Expiring
                            </span>
                          )}
                          {!inv.isLowStock && !inv.isNearExpiry && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">OK</span>
                          )}
                        </div>
                      </td>
                      {canAdjust && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModal({ type: 'adjust', item: inv })}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                              title="Update stock"
                            >
                              <ArrowUpDown size={14} />
                            </button>
                            <button
                              onClick={() => setModal({ type: 'history', item: inv })}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Stock history"
                            >
                              <History size={14} />
                            </button>
                            <button
                              onClick={() => setForecastItem(inv)}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-green-600 transition-colors"
                              title="Demand forecast"
                            >
                              <TrendingUp size={14} />
                            </button>
                            <button
                              onClick={() => setModal({ type: 'edit', item: inv })}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                              title="Edit"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No inventory records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {tab === 'all' && data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Page {data.page} of {data.totalPages} ({data.totalCount} total)</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3.5 py-1.5 border rounded-xl disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors">Prev</button>
                  <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3.5 py-1.5 border rounded-xl disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {modal?.type === 'create' && <CreateEditModal onClose={() => setModal(null)} lockedFacilityId={isFacilityManager ? (authFacilityId ?? undefined) : undefined} />}
      {modal?.type === 'edit' && <CreateEditModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'adjust' && <AdjustModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'history' && <StockHistoryModal item={modal.item} onClose={() => setModal(null)} />}
      {showImport && <BulkImportModal onClose={() => setShowImport(false)} />}
      {forecastItem && <ForecastModal item={forecastItem} onClose={() => setForecastItem(null)} />}
    </div>
  );
}
