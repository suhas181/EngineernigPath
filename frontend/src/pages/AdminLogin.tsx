import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, user } = response.data;

      // Authoritative role check: ensure the authenticated user has admin role
      if (user.role !== 'admin') {
        toast.error('Access denied: Account does not have Administrator privileges.');
        setIsLoading(false);
        return;
      }

      loginStore(user, accessToken);
      toast.success(`Admin authenticated. Welcome, ${user.name}!`);
      navigate('/admin');
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed. Please check admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-left">
      <div className="max-w-md w-full p-8 space-y-6 shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl text-slate-100">
        
        {/* Top Icon & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted management console for EngineerPath platform administrators.
            </p>
          </div>
        </div>

        {/* Security Notice Pill */}
        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-center">
          <p className="text-[11px] font-semibold text-amber-300">
            Authorized administrative access only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="admin@engineerpath.com"
                {...register('email')}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-slate-800 transition"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                {...register('password')}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-slate-800 transition"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Sign In as Administrator</span>
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Student Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
