import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { productsApi } from '@/api/products';
import { useAuth } from '@/context/AuthContext';
import type { CreateProductDto, ProductDto, UpdateProductDto } from '@/types';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';

type FormData = CreateProductDto & { isActive?: boolean };

function ProductModal({
  product,
  onClose,
}: {
  product?: ProductDto;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: product
      ? {
          name: product.name,
          genericName: product.genericName,
          category: product.category,
          dosageForm: product.dosageForm,
          strength: product.strength,
          unit: product.unit,
          minimumStockLevel: product.minimumStockLevel,
          description: product.description ?? '',
          isActive: product.isActive,
        }
      : undefined,
  });

  const createMut = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product created'); onClose(); },
    onError: () => toast.error('Failed to create product'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) => productsApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product updated'); onClose(); },
    onError: () => toast.error('Failed to update product'),
  });

  const onSubmit = (data: FormData) => {
    if (product) {
      updateMut.mutate({ id: product.id, dto: data });
    } else {
      createMut.mutate(data);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('name', { required: true })} />
              {errors.name && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('genericName', { required: true })} />
              {errors.genericName && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('category', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Tablet, Syrup…" {...register('dosageForm', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Strength *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="500mg" {...register('strength', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Tabs, Bottles…" {...register('unit', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level *</label>
              <input type="number" min={0} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('minimumStockLevel', { required: true, valueAsNumber: true })} />
            </div>
            {product && (
              <div className="flex items-center gap-2 pt-4">
                <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" {...register('description')} />
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

export default function Products() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState<'create' | ProductDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => productsApi.getAll(page, 20, search || undefined),
  });

  const deleteMut = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Manage pharmaceutical products</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">Search</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {!data?.items.length ? (
                <div className="px-5 py-10 text-center text-gray-400">No products found.</div>
              ) : data.items.map((p) => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.genericName}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">{p.category}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">{p.dosageForm} {p.strength}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">{p.unit}</span>
                    <span className="px-2 py-0.5 bg-indigo-50 rounded-md text-indigo-600">Min: {p.minimumStockLevel}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModal(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Deactivate "${p.name}"?`)) deleteMut.mutate(p.id); }}
                        className="flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-medium border border-red-200 text-red-600 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 size={12} />
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
                    <th className="px-5 py-3.5 text-left font-semibold">Name</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Generic</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Form / Strength</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Unit</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Min Stock</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    {isAdmin && <th className="px-5 py-3.5" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.items.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{p.name}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.genericName}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.category}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.dosageForm} {p.strength}</td>
                      <td className="px-5 py-3.5 text-gray-600">{p.unit}</td>
                      <td className="px-5 py-3.5 text-right text-gray-600">{p.minimumStockLevel}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setModal(p)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => { if (confirm(`Deactivate "${p.name}"?`)) deleteMut.mutate(p.id); }}
                              className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
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

      {modal && (
        <ProductModal
          product={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
