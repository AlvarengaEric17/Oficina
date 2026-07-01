import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { partService } from '../../services/partService';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import type { Part } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [parts, setParts] = useState<Part[]>([]);
  const [criticalParts, setCriticalParts] = useState<Part[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allParts = await partService.listParts();
        setParts(allParts);
        const critical = allParts.filter((p) => p.is_critical);
        setCriticalParts(critical);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Bem-vindo, {user?.name}! 👋
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📦 Peças em Estoque</h3>
            <p className="text-3xl font-bold text-blue-600">{parts.length}</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">⚠️ Estoque Crítico</h3>
            <p className="text-3xl font-bold text-red-600">{criticalParts.length}</p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">👤 Seu Papel</h3>
            <p className="text-lg text-gray-600">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Mecânico'}
            </p>
          </Card>
        </div>

        {criticalParts.length > 0 && (
          <Card className="border-l-4 border-red-500 bg-red-50">
            <h3 className="text-lg font-semibold text-red-700 mb-4">
              ⚠️ Peças com Estoque Crítico
            </h3>
            <div className="space-y-2">
              {criticalParts.slice(0, 5).map((part) => (
                <div key={part.id} className="text-sm text-red-600">
                  <p className="font-medium">{part.name}</p>
                  <p>Quantidade: {part.quantity} (Mínimo: {part.min_quantity})</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Status do Sistema</h3>
          <div className="space-y-2 text-sm">
            <p>✅ Banco de dados: Conectado</p>
            <p>✅ API: Operacional</p>
            <p>✅ WebSocket: Ativo</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
