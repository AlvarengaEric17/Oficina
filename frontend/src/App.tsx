import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { HomePage } from './pages/home/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EstoquePage } from './pages/estoque/EstoquePage';
import { OrcamentosPage } from './pages/orcamentos/OrcamentosPage';
import { BudgetPublicPage } from './pages/orcamentos/BudgetPublicPage';
import { FinanceiroPage } from './pages/financeiro/FinanceiroPage';
import { AgendaPage } from './pages/agenda/AgendaPage';
import { SuperAdminPage } from './pages/superadmin/SuperAdminPage';

function App() {
  const { initAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.5rem',
            background: '#1f2937',
            color: '#fff',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { borderLeft: '4px solid #10b981' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { borderLeft: '4px solid #ef4444' },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'SUPER_ADMIN' ? (
                <Navigate to="/super-admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <HomePage />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orcamento/:id" element={<BudgetPublicPage />} />
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estoque"
          element={
            <ProtectedRoute>
              <EstoquePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orcamentos"
          element={
            <ProtectedRoute>
              <OrcamentosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/financeiro"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <FinanceiroPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agenda"
          element={
            <ProtectedRoute>
              <AgendaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <SuperAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
