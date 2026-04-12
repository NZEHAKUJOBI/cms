import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { shipmentsApi } from '@/api/shipments';
import { facilitiesApi } from '@/api/facilities';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type { CreateShipmentDto, ShipmentDto, UpdateShipmentStatusDto } from '@/types';
import { Plus, X, ChevronDown, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Prepared: 'bg-blue-100 text-blue-700',
  InTransit: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Received: 'bg-teal-100 text-teal-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const SHIPMENT_STATUSES = ['Prepared', 'InTransit', 'Delivered', 'Received', 'Cancelled'];

function CreateShipmentModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, control } = useForm<CreateShipmentDto>({
    defaultValues: { shipmentItems: [{ productId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'shipmentItems' });

  const { data: facilities } = useQuery({ queryKey: ['facilities-all'], queryFn: () => facilitiesApi.getAll(1, 200) });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll(1, 200) });

  const mut = useMutation({
    mutationFn: shipmentsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="font-semibold text-gray-900">New Shipment</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Facility *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('facilityId', { required: true })}>
                <option value="">Select…</option>
                {facilities?.items.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('expectedDeliveryDate')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" {...register('notes')} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Items *</label>
              <button type="button" onClick={() => append({ productId: '', quantity: 1 })} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                <Plus size={14} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <select className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`shipmentItems.${idx}.productId`, { required: true })}>
                    <option value="">Product…</option>
                    {products?.items.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} ({p.strength})</option>)}
                  </select>
                  <input type="number" min={1} placeholder="Qty" className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`shipmentItems.${idx}.quantity`, { required: true, valueAsNumber: true, min: 1 })} />
                  <input placeholder="Batch" className="w-28 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`shipmentItems.${idx}.batchNumber`)} />
                  <input type="date" className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`shipmentItems.${idx}.expiryDate`)} />
                  <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 disabled:opacity-30">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {mut.isPending ? 'Creating…' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateStatusModal({ shipment, onClose }: { shipment: ShipmentDto; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm<UpdateShipmentStatusDto>({
    defaultValues: { status: shipment.status },
  });
  const mut = useMutation({
    mutationFn: (dto: UpdateShipmentStatusDto) => shipmentsApi.updateStatus(shipment.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Update Status</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 font-medium">{shipment.shipmentNumber}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('status', { required: true })}>
              {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('actualDeliveryDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" {...register('notes')} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {mut.isPending ? 'Saving…' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Shipments() {
  const { isAdmin, isPharmacist } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [statusModal, setStatusModal] = useState<ShipmentDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page, statusFilter],
    queryFn: () => shipmentsApi.getAll(page, 20, undefined, statusFilter || undefined),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        {(isAdmin || isPharmacist) && (
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} /> New Shipment
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none border rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            <option value="">All statuses</option>
            {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Shipment #</th>
                    <th className="px-5 py-3 text-left">Facility</th>
                    <th className="px-5 py-3 text-left">Order #</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-left">Shipped</th>
                    <th className="px-5 py-3 text-left">Expected</th>
                    <th className="px-5 py-3 text-right">Items</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.items.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono font-medium text-blue-600">{s.shipmentNumber}</td>
                      <td className="px-5 py-3 text-gray-700">{s.facilityName}</td>
                      <td className="px-5 py-3 font-mono text-gray-500 text-xs">{s.orderNumber ?? '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{new Date(s.shipmentDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{s.expectedDeliveryDate ? new Date(s.expectedDeliveryDate).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{s.shipmentItems.length}</td>
                      <td className="px-5 py-3 text-right">
                        {s.status !== 'Received' && s.status !== 'Cancelled' && (
                          <button
                            onClick={() => setStatusModal(s)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No shipments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Page {data.page} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                  <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {createModal && <CreateShipmentModal onClose={() => setCreateModal(false)} />}
      {statusModal && <UpdateStatusModal shipment={statusModal} onClose={() => setStatusModal(null)} />}
    </div>
  );
}
