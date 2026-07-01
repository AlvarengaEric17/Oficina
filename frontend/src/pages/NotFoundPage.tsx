import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const dashboardPath =
    user?.role === 'SUPER_ADMIN' ? '/super-admin' : isAuthenticated ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-extrabold text-blue-600 mb-2">404</div>
          <div className="text-6xl mb-4">🔧</div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! A página que você procura não existe ou foi movida. Que tal voltar para um
          lugar familiar?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            ← Voltar
          </button>
          <Link
            to={dashboardPath}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md"
          >
            {dashboardPath === '/' ? 'Ir para a home' : 'Ir para o painel'}
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Dashboard', to: '/dashboard', icon: '📊' },
            { label: 'Estoque', to: '/estoque', icon: '📦' },
            { label: 'Orçamentos', to: '/orcamentos', icon: '💰' },
            { label: 'Agenda', to: '/agenda', icon: '📅' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-lg p-3 transition"
            >
              <div className="text-2xl mb-1">{link.icon}</div>
              <div className="text-gray-700 font-medium">{link.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
