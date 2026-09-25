import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import { useAuthStore } from './store/useAuthStore';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

function App() {
  const { setUser, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt session recovery using the secure HttpOnly cookie
        const refreshResponse = await api.post('/auth/refresh-token');
        if (refreshResponse.data && refreshResponse.data.accessToken) {
          const newAccessToken = refreshResponse.data.accessToken;
          useAuthStore.getState().setAccessToken(newAccessToken);

          // Retrieve authenticated user profile with active access token
          const userResponse = await api.get('/auth/me');
          if (userResponse.data && userResponse.data.user) {
            setUser(userResponse.data.user);
          }
        } else {
          logout();
        }
      } catch {
        // No active session cookie or invalid token -> user remains logged out cleanly
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setUser, logout]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-dark)] text-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
          <h2 className="text-xl font-semibold tracking-wide">Initializing Session...</h2>
          <p className="text-[var(--text-on-dark-muted)] text-sm">Please wait while we verify your authentication status.</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-panel text-white border-white/10',
          style: {
            background: 'rgba(13, 17, 28, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(8px)',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
