import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const onSubmit = async ({ email }: { email: string }) => {
    const res = await authApi.forgotPassword(email);
    setSubmitted(true);
    // In dev mode the API returns the reset token directly
    if (res.data?.resetToken) setDevToken(res.data.resetToken);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
              Rx
            </div>
            <div>
              <span className="text-white font-semibold text-lg tracking-tight">PSCMS</span>
              <div className="text-[10px] text-slate-400 -mt-0.5 font-medium">Supply Chain</div>
            </div>
          </div>

          {!submitted ? (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Reset password</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...register('email', { required: 'Email is required' })}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3">
              <CheckCircle size={40} className="mx-auto text-green-400" />
              <h2 className="text-lg font-bold text-white">Check your email</h2>
              <p className="text-slate-400 text-sm">If that email exists in our system, you'll receive a reset link shortly.</p>
              {devToken && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3 text-left mt-3">
                  <p className="text-amber-400 text-xs font-semibold mb-1">DEV MODE — Reset Token</p>
                  <p className="text-amber-300 text-xs font-mono break-all">{devToken}</p>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="inline-block mt-2 text-xs text-indigo-400 underline"
                  >
                    → Go to reset page
                  </Link>
                </div>
              )}
            </div>
          )}

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
