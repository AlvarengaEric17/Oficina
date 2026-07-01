import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EstoquePage } from './pages/estoque/EstoquePage';
import { OrcamentosPage } from './pages/orcamentos/OrcamentosPage';
import { BudgetPublicPage } from './pages/orcamentos/BudgetPublicPage';
import { FinanceiroPage } from './pages/financeiro/FinanceiroPage';
import { AgendaPage } from './pages/agenda/AgendaPage';
import { SuperAdminPage } from './pages/superadmin/SuperAdminPage';

function App() {
  const { initAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/orcamento/:id" element={<BudgetPublicPage />} />

        {/* Protected routes */}
        <Route
          path="/"
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
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
