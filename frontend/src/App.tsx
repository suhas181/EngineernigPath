import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import { useAuthStore } from './store/useAuthStore';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

function App() {
  const { accessToken, setUser, logout, isAuthenticated } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && accessToken) {
        try {
          // Verify access token validity and fetch latest profile details
          const response = await api.get('/auth/me');
          if (response.data && response.data.user) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Session initialization failed:', error);
          // If the token is invalid or expired and token refresh also failed, log out
          const stillAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!stillAuthenticated) {
            logout();
          }
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [isAuthenticated, accessToken, setUser, logout]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d111c] text-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <h2 className="text-xl font-semibold tracking-wide">Initializing Session...</h2>
          <p className="text-muted-foreground text-sm">Please wait while we verify your authentication status.</p>
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
