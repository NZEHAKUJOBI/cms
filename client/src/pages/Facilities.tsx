import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { facilitiesApi } from '@/api/facilities';
import { useAuth } from '@/context/AuthContext';
import type { CreateFacilityDto, FacilityDto, UpdateFacilityDto } from '@/types';
import { Plus, Pencil, Trash2, Search, X, Map, List } from 'lucide-react';
import { toast } from 'sonner';
import { STATE_NAMES, getLgasForState } from '@/lib/nigeriaStatesLgas';

// Nigeria state approximate coordinates for map placement
const STATE_COORDS: Record<string, [number, number]> = {
  'Abia': [5.4527, 7.5248],
  'Adamawa': [9.3265, 12.3984],
  'Akwa Ibom': [4.9057, 7.8537],
  'Anambra': [6.2209, 6.9370],
  'Bauchi': [10.3158, 9.8442],
  'Bayelsa': [4.7719, 6.0699],
  'Benue': [7.3369, 8.7400],
  'Borno': [11.8333, 13.1500],
  'Cross River': [5.8702, 8.5988],
  'Delta': [5.5320, 5.8987],
  'Ebonyi': [6.2649, 8.0137],
  'Edo': [6.3350, 5.6037],
  'Ekiti': [7.7190, 5.3110],
  'Enugu': [6.4584, 7.5464],
  'FCT': [9.0579, 7.4951],
  'Gombe': [10.2897, 11.1673],
  'Imo': [5.5720, 7.0588],
  'Jigawa': [12.2280, 9.5616],
  'Kaduna': [10.5222, 7.4383],
  'Kano': [12.0022, 8.5919],
  'Katsina': [12.9816, 7.6183],
  'Kebbi': [11.4942, 4.2333],
  'Kogi': [7.8000, 6.7400],
  'Kwara': [8.9669, 4.3874],
  'Lagos': [6.5244, 3.3792],
  'Nasarawa': [8.4966, 8.1994],
  'Niger': [9.9309, 5.5983],
  'Ogun': [6.9980, 3.4737],
  'Ondo': [7.2526, 5.2100],
  'Osun': [7.5629, 4.5200],
  'Oyo': [7.8500, 3.9300],
  'Plateau': [9.2182, 9.5179],
  'Rivers': [4.8396, 6.9113],
  'Sokoto': [13.0059, 5.2476],
  'Taraba': [7.9994, 10.7744],
  'Yobe': [12.0000, 11.5000],
  'Zamfara': [12.1222, 6.2236],
};

function getCoords(state: string, index: number): [number, number] {
  const base = STATE_COORDS[state] ?? [9.082, 8.6753];
  // Jitter to prevent exact overlap
  const jitter = index * 0.05;
  return [base[0] + jitter * Math.sin(index), base[1] + jitter * Math.cos(index)];
}

