import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { inventoryApi } from '@/api/inventory';
import { facilitiesApi } from '@/api/facilities';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type { AdjustStockDto, CreateInventoryDto, InventoryDto, SetStockDto, StockLedgerDto, UpdateInventoryDto, WeeklySnapshotDto } from '@/types';
import { Plus, AlertTriangle, Clock, X, ArrowUpDown, Pencil, History } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInventoryDto }) => inventoryApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); onClose(); },
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); onClose(); },
  });
  const setMut = useMutation({
    mutationFn: (dto: SetStockDto) => inventoryApi.setStock(item.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); onClose(); },
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

  const chartData = snapshots.map((s) => ({
    week: new Date(s.weekStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    stock: s.stockOnHand,
  }));

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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Week-on-Week Stock Trend</h3>
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
                      formatter={(v) => [`${v} ${item.productUnit}`, 'Stock on Hand']}
                    />
                    <Line
                      type="monotone"
                      dataKey="stock"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
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

export default function Inventory() {
  const { isAdmin, isFacilityManager, facilityId: authFacilityId, user } = useAuth();
  const canAdjust = isAdmin || ['FacilityManager', 'Pharmacist'].includes(user?.role ?? '');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'all' | 'low' | 'expiry'>('all');
  const [modal, setModal] = useState<ModalState>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, tab],
    queryFn: () => {
      if (tab === 'low') return inventoryApi.getLowStockAlerts().then(items => ({ items, totalCount: items.length, page: 1, pageSize: items.length, totalPages: 1 }));
      if (tab === 'expiry') return inventoryApi.getNearExpiryAlerts().then(items => ({ items, totalCount: items.length, page: 1, pageSize: items.length, totalPages: 1 }));
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
          <button
            onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            <Plus size={16} /> Add Record
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['all', 'All'], ['low', 'Low Stock'], ['expiry', 'Near Expiry']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

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
                          ? <span className={inv.isNearExpiry ? 'text-orange-600 font-medium' : ''}>{new Date(inv.expiryDate).toLocaleDateString()}</span>
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

      {modal?.type === 'create' && <CreateEditModal onClose={() => setModal(null)} lockedFacilityId={isFacilityManager ? (authFacilityId ?? undefined) : undefined} />}
      {modal?.type === 'edit' && <CreateEditModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'adjust' && <AdjustModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'history' && <StockHistoryModal item={modal.item} onClose={() => setModal(null)} />}
    </div>
  );
}
