import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usersApi } from '@/api/users';
import { facilitiesApi } from '@/api/facilities';
import { STATE_NAMES } from '@/lib/nigeriaStatesLgas';
import type { CreateUserDto, UpdateUserDto, UserDto } from '@/types';
import { Plus, X, UserCheck, UserX, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = ['Admin', 'StateManager', 'Laboratory', 'Pharmacist'];

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  StateManager: 'bg-indigo-100 text-indigo-700',
  Laboratory: 'bg-blue-100 text-blue-700',
  Pharmacist: 'bg-green-100 text-green-700',
};

// ──────────────────────────────────────────────────────────────────────────────
// Create modal
// ──────────────────────────────────────────────────────────────────────────────
function CreateUserModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateUserDto>({
    defaultValues: { role: 'Laboratory' },
  });
  const selectedRole = watch('role');
  const selectedState = watch('state');
  const selectedFacilityId = watch('facilityId');
  const { data: facilities } = useQuery({
    queryKey: ['facilities-all'],
    queryFn: () => facilitiesApi.getAll(1, 200),
  });
  const activeFacilities = facilities?.items.filter((facility) => facility.isActive) ?? [];
  const filteredFacilities = selectedState
    ? activeFacilities.filter((facility) => facility.state === selectedState)
    : activeFacilities;

  useEffect(() => {
    if (selectedRole === 'StateManager' && selectedFacilityId) {
      setValue('facilityId', undefined);
      return;
    }

    if (!selectedFacilityId) return;

    const selectedFacility = activeFacilities.find((facility) => facility.id === selectedFacilityId);
    if (!selectedFacility) {
      setValue('facilityId', undefined);
      return;
    }

    if (selectedState && selectedFacility.state !== selectedState) {
      setValue('facilityId', undefined);
    }
  }, [activeFacilities, selectedFacilityId, selectedRole, selectedState, setValue]);

  const mut = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created'); onClose(); },
    onError: () => toast.error('Failed to create user'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Create User</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form
          onSubmit={handleSubmit((data) => mut.mutate({
            ...data,
            facilityId: data.facilityId || undefined,
            state: data.state || undefined,
          }))}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. john.doe"
              {...register('username', { required: true })}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">Username is required.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="user@example.com"
              {...register('email', { required: true })}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">Email is required.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Min 8 characters"
              {...register('password', { required: true, minLength: 8 })}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register('role', { required: true })}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State {selectedRole === 'StateManager' ? '*' : ''}</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register('state', { required: selectedRole === 'StateManager' })}
            >
              <option value="">Select state...</option>
              {STATE_NAMES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">State is required.</p>}
          </div>

          {selectedRole !== 'StateManager' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...register('facilityId')}
              >
                <option value="">— None —</option>
                {filteredFacilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {mut.isError && (
            <p className="text-sm text-red-600">
              {(mut.error as Error).message ?? 'Failed to create user.'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mut.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mut.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Edit modal
// ──────────────────────────────────────────────────────────────────────────────
function EditUserModal({ user, onClose }: { user: UserDto; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm<UpdateUserDto>({
    defaultValues: {
      role: user.role,
      facilityId: user.facilityId ?? '',
      state: user.state ?? '',
      isActive: user.isActive,
    },
  });
  const selectedRole = watch('role');
  const selectedState = watch('state');
  const selectedFacilityId = watch('facilityId');
  const { data: facilities } = useQuery({
    queryKey: ['facilities-all'],
    queryFn: () => facilitiesApi.getAll(1, 200),
  });
  const activeFacilities = facilities?.items.filter((facility) => facility.isActive) ?? [];
  const filteredFacilities = selectedState
    ? activeFacilities.filter((facility) => facility.state === selectedState)
    : activeFacilities;

  useEffect(() => {
    if (selectedRole === 'StateManager' && selectedFacilityId) {
      setValue('facilityId', undefined);
      return;
    }

    if (!selectedFacilityId) return;

    const selectedFacility = activeFacilities.find((facility) => facility.id === selectedFacilityId);
    if (!selectedFacility) {
      setValue('facilityId', undefined);
      return;
    }

    if (selectedState && selectedFacility.state !== selectedState) {
      setValue('facilityId', undefined);
    }
  }, [activeFacilities, selectedFacilityId, selectedRole, selectedState, setValue]);

  const mut = useMutation({
    mutationFn: (dto: UpdateUserDto) => usersApi.update(user.id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); onClose(); },
    onError: () => toast.error('Failed to update user'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Edit — {user.username}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form
          onSubmit={handleSubmit((data) => {
            mut.mutate({
              ...data,
              facilityId: data.facilityId || undefined,
              state: data.state || undefined,
            });
          })}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register('role')}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State {selectedRole === 'StateManager' ? '*' : ''}</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register('state')}
            >
              <option value="">Select state...</option>
              {STATE_NAMES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {selectedRole !== 'StateManager' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...register('facilityId')}
              >
                <option value="">— None —</option>
                {filteredFacilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
              {...register('isActive')}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>

          {mut.isError && (
            <p className="text-sm text-red-600">Failed to update user.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mut.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mut.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────────────────
export default function Users() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const deleteMut = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (error) => {
      const message = (error as any)?.response?.data?.message ?? 'Failed to delete user';
      toast.error(message);
    },
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (target: UserDto) => {
    if (deleteMut.isPending) return;

    const confirmed = confirm(`Delete user "${target.username}"? This action cannot be undone.`);
    if (!confirmed) return;

    deleteMut.mutate(target.id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Manage system accounts and roles</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
        >
          <Plus size={16} /> New User
        </button>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search by name, email, or role…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-72 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white placeholder-gray-400"
      />

      {/* Card + Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-400">No users found.</div>
              ) : filtered.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-medium text-gray-900">{u.username}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                      {u.role}
                    </span>
                  </div>
                  {u.facilityName && (
                    <div className="text-xs text-gray-500 mb-2">{u.facilityName}</div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {u.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditUser(u)}
                        className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deleteMut.isPending}
                        className="flex items-center gap-1 text-xs text-red-600 font-medium hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left font-semibold">Username</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Email</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Role</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Facility</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Created</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Last Login</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{u.username}</td>
                      <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{u.facilityName ?? '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                          {u.isActive ? <UserCheck size={13} /> : <UserX size={13} />}
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : <span className="text-gray-400">Never</span>}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditUser(u)}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                            title="Edit user"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deleteMut.isPending}
                            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-gray-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  );
}
