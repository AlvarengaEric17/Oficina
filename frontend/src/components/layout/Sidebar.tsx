import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  to: string;
  icon: string;
  requiredRole?: 'MECHANIC' | 'ADMIN';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: '📊', requiredRole: undefined },
  { label: 'Estoque', to: '/estoque', icon: '📦', requiredRole: undefined },
  { label: 'Orçamentos', to: '/orcamentos', icon: '💰', requiredRole: undefined },
  { label: 'Financeiro', to: '/financeiro', icon: '💳', requiredRole: 'ADMIN' },
  { label: 'Agenda', to: '/agenda', icon: '📅', requiredRole: undefined },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const filteredItems = navItems.filter(
    (item) => !item.requiredRole || item.requiredRole === user?.role
  );

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4">
        {filteredItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors
              ${
                location.pathname === item.to
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
