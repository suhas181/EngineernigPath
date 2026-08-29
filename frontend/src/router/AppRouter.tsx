import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

import AuthPromptModal from '../components/auth/AuthPromptModal';

// Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import Signup from '../pages/Signup';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProfileSetup from '../pages/ProfileSetup';
import CompleteProfile from '../pages/CompleteProfile';
import Dashboard from '../pages/Dashboard';
import Roadmap from '../pages/Roadmap';
import Resources from '../pages/Resources';
import Internships from '../pages/Internships';
import ResumeAnalyzer from '../pages/ResumeAnalyzer';
import Planner from '../pages/Planner';
import ProfileSettings from '../pages/ProfileSettings';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';

// Wrapper for routes requiring authentication (available for restricted student / custom routes)
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin tries to access student pages, redirect to Admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Wrapper for protected admin routes
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Wrapper for the admin login route
function AdminLoginRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Wrapper for routes that are for unauthenticated users only (student login, signup, etc.)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (!user?.college || !user?.graduationYear || !user?.preferredCareer) {
      return <Navigate to="/profile-setup" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <>
      <AuthPromptModal />
      <Routes>
        {/* Default Root Route & Landing Page */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Public Student Auth Flows */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Dedicated Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <AdminLoginRoute>
              <AdminLogin />
            </AdminLoginRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Exploration & Direct Access Student Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmaps" element={<Roadmap />} />
        <Route path="/learning-paths" element={<Roadmap />} />
        <Route path="/learning-hub" element={<Resources />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/settings" element={<ProfileSettings />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* Fallback Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppRouter;
