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
  const [parts, setParts] = useState<Part[]>([]);
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

  const [itemForm, setItemForm] = useState({
    part_id: '',
    labor_name: '',
    cost: 0,
    price: 0,
    quantity: 1,
  });

  useEffect(() => {
    loadData();
    loadParts();
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

  const loadParts = async () => {
    try {
      const allParts = await partService.listParts();
      setParts(allParts);
    } catch (error) {
      toast.error('Erro ao carregar peças');
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBudget) {
      toast.error('Selecione um orçamento primeiro');
      return;
    }

    if (!itemForm.part_id && !itemForm.labor_name.trim()) {
      toast.error('Informe uma peça ou descreva o serviço');
      return;
    }

    try {
      await budgetService.addItemToBudget({
        budget_id: selectedBudget.id,
        part_id: itemForm.part_id || undefined,
        labor_name: itemForm.labor_name.trim() || undefined,
        cost: Math.round(Number(itemForm.cost) * 100),
        price: Math.round(Number(itemForm.price) * 100),
        quantity: Math.max(1, Number(itemForm.quantity) || 1),
      });

      const allBudgets = await budgetService.getVehicleHistory();
      setBudgets(allBudgets);
      setSelectedBudget(allBudgets.find((budget) => budget.id === selectedBudget.id) ?? null);
      setItemForm({
        part_id: '',
        labor_name: '',
        cost: 0,
        price: 0,
        quantity: 1,
      });

      toast.success('Item adicionado ao orçamento!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar item');
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

  const handleSendToApproval = async (budgetId: string) => {
    try {
      const updated = await budgetService.updateBudgetStatus(budgetId, 'WAITING_APPROVAL');
      setBudgets(budgets.map((b) => (b.id === budgetId ? updated : b)));
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(updated);
      }
      toast.success('Orçamento enviado para aprovação do cliente!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao enviar para aprovação');
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

              {selectedBudget.status === 'DRAFT' && (
                <div className="mb-6 border rounded-lg p-3 bg-gray-50">
                  <h3 className="font-semibold mb-3">Adicionar Item</h3>
                  <form onSubmit={handleAddItem} className="space-y-3">
                    <Select
                      label="Peça (opcional)"
                      value={itemForm.part_id}
                      onChange={(e) => {
                        const selectedPart = parts.find((part) => part.id === e.target.value);
                        setItemForm({
                          ...itemForm,
                          part_id: e.target.value,
                          cost: selectedPart ? selectedPart.cost_price / 100 : itemForm.cost,
                          price: selectedPart ? selectedPart.sale_price / 100 : itemForm.price,
                        });
                      }}
                      options={parts.map((part) => ({ value: part.id, label: `${part.name} (${formatPrice(part.sale_price)})` }))}
                    />

                    <Input
                      label="Descrição do serviço"
                      placeholder="Ex: Revisão completa do freio"
                      value={itemForm.labor_name}
                      onChange={(e) => setItemForm({ ...itemForm, labor_name: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        label="Custo (R$)"
                        step="0.01"
                        value={itemForm.cost}
                        onChange={(e) => setItemForm({ ...itemForm, cost: Number(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        label="Valor (R$)"
                        step="0.01"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <Input
                      type="number"
                      label="Quantidade"
                      min="1"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) || 1 })}
                    />

                    <Button type="submit" variant="success" className="w-full">
                      Adicionar Item
                    </Button>
                  </form>
                </div>
              )}

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
                    onClick={() => handleSendToApproval(selectedBudget.id)}
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
