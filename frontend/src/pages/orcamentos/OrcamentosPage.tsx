import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { budgetService } from '../../services/budgetService';
import { partService } from '../../services/partService';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import type { Budget, BudgetStatus, Part } from '../../types';
import { useWebSocket } from '../../hooks/useWebSocket';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<BudgetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  WAITING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  TESTING: 'bg-purple-100 text-purple-800',
  READY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-200 text-green-900',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<BudgetStatus, string> = {
  DRAFT: 'Rascunho',
  WAITING_APPROVAL: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  IN_PROGRESS: 'Em Andamento',
  TESTING: 'Testando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  REJECTED: 'Rejeitado',
};

export const OrcamentosPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { isConnected, joinBudget, onStatusUpdated } = useWebSocket();

  const [formData, setFormData] = useState({
    vehicle_plate: '',
    vehicle_model: '',
    client_name: '',
    client_phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBudget && isConnected) {
      joinBudget(selectedBudget.id);
      
      const handleStatusUpdate = (data: any) => {
        setSelectedBudget((prev) => prev ? { ...prev, status: data.status } : null);
      };

      onStatusUpdated(handleStatusUpdate);
    }
  }, [selectedBudget, isConnected]);

  const loadData = async () => {
    try {
      const allBudgets = await budgetService.getVehicleHistory();
      setBudgets(allBudgets);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBudget = await budgetService.createBudget(formData);
      toast.success('Orçamento criado com sucesso!');
      setBudgets([...budgets, newBudget]);
      setFormData({
        vehicle_plate: '',
        vehicle_model: '',
        client_name: '',
        client_phone: '',
      });
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar orçamento');
    }
  };

  const handleUpdateStatus = async (budgetId: string, status: BudgetStatus) => {
    try {
      const updated = await budgetService.updateBudgetStatus(budgetId, status);
      setBudgets(budgets.map((b) => (b.id === budgetId ? updated : b)));
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(updated);
      }
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const handleApproveBudget = async (budgetId: string) => {
    try {
      const updated = await budgetService.approveBudget(budgetId);
      setBudgets(budgets.map((b) => (b.id === budgetId ? updated : b)));
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(updated);
      }
      toast.success('Orçamento aprovado com sucesso! Estoque abatido!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao aprovar orçamento');
    }
  };

  const formatPrice = (price: number) => (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const statuses = Object.entries(statusLabels).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">💰 Orçamentos</h1>
            <Button variant="primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : '+ Novo Orçamento'}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Criar Novo Orçamento</h2>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <Input
                  label="Placa do Veículo"
                  placeholder="ABC-1234"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                  required
                />
                <Input
                  label="Modelo"
                  placeholder="Ford Fiesta"
                  value={formData.vehicle_model}
                  onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                  required
                />
                <Input
                  label="Nome do Cliente"
                  placeholder="João Silva"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  required
                />
                <Button type="submit" variant="success" className="w-full">
                  Criar Orçamento
                </Button>
              </form>
            </Card>
          )}

          {isLoading ? (
            <Card>
              <p className="text-center">Carregando orçamentos...</p>
            </Card>
          ) : budgets.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500">Nenhum orçamento criado</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <Card
                  key={budget.id}
                  onClick={() => setSelectedBudget(budget)}
                  className={selectedBudget?.id === budget.id ? 'ring-2 ring-blue-500' : 'cursor-pointer'}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{budget.vehicle_model}</h3>
                      <p className="text-sm text-gray-600">{budget.vehicle_plate} • {budget.client_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[budget.status]}`}>
                      {statusLabels[budget.status]}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{formatPrice(budget.total_value)}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(budget.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedBudget ? (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Detalhes do Orçamento</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                <div>
                  <p className="text-gray-600">Veículo</p>
                  <p className="font-semibold">{selectedBudget.vehicle_model}</p>
                </div>
                <div>
                  <p className="text-gray-600">Placa</p>
                  <p className="font-semibold">{selectedBudget.vehicle_plate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cliente</p>
                  <p className="font-semibold">{selectedBudget.client_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Telefone</p>
                  <p className="font-semibold">{selectedBudget.client_phone}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(selectedBudget.total_value)}</p>
                </div>
              </div>

              {selectedBudget.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Itens ({selectedBudget.items.length})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedBudget.items.map((item) => (
                      <div key={item.id} className="text-xs bg-gray-50 p-2 rounded">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-gray-600">{item.quantity}x {formatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Select
                  label="Alterar Status"
                  value={selectedBudget.status}
                  onChange={(e) => handleUpdateStatus(selectedBudget.id, e.target.value as BudgetStatus)}
                  options={statuses}
                />

                {selectedBudget.status === 'DRAFT' && (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={() => handleApproveBudget(selectedBudget.id)}
                  >
                    Enviar para Aprovação
                  </Button>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    const url = `${window.location.origin}/orcamento/${selectedBudget.id}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Link copiado!');
                  }}
                >
                  Copiar Link Público
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-center text-gray-500">Selecione um orçamento para ver detalhes</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
