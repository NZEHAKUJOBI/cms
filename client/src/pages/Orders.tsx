import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { ordersApi } from '@/api/orders';
import { facilitiesApi } from '@/api/facilities';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type { ApproveOrderDto, CreateOrderDto, OrderDto, RejectOrderDto } from '@/types';
import { Plus, X, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-blue-100 text-blue-700',
  Rejected: 'bg-red-100 text-red-700',
  Dispatched: 'bg-purple-100 text-purple-700',
  PartiallyFulfilled: 'bg-orange-100 text-orange-700',
  Fulfilled: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

function CreateOrderModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateOrderDto>({
    defaultValues: { orderItems: [{ productId: '', requestedQuantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'orderItems' });

  const { data: facilities } = useQuery({ queryKey: ['facilities-all'], queryFn: () => facilitiesApi.getAll(1, 200) });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll(1, 200) });

  const mut = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order placed'); onClose(); },
    onError: () => toast.error('Failed to place order'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="font-semibold text-gray-900">New Order</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('facilityId', { required: true })}>
                <option value="">Select…</option>
                {facilities?.items.filter(f => f.isActive).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              {errors.facilityId && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required By</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('requiredDate')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" {...register('notes')} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Order Items *</label>
              <button type="button" onClick={() => append({ productId: '', requestedQuantity: 1 })} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                <Plus size={14} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <select className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`orderItems.${idx}.productId`, { required: true })}>
                    <option value="">Product…</option>
                    {products?.items.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} ({p.strength})</option>)}
                  </select>
                  <input type="number" min={1} placeholder="Qty" className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register(`orderItems.${idx}.requestedQuantity`, { required: true, valueAsNumber: true, min: 1 })} />
                  <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 disabled:opacity-30">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {mut.isPending ? 'Submitting…' : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: OrderDto; onClose: () => void }) {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [approveMode, setApproveMode] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);

  const { register: rApprove, handleSubmit: hsApprove } = useForm<ApproveOrderDto>({
    defaultValues: { items: order.orderItems.map(i => ({ orderItemId: i.id, approvedQuantity: i.requestedQuantity })) },
  });
  const { register: rReject, handleSubmit: hsReject } = useForm<RejectOrderDto>();

  const approveMut = useMutation({
    mutationFn: (dto: ApproveOrderDto) => ordersApi.approve(order.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order approved'); onClose(); },
    onError: () => toast.error('Failed to approve order'),
  });
  const rejectMut = useMutation({
    mutationFn: (dto: RejectOrderDto) => ordersApi.reject(order.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order rejected'); onClose(); },
    onError: () => toast.error('Failed to reject order'),
  });
  const cancelMut = useMutation({
    mutationFn: () => ordersApi.cancel(order.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order cancelled'); onClose(); },
    onError: () => toast.error('Failed to cancel order'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">Order {order.orderNumber}</h2>
            <p className="text-xs text-gray-500">{order.facilityName} · {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-500'}`}>{order.status}</span>
            <button onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Requested</th>
                <th className="px-3 py-2 text-right">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.orderItems.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">{item.productName} <span className="text-gray-400 text-xs">({item.productUnit})</span></td>
                  <td className="px-3 py-2 text-right">{item.requestedQuantity}</td>
                  <td className="px-3 py-2 text-right">
                    {approveMode
                      ? <input type="number" min={0} className="w-20 border rounded px-2 py-1 text-sm" {...rApprove(`items.${idx}.approvedQuantity`, { valueAsNumber: true })} />
                      : (item.approvedQuantity ?? '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {order.notes && <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {order.notes}</p>}
          {order.rejectionReason && <p className="text-sm text-red-600"><span className="font-medium">Rejection reason:</span> {order.rejectionReason}</p>}

          {rejectMode && (
            <form onSubmit={hsReject((d) => rejectMut.mutate(d))} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rejection Reason *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...rReject('reason', { required: true })} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setRejectMode(false)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={rejectMut.isPending} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Confirm Reject</button>
              </div>
            </form>
          )}
        </div>

        {isAdmin && order.status === 'Pending' && !rejectMode && (
          <div className="px-6 py-4 border-t flex-shrink-0 flex gap-3">
            {approveMode ? (
              <form onSubmit={hsApprove((d) => approveMut.mutate(d))} className="flex gap-3 w-full">
                <button type="button" onClick={() => setApproveMode(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={approveMut.isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {approveMut.isPending ? 'Approving…' : 'Confirm Approve'}
                </button>
              </form>
            ) : (
              <>
                <button onClick={() => setApproveMode(true)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                <button onClick={() => setRejectMode(true)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
              </>
            )}
          </div>
        )}
        {order.status === 'Pending' && (
          <div className="px-6 py-3 border-t flex-shrink-0">
            <button
              onClick={() => { if (confirm('Cancel this order?')) cancelMut.mutate(); }}
              disabled={cancelMut.isPending}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const ORDER_STATUSES = ['Pending', 'Approved', 'Rejected', 'Dispatched', 'PartiallyFulfilled', 'Fulfilled', 'Cancelled'];

export default function Orders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [createModal, setCreateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, statusFilter],
    queryFn: () => ordersApi.getAll(page, 20, undefined, statusFilter || undefined),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Manage purchase orders and approvals</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm bg-white"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {!data?.items.length ? (
                <div className="px-5 py-10 text-center text-gray-400">No orders found.</div>
              ) : data.items.map((o) => (
                <div
                  key={o.id}
                  className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => setSelectedOrder(o)}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <div className="font-mono font-medium text-indigo-600">{o.orderNumber}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{o.facilityName}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(o.orderDate).toLocaleDateString()}</span>
                    <span>{o.orderItems.length} item{o.orderItems.length !== 1 ? 's' : ''} →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left font-semibold">Order #</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Facility</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Date</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Items</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.items.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => setSelectedOrder(o)}>
                      <td className="px-5 py-3.5 font-mono font-medium text-indigo-600">{o.orderNumber}</td>
                      <td className="px-5 py-3.5 text-gray-700">{o.facilityName}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right text-gray-600">{o.orderItems.length}</td>
                      <td className="px-5 py-3.5 text-right text-indigo-500 text-xs font-medium">View →</td>
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Page {data.page} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3.5 py-1.5 border rounded-xl disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors">Prev</button>
                  <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3.5 py-1.5 border rounded-xl disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {createModal && <CreateOrderModal onClose={() => setCreateModal(false)} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}
