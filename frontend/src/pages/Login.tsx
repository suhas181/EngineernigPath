import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, user } = response.data;

      loginStore(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (!user.college || !user.graduationYear || !user.preferredCareer) {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-6 text-left relative transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="mosaic-card max-w-md w-full p-8 space-y-6 shadow-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="font-heading font-extrabold text-2xl text-[var(--ink-900)]">
              Engineer<span className="text-teal-600 dark:text-teal-400">Path</span>
            </span>
          </Link>
          <p className="text-xs text-[var(--ink-muted)]">
            Sign in to access your workspace dashboard.
          </p>
        </div>

        {/* Student Login Badge */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-semibold px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-full border border-teal-100 dark:border-teal-900/40">
            Student Login
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="name@university.edu"
                {...register('email')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--ink-900)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--ink-900)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mosaic-btn-primary !py-3 !text-sm flex items-center justify-center space-x-2 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In to Student Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-[var(--ink-muted)]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-teal-700 dark:text-teal-400 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
