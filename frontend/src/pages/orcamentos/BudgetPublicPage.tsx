import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { budgetService } from '../../services/budgetService';
import { financialService } from '../../services/financialService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import type { Budget, TaxCalculation } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BudgetPublicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [taxResult, setTaxResult] = useState<TaxCalculation | null>(null);

  useEffect(() => {
    loadBudget();
  }, [id]);

  const loadBudget = async () => {
    if (!id) {
      toast.error('ID do orçamento não fornecido');
      return;
    }

    try {
      const data = await budgetService.getBudgetPublic(id);
      setBudget(data);
    } catch (error) {
      toast.error('Orçamento não encontrado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBudget = async () => {
    if (!budget) return;

    setIsApproving(true);
    try {
      await budgetService.approveBudget(budget.id);
      toast.success('Orçamento aprovado com sucesso! A ordem de serviço foi criada.');
      setBudget({ ...budget, status: 'IN_PROGRESS' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao aprovar orçamento');
    } finally {
      setIsApproving(false);
    }
  };

  const handleCalculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget) return;

    try {
      const result = await financialService.calculateTax(budget.total_value, installments);
      setTaxResult(result);
    } catch (error) {
      toast.error('Erro ao calcular taxa');
    }
  };

  const formatPrice = (price: number) => (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const installmentOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}x`,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-center">Carregando orçamento...</p>
        </Card>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-center text-red-600">Orçamento não encontrado</p>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    WAITING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    TESTING: 'bg-purple-100 text-purple-800',
    READY: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-200 text-green-900',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho',
    WAITING_APPROVAL: 'Aguardando Sua Aprovação',
    APPROVED: 'Aprovado',
    IN_PROGRESS: 'Em Andamento',
    TESTING: 'Testando',
    READY: 'Pronto',
    DELIVERED: 'Entregue',
    REJECTED: 'Rejeitado',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔧 Seu Orçamento</h1>
            <p className="text-gray-600">Oficina Mecânica</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Veículo</p>
              <p className="text-xl font-bold text-gray-900">{budget.vehicle_model}</p>
              <p className="text-lg text-gray-700">{budget.vehicle_plate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="text-xl font-bold text-gray-900">{budget.client_name}</p>
              <p className="text-lg text-gray-700">{budget.client_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Criado em</p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(budget.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColors[budget.status]}`}>
                {statusLabels[budget.status]}
              </span>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Itens do Orçamento</h2>

          {budget.items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum item adicionado ainda</p>
          ) : (
            <div className="space-y-3">
              {budget.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-600">{item.quantity}x {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div className="border-t-2 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-gray-900">Total</p>
                  <p className="text-3xl font-bold text-green-600">{formatPrice(budget.total_value)}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {budget.status === 'WAITING_APPROVAL' && (
          <Card className="mb-6 border-l-4 border-yellow-500 bg-yellow-50">
            <h2 className="text-xl font-bold text-yellow-900 mb-4">⚠️ Aguardando Sua Aprovação</h2>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Calcular Valor com Taxa de Cartão</h3>
              <form onSubmit={handleCalculateTax} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Parcelas</label>
                  <Select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    options={installmentOptions}
                  />
                </div>
                <Button type="submit" variant="primary">
                  Calcular Taxa
                </Button>
              </form>

              {taxResult && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900"><strong>Taxa:</strong> {taxResult.taxPercentage}%</p>
                  <p className="text-sm text-blue-900"><strong>Valor + Taxa:</strong> {formatPrice(taxResult.totalAmount)}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">{taxResult.details.message}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                variant="success"
                size="lg"
                isLoading={isApproving}
                onClick={handleApproveBudget}
                className="flex-1"
              >
                ✅ Aprovar Orçamento
              </Button>
            </div>
          </Card>
        )}

        {budget.status === 'APPROVED' && (
          <Card className="border-l-4 border-green-500 bg-green-50">
            <p className="text-center text-green-800 font-semibold">
              ✅ Seu orçamento foi aprovado! Começaremos o trabalho em breve.
            </p>
          </Card>
        )}

        {budget.status === 'IN_PROGRESS' && (
          <Card className="border-l-4 border-blue-500 bg-blue-50">
            <p className="text-center text-blue-800 font-semibold">
              🔧 Sua ordem de serviço foi criada e o veículo está em andamento!
            </p>
          </Card>
        )}

        {budget.status === 'READY' && (
          <Card className="border-l-4 border-indigo-500 bg-indigo-50">
            <p className="text-center text-indigo-800 font-semibold">
              ✨ Seu veículo está pronto! Venha buscar!
            </p>
          </Card>
        )}

        {budget.status === 'DELIVERED' && (
          <Card className="border-l-4 border-green-600 bg-green-100">
            <p className="text-center text-green-900 font-semibold">
              🎉 Trabalho concluído! Obrigado pela confiança!
            </p>
          </Card>
        )}

        {budget.status === 'REJECTED' && (
          <Card className="border-l-4 border-red-500 bg-red-50">
            <p className="text-center text-red-800 font-semibold">
              ❌ Este orçamento foi rejeitado. Entre em contato conosco para mais informações.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
