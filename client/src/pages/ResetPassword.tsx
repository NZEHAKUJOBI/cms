import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{ newPassword: string; confirm: string }>();

  const onSubmit = async ({ newPassword }: { newPassword: string; confirm: string }) => {
    const res = await authApi.resetPassword(token, newPassword);
    if (res.success) {
      toast.success('Password reset successfully — please log in.');
      navigate('/login');
    } else {
      toast.error(res.message ?? 'Invalid or expired reset token.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-red-400 font-medium">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-sm text-indigo-400 underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
              Rx
            </div>
            <div>
              <span className="text-white font-semibold text-lg tracking-tight">PSCMS</span>
              <div className="text-[10px] text-slate-400 -mt-0.5 font-medium">Supply Chain</div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-1">Set new password</h1>
          <p className="text-slate-400 text-sm mb-6">Must be at least 8 characters.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">New password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  {...register('newPassword', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                />
              </div>
              {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Confirm password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  {...register('confirm', { validate: (v) => v === watch('newPassword') || 'Passwords do not match' })}
                />
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
