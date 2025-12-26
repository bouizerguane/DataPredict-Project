import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { WorkflowStepper } from './components/WorkflowStepper';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { DatasetImport } from './components/DatasetImport';
import { DataExploration } from './components/DataExploration';
import { DataPreprocessing } from './components/DataPreprocessing';
import { TaskSelection } from './components/TaskSelection';
import { VariableSelection } from './components/VariableSelection';
import { ModelRecommendation } from './components/ModelRecommendation';

import { Training } from './components/Training';
import { Results } from './components/Results';
import { Comparison } from './components/Comparison';
import { Visualization } from './components/Visualization';
import { Export } from './components/Export';
import { History } from './components/History';
import { WorkflowProvider } from './context/WorkflowContext';

// Wrapper for protected routes
function ProtectedLayout({ onLogout }: { onLogout: () => void }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto">
          <WorkflowStepper />
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function GlobalAuthCheck() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const publicPaths = ['/login', '/register'];
      const isPublic = publicPaths.includes(location.pathname);

      if (!token) {
        if (!isPublic) {
          navigate('/login');
        }
        return;
      }

      try {
        const response = await fetch(`/auth/verify?token=${token}`);
        if (response.ok) {
          const isValid = await response.text();
          if (isValid === 'true' || isValid === 'Token is valid') {
            if (isPublic) {
              navigate('/dashboard');
            }
          } else {
            throw new Error('Invalid token');
          }
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        if (!isPublic) {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  return null;
}

export default function App() {
  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await fetch(`/auth/logout?token=${token}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('token');
    toast.success("Déconnexion réussie");
    // Force a simpler approach for now to reset state since we are outside router context here mostly
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <GlobalAuthCheck />
      <WorkflowProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedLayout onLogout={handleLogout} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/import" element={<DatasetImport />} />
            <Route path="/exploration" element={<DataExploration />} />
            <Route path="/preprocessing" element={<DataPreprocessing />} />
            <Route path="/task-selection" element={<TaskSelection />} />
            <Route path="/variable-selection" element={<VariableSelection />} />
            <Route path="/model-recommendation" element={<ModelRecommendation />} />
            <Route path="/comparison" element={<Comparison />} />

            <Route path="/training" element={<Training />} />
            <Route path="/results" element={<Results />} />
            <Route path="/visualization" element={<Visualization />} />
            <Route path="/export" element={<Export />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </WorkflowProvider>
    </BrowserRouter>
  );
}
