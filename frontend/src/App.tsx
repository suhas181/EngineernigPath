import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';

function App() {
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
