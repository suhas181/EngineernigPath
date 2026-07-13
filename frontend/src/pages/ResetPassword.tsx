import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Reset token is missing in URL.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Password reset successful!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 shadow-2xl glow-primary text-center">
        {!isSuccess ? (
          <>
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Choose New Password
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your new password below. Make sure it satisfies the security criteria.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Password */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition duration-200"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <span className="text-xs text-destructive">{errors.password.message}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition duration-200"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl transition duration-200 hover:opacity-90 shadow-lg glow-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-green-400">Password Updated</h2>
              <p className="text-muted-foreground text-sm">
                Your password has been changed successfully. You can now use your new password to sign in.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl transition duration-200 hover:opacity-90 shadow-md"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        )}

        {!isSuccess && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="hover:underline font-semibold inline-flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel</span>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
