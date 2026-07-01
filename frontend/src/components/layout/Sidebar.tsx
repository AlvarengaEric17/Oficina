import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  to: string;
  icon: string;
  allowedRoles?: Array<'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN'>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: '📊', allowedRoles: ['MECHANIC', 'ADMIN'] },
  { label: 'Estoque', to: '/estoque', icon: '📦', allowedRoles: ['MECHANIC', 'ADMIN'] },
  { label: 'Orçamentos', to: '/orcamentos', icon: '💰', allowedRoles: ['MECHANIC', 'ADMIN'] },
  { label: 'Financeiro', to: '/financeiro', icon: '💳', allowedRoles: ['ADMIN'] },
  { label: 'Agenda', to: '/agenda', icon: '📅', allowedRoles: ['MECHANIC', 'ADMIN'] },
  { label: 'Super Admin', to: '/super-admin', icon: '🛡️', allowedRoles: ['SUPER_ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const filteredItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role as 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN')
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
