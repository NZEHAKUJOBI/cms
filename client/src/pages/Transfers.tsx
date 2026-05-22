import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { transfersApi } from '@/api/transfers';
import { facilitiesApi } from '@/api/facilities';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type {
  CreateStockTransferDto,
  StockTransferDto,
  UpdateTransferStatusDto,
} from '@/types';
import { Plus, X, ArrowLeftRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-blue-100 text-blue-700',
  InTransit: 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const NEXT_STATUS: Record<string, string[]> = {
  Pending: ['Approved', 'Cancelled'],
  Approved: ['InTransit', 'Cancelled'],
  InTransit: ['Completed', 'Cancelled'],
};

function CreateTransferModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, control } = useForm<CreateStockTransferDto>({
    defaultValues: { items: [{ productId: '', quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const { data: facilities } = useQuery({ queryKey: ['facilities-all'], queryFn: () => facilitiesApi.getAll(1, 200) });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll(1, 200) });

  const mut = useMutation({
    mutationFn: transfersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transfers'] }); toast.success('Transfer created'); onClose(); },
    onError: () => toast.error('Failed to create transfer'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="font-semibold text-gray-900">New Stock Transfer</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Facility *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('sourceFacilityId', { required: true })}>
                <option value="">Select…</option>
                {facilities?.items.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Facility *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('destinationFacilityId', { required: true })}>
                <option value="">Select…</option>
                {facilities?.items.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={2} {...register('notes')} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Items *</label>
              <button type="button" onClick={() => append({ productId: '', quantity: 1 })} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Plus size={14} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <select className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`items.${i}.productId`, { required: true })}>
                    <option value="">Product…</option>
                    {products?.items.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} placeholder="Qty" className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`items.${i}.quantity`, { required: true, valueAsNumber: true, min: 1 })} />
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-600 mt-2"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {mut.isPending ? 'Creating…' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusActions({ transfer }: { transfer: StockTransferDto }) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: ({ status, notes }: UpdateTransferStatusDto) =>
      transfersApi.updateStatus(transfer.id, { status, notes }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
      toast.success(`Transfer ${vars.status}`);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const next = NEXT_STATUS[transfer.status] ?? [];
  if (!next.length) return null;

  return (
    <div className="flex gap-1">
      {next.map(s => (
        <button
          key={s}
          onClick={() => mut.mutate({ status: s as UpdateTransferStatusDto['status'] })}
          disabled={mut.isPending}
          className={`text-xs px-2 py-1 rounded font-medium disabled:opacity-50 ${
            s === 'Cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function Transfers() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const facilityId = user?.role === 'FacilityManager' ? user.facilityId : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['transfers', page, statusFilter, facilityId],
    queryFn: () => transfersApi.getAll(page, 20, facilityId, statusFilter || undefined),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Transfers</h1>
          <p className="text-sm text-gray-500 mt-1">Move stock between facilities</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'FacilityManager') && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus size={16} /> New Transfer
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'Pending', 'Approved', 'InTransit', 'Completed', 'Cancelled'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <ArrowLeftRight size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No transfers found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Transfer #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{t.transferNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{t.sourceFacilityName}</td>
                  <td className="px-4 py-3 text-gray-700">{t.destinationFacilityName}</td>
                  <td className="px-4 py-3 text-gray-500">{t.items.length} item{t.items.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] ?? ''}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(t.transferDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {(user?.role === 'Admin' || user?.role === 'FacilityManager') && (
                      <StatusActions transfer={t} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}

      {showCreate && <CreateTransferModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
