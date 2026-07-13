import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Your email has been verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. The token may be invalid or expired.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 shadow-2xl glow-primary text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-bold font-heading">Verifying Email</h2>
            <p className="text-muted-foreground">Checking your verification link...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-green-400">Verified!</h2>
            <p className="text-muted-foreground">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-xl transition duration-200 hover:opacity-90 shadow-md"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-destructive-foreground">Verification Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block bg-secondary text-secondary-foreground font-semibold px-6 py-2 rounded-xl transition duration-200 hover:bg-opacity-80"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
