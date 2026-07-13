import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      toast.error('Google authentication failed. Missing tokens.');
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Temp save tokens to store so api request can use them
        useAuthStore.getState().setTokens(accessToken, refreshToken);

        const response = await api.get('/users/profile');
        const user = response.data.user;

        // Perform full store login
        loginStore(user, accessToken, refreshToken);
        toast.success('Successfully logged in with Google!');

        // Check if onboarding profile is set up
        if (!user.college || !user.graduationYear || !user.preferredCareer) {
          navigate('/profile-setup');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error completing Google login:', error);
        toast.error('Failed to retrieve user profile.');
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [searchParams, navigate, loginStore]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold">Completing login...</h2>
        <p className="text-muted-foreground mt-2">Connecting your account, please wait.</p>
      </div>
    </div>
  );
}

export default OAuthSuccess;
