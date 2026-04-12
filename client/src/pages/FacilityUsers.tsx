import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { authApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import type { CreateUserDto, UserDto } from '@/types';
import { Plus, X, UserCheck, UserX, Building2 } from 'lucide-react';

const ALLOWED_ROLES = ['Pharmacist'] as const;

function CreateUserModal({ facilityName, onClose }: { facilityName: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserDto>({
    defaultValues: { role: 'FacilityUser' },
  });

  const mut = useMutation({
    mutationFn: authApi.createMyFacilityUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-facility-users'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">New User</h2>
            <p className="text-xs text-gray-500 mt-0.5">Facility: {facilityName}</p>
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
              placeholder="Minimum 6 characters"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
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

const ROLE_COLORS: Record<string, string> = {
  FacilityUser: 'bg-sky-100 text-sky-700',
  Pharmacist: 'bg-purple-100 text-purple-700',
  FacilityManager: 'bg-blue-100 text-blue-700',
};

export default function FacilityUsers() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['my-facility-users'],
    queryFn: authApi.getMyFacilityUsers,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      authApi.toggleFacilityUser(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-facility-users'] }),
  });

  const facilityName = users[0]?.facilityName ?? user?.username ?? '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Facility Users</h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Building2 size={14} />
            <span>{facilityName}</span>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Users</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.isActive).length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active</div>
        </div>
      </div>

      {/* User list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span>No users yet.</span>
            <button onClick={() => setShowCreate(true)} className="text-blue-600 text-sm hover:underline">Add the first user</button>
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
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Joined</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{u.username}</td>
                      <td className="px-5 py-3 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          disabled={toggleMut.isPending}
                          onClick={() => toggleMut.mutate({ id: u.id, isActive: !u.isActive })}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${u.isActive ? 'hover:bg-red-50 text-red-400 hover:text-red-600' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}
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

      {showCreate && <CreateUserModal facilityName={facilityName} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function UserCard({ user, onToggle, isPending }: { user: UserDto; onToggle: (v: boolean) => void; isPending: boolean }) {
  return (
    <div className="p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{user.username}</div>
        <div className="text-xs text-gray-500 truncate">{user.email}</div>
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
        className={`mt-1 p-2 rounded-lg border transition-colors disabled:opacity-50 ${user.isActive ? 'border-red-200 text-red-400 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'}`}
        title={user.isActive ? 'Deactivate' : 'Activate'}
      >
        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
      </button>
    </div>
  );
}
