import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api, API_URL } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Loader2, UserPlus, ArrowRight } from 'lucide-react';

const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
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

type SignupFormValues = z.infer<typeof signupSchema>;

export function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success(response.data.message || 'Registration successful! Check email to verify.');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 shadow-2xl glow-primary">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Create Account
          </h2>
          <p className="text-muted-foreground text-sm">
            Join EngineerPath and start building your career path.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Rahul Kumar"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition duration-200"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                placeholder="you@college.edu"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition duration-200"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-destructive">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
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
            className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl transition duration-200 hover:opacity-90 shadow-lg glow-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed pt-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <UserPlus className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-white/10" />
          <span className="text-xs text-muted-foreground px-3 uppercase tracking-wider font-semibold">
            Or continue with
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3.5 rounded-xl transition duration-200 flex items-center justify-center space-x-2.5"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path
                d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.29c1.92,-1.78 3.03,-4.4 3.03,-7.4C21.65,11.83 21.54,11.41 21.35,11.1z"
                fill="#4285F4"
              />
              <path
                d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.07l-3.29,-2.6c-0.91,0.61 -2.08,0.97 -3.35,0.97 -2.58,0 -4.76,-1.74 -5.54,-4.07H2.12v2.7C3.59,17.8 7.55,20.5 12,20.5z"
                fill="#34A853"
              />
              <path
                d="M6.46,12.73c-0.2,-0.61 -0.31,-1.26 -0.31,-1.93s0.11,-1.32 0.31,-1.93V6.2H2.12c-0.78,1.55 -1.22,3.31 -1.22,5.2s0.44,3.65 1.22,5.2L6.46,12.73z"
                fill="#FBBC05"
              />
              <path
                d="M12,5.7c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,3.17 14.3,2.5 12,2.5 7.55,2.5 3.59,5.2 2.12,7.7l4.34,3.37c0.78,-2.33 2.96,-4.07 5.54,-4.07z"
                fill="#EA4335"
              />
            </g>
          </svg>
          <span>Sign up with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:underline font-semibold inline-flex items-center space-x-1"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
