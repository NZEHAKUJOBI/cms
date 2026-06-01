import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/api/auth';
import { facilitiesApi } from '@/api/facilities';
import { useAuth } from '@/context/AuthContext';
import type { CreateUserDto, UserDto } from '@/types';
import { Plus, X, UserCheck, UserX, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const ALLOWED_ROLES = ['Laboratory', 'Pharmacist'] as const;

const ROLE_COLORS: Record<string, string> = {
  Laboratory: 'bg-blue-100 text-blue-700',
  Pharmacist: 'bg-green-100 text-green-700',
};

function CreateUserModal({ stateName, onClose }: { stateName: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserDto>({
    defaultValues: { role: 'Laboratory' },
  });

  const { data: facilities } = useQuery({
    queryKey: ['facilities-all'],
    queryFn: () => facilitiesApi.getAll(1, 200),
  });

  const stateFacilities = facilities?.items.filter(
    (f) => f.isActive && f.state?.toLowerCase() === stateName.toLowerCase(),
  ) ?? [];

  const mut = useMutation({
    mutationFn: authApi.createMyStateUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-state-users'] }); toast.success('User created'); onClose(); },
    onError: () => toast.error('Failed to create user'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">New User</h2>
            <p className="text-xs text-gray-500 mt-0.5">State: {stateName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="johndoe"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="user@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Minimum 8 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register('role', { required: true })}
            >
              {ALLOWED_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facility *</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register('facilityId', { required: 'Facility is required' })}
            >
              <option value="">— Select facility —</option>
              {stateFacilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {errors.facilityId && <p className="text-red-500 text-xs mt-1">{errors.facilityId.message}</p>}
            {stateFacilities.length === 0 && (
              <p className="text-amber-600 text-xs mt-1">No active facilities found for {stateName}.</p>
            )}
          </div>

          {mut.error && (
            <p className="text-red-600 text-sm">{(mut.error as Error).message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mut.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {mut.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserCard({ user, onToggle, isPending }: { user: UserDto; onToggle: (v: boolean) => void; isPending: boolean }) {
  return (
    <div className="p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{user.username}</div>
        <div className="text-xs text-gray-500 truncate">{user.email}</div>
        {user.facilityName && (
          <div className="text-xs text-gray-400 truncate mt-0.5">{user.facilityName}</div>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
            {user.role}
          </span>
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <button
        disabled={isPending}
        onClick={() => onToggle(!user.isActive)}
        className={`p-2 rounded-xl transition-colors disabled:opacity-50 mt-1 ${user.isActive ? 'hover:bg-red-50 text-gray-400 hover:text-red-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}
        title={user.isActive ? 'Deactivate' : 'Activate'}
      >
        {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
      </button>
    </div>
  );
}

export default function StateUsers() {
  const { state } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['my-state-users'],
    queryFn: authApi.getMyStateUsers,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      authApi.toggleStateUser(id, isActive),
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey: ['my-state-users'] });
      toast.success(isActive ? 'User activated' : 'User deactivated');
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const stateName = state ?? '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">State Users</h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <MapPin size={14} />
            <span>{stateName}</span>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Users</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-emerald-600">{users.filter((u) => u.isActive).length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active</div>
        </div>
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span>No users yet.</span>
            <button onClick={() => setShowCreate(true)} className="text-indigo-600 text-sm hover:underline">Add the first user</button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {users.map((u) => (
                <UserCard key={u.id} user={u} onToggle={(isActive) => toggleMut.mutate({ id: u.id, isActive })} isPending={toggleMut.isPending} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left font-semibold">User</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Email</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Facility</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Role</th>
                    <th className="px-5 py-3.5 text-left font-semibold">Joined</th>
                    <th className="px-5 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{u.username}</td>
                      <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5 text-gray-500">{u.facilityName ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={toggleMut.isPending}
                          onClick={() => toggleMut.mutate({ id: u.id, isActive: !u.isActive })}
                          className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${u.isActive ? 'hover:bg-red-50 text-gray-400 hover:text-red-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showCreate && state && <CreateUserModal stateName={state} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