function FacilityMap({ facilities }: { facilities: FacilityDto[] }) {
  const [MapContainer, setMapContainer] = useState<React.ComponentType<any> | null>(null);
  const [TileLayer, setTileLayer] = useState<React.ComponentType<any> | null>(null);
  const [Marker, setMarker] = useState<React.ComponentType<any> | null>(null);
  const [Popup, setPopup] = useState<React.ComponentType<any> | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any),
    ]).then(([rl, L]) => {
      if (cancelled) return;
      // Fix default icon paths
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setMapContainer(() => rl.MapContainer);
      setTileLayer(() => rl.TileLayer);
      setMarker(() => rl.Marker);
      setPopup(() => rl.Popup);
      setLeafletReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  if (!leafletReady || !MapContainer || !TileLayer || !Marker || !Popup) {
    return <div className="flex items-center justify-center h-96 text-gray-400 text-sm">Loading map…</div>;
  }

  const stateGroups: Record<string, FacilityDto[]> = {};
  for (const f of facilities) {
    const key = f.state ?? 'Unknown';
    (stateGroups[key] = stateGroups[key] ?? []).push(f);
  }

  const points: { facility: FacilityDto; coords: [number, number] }[] = [];
  for (const [state, facs] of Object.entries(stateGroups)) {
    facs.forEach((f, i) => {
      points.push({ facility: f, coords: getCoords(state, i) });
    });
  }

  return (
    <MapContainer center={[9.082, 8.6753]} zoom={6} style={{ height: '520px', width: '100%', borderRadius: '0 0 1rem 1rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map(({ facility, coords }) => (
        <Marker key={facility.id} position={coords}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{facility.name}</p>
              <p className="text-gray-500">{facility.type}</p>
              <p className="text-gray-500">{facility.district}, {facility.state}</p>
              {facility.phone && <p className="text-gray-500">{facility.phone}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

const FACILITY_TYPES = ['Hospital', 'HealthCenter', 'Clinic', 'Dispensary', 'Pharmacy'];

type FormData = CreateFacilityDto & { isActive?: boolean };

function FacilityModal({ facility, onClose }: { facility?: FacilityDto; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: facility
      ? {
          name: facility.name,
          code: facility.code,
          type: facility.type,
          district: facility.district,
          state: facility.state,
          contactPerson: facility.contactPerson,
          phone: facility.phone,
          email: facility.email ?? '',
          isActive: facility.isActive,
        }
      : undefined,
  });

  const selectedState = watch('state');
  const lgas = getLgasForState(selectedState ?? '');

  const createMut = useMutation({
    mutationFn: facilitiesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); toast.success('Facility created'); onClose(); },
    onError: () => toast.error('Failed to create facility'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFacilityDto }) => facilitiesApi.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); toast.success('Facility updated'); onClose(); },
    onError: () => toast.error('Failed to update facility'),
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
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('state', { required: true })}>
                <option value="">Select state…</option>
                {STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" {...register('district', { required: true })} disabled={!selectedState}>
                <option value="">Select LGA…</option>
                {lgas.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">Required</p>}
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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { data, isLoading } = useQuery({
    queryKey: ['facilities', page, search],
    queryFn: () => facilitiesApi.getAll(page, 20, search || undefined),
  });

  const deleteMut = useMutation({
    mutationFn: facilitiesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['facilities'] }); toast.success('Facility deleted'); },
    onError: () => toast.error('Failed to delete facility'),
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Facilities</h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Manage healthcare facilities</p>
        </div>
        <div className="flex items-center gap-2">
          {/* List / Map toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 text-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Map size={14} /> Map
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => setModal('create')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Add Facility
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search facilities…"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">Search</button>
      </form>

      {viewMode === 'map' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <FacilityMap facilities={data?.items ?? []} />
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {!data?.items.length ? (
                <div className="px-5 py-10 text-center text-gray-400">No facilities found.</div>
              ) : data.items.map((f) => (
                <div key={f.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{f.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{f.type} · <span className="font-mono">{f.code}</span></div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{f.district}, {f.state}</div>
                  <div className="text-sm text-gray-600">
                    {f.contactPerson} · <span className="text-gray-400">{f.phone}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setModal(f)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Deactivate "${f.name}"?`)) deleteMut.mutate(f.id); }}
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
                    <th className="px-5 py-3.5 text-left font-semibold">Code</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Type</th>
                    <th className="px-5 py-3.5 text-left font-semibold">LGA / State</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Contact</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    {isAdmin && <th className="px-5 py-3.5" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.items.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{f.name}</td>
                      <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{f.code}</td>
                      <td className="px-5 py-3.5 text-gray-600">{f.type}</td>
                      <td className="px-5 py-3.5 text-gray-600">{f.district}, {f.state}</td>
                      <td className="px-5 py-3.5 text-gray-600">
                        <div>{f.contactPerson}</div>
                        <div className="text-xs text-gray-400">{f.phone}</div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {f.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setModal(f)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={14} /></button>
                            <button
                              onClick={() => { if (confirm(`Deactivate "${f.name}"?`)) deleteMut.mutate(f.id); }}
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
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No facilities found.</td></tr>
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
      )}  {/* end list/map conditional */}

      {modal && (
        <FacilityModal
          facility={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
