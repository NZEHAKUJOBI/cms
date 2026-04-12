import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { facilitiesApi } from '@/api/facilities';
import { useAuth } from '@/context/AuthContext';
import type { CreateFacilityDto, FacilityDto, UpdateFacilityDto } from '@/types';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

const FACILITY_TYPES = ['Hospital', 'HealthCenter', 'Clinic', 'Dispensary', 'Pharmacy'];

type FormData = CreateFacilityDto & { isActive?: boolean };

function FacilityModal({ facility, onClose }: { facility?: FacilityDto; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: facility
      ? {
          name: facility.name,
          code: facility.code,
          type: facility.type,
          district: facility.district,
          region: facility.region,
          contactPerson: facility.contactPerson,
          phone: facility.phone,
          email: facility.email ?? '',
          isActive: facility.isActive,
        }
      : undefined,
  });

  const createMut = useMutation({
    mutationFn: facilitiesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFacilityDto }) => facilitiesApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); onClose(); },
  });

  const onSubmit = (data: FormData) => {
    if (facility) updateMut.mutate({ id: facility.id, dto: data });
    else createMut.mutate(data);
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{facility ? 'Edit Facility' : 'New Facility'}</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={!!facility}
                {...register('code', { required: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('type', { required: true })}>
                <option value="">Select type…</option>
                {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('district', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('region', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('contactPerson', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('phone', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('email')} />
            </div>
            {facility && (
              <div className="flex items-center gap-2 pt-4">
                <input type="checkbox" id="fIsActive" {...register('isActive')} className="w-4 h-4" />
                <label htmlFor="fIsActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            )}
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

export default function Facilities() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState<'create' | FacilityDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['facilities', page, search],
    queryFn: () => facilitiesApi.getAll(page, 20, search || undefined),
  });

  const deleteMut = useMutation({
    mutationFn: facilitiesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['facilities'] }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        {isAdmin && (
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} /> Add Facility
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search facilities…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Search</button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Code</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">District / Region</th>
                    <th className="px-5 py-3 text-left">Contact</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    {isAdmin && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.items.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{f.name}</td>
                      <td className="px-5 py-3 text-gray-600 font-mono">{f.code}</td>
                      <td className="px-5 py-3 text-gray-600">{f.type}</td>
                      <td className="px-5 py-3 text-gray-600">{f.district}, {f.region}</td>
                      <td className="px-5 py-3 text-gray-600">
                        <div>{f.contactPerson}</div>
                        <div className="text-xs text-gray-400">{f.phone}</div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {f.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setModal(f)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Pencil size={14} /></button>
                            <button
                              onClick={() => { if (confirm(`Deactivate "${f.name}"?`)) deleteMut.mutate(f.id); }}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {data?.items.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No facilities found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
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

      {modal && (
        <FacilityModal
          facility={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
