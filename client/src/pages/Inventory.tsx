import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { inventoryApi } from '@/api/inventory';
import { facilitiesApi } from '@/api/facilities';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type { AdjustStockDto, CreateInventoryDto, InventoryDto, UpdateInventoryDto } from '@/types';
import { Plus, AlertTriangle, Clock, X, ArrowUpDown, Pencil } from 'lucide-react';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; item: InventoryDto }
  | { type: 'adjust'; item: InventoryDto }
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
    if (item) updateMut.mutate({ id: item.id, dto: data });
    else createMut.mutate(data as CreateInventoryDto);
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
  const { register, handleSubmit } = useForm<AdjustStockDto>({ defaultValues: { adjustmentType: 'Add', quantity: 0, reason: '' } });

  const mut = useMutation({
    mutationFn: (dto: AdjustStockDto) => inventoryApi.adjustStock(item.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{item.productName}</span> @ {item.facilityName}
            <br />Current stock: <span className="font-semibold">{item.currentStock} {item.productUnit}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type *</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('adjustmentType', { required: true })}>
              <option value="Add">Add Stock</option>
              <option value="Subtract">Subtract Stock</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" min={1} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('quantity', { required: true, valueAsNumber: true, min: 1 })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('reason', { required: true })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {mut.isPending ? 'Saving…' : 'Apply'}
            </button>
          </div>
        </form>
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
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        {(isAdmin || isFacilityManager) && (
          <button
            onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} /> Add Record
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([['all', 'All'], ['low', 'Low Stock'], ['expiry', 'Near Expiry']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                      >
                        <ArrowUpDown size={13} /> Adjust Stock
                      </button>
                      <button
                        onClick={() => setModal({ type: 'edit', item: inv })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100"
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
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left">Facility</th>
                    <th className="px-5 py-3 text-right">Stock</th>
                    <th className="px-5 py-3 text-right">Reorder Lvl</th>
                    <th className="px-5 py-3 text-left">Batch</th>
                    <th className="px-5 py-3 text-left">Expiry</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    {canAdjust && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
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
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                              title="Adjust stock"
                            >
                              <ArrowUpDown size={14} />
                            </button>
                            <button
                              onClick={() => setModal({ type: 'edit', item: inv })}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
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
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                  <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal?.type === 'create' && <CreateEditModal onClose={() => setModal(null)} lockedFacilityId={isFacilityManager ? (authFacilityId ?? undefined) : undefined} />}
      {modal?.type === 'edit' && <CreateEditModal item={modal.item} onClose={() => setModal(null)} />}
      {modal?.type === 'adjust' && <AdjustModal item={modal.item} onClose={() => setModal(null)} />}
    </div>
  );
}
