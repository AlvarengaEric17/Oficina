import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { financialService } from '../../services/financialService';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import type { CashFlow } from '../../types';

export const FinanceiroPage: React.FC = () => {
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTaxCalc, setShowTaxCalc] = useState(false);

  const [transactionData, setTransactionData] = useState({
    description: '',
    type: 'INPUT' as 'INPUT' | 'OUTPUT',
    value: 0,
    payment_method: '',
  });

  const [taxCalcData, setTaxCalcData] = useState({
    amount: 0,
    installments: 1,
  });

  const [taxResult, setTaxResult] = useState<any>(null);

  useEffect(() => {
    loadCashFlow();
  }, []);

  const loadCashFlow = async () => {
    try {
      const data = await financialService.getCashFlow();
      setCashFlow(data);
    } catch (error) {
      toast.error('Erro ao carregar fluxo de caixa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financialService.createManualTransaction({
        ...transactionData,
        value: Math.round(transactionData.value * 100),
      });
      toast.success('Transação criada com sucesso!');
      setTransactionData({
        description: '',
        type: 'INPUT',
        value: 0,
        payment_method: '',
      });
      setShowTransactionForm(false);
      loadCashFlow();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar transação');
    }
  };

  const handleCalculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await financialService.calculateTax(
        Math.round(taxCalcData.amount * 100),
        taxCalcData.installments
      );
      setTaxResult(result);
    } catch (error: any) {
      toast.error('Erro ao calcular taxa');
    }
  };

  const formatPrice = (price: number) => (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const transactionTypes = [
    { value: 'INPUT', label: 'Entrada' },
    { value: 'OUTPUT', label: 'Saída' },
  ];

  const installmentOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}x`,
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">💳 Setor Financeiro</h1>

        {!isLoading && cashFlow && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">📥 Entradas</h3>
              <p className="text-3xl font-bold text-green-600">{formatPrice(cashFlow.totals.totalInput)}</p>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">📤 Saídas</h3>
              <p className="text-3xl font-bold text-red-600">{formatPrice(cashFlow.totals.totalOutput)}</p>
            </Card>

            <Card className={cashFlow.totals.balance >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}>
              <h3 className="text-sm font-medium text-gray-600 mb-2">⚖️ Saldo</h3>
              <p className={`text-3xl font-bold ${cashFlow.totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(cashFlow.totals.balance)}
              </p>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Histórico de Transações</h2>
              <Button variant="primary" onClick={() => setShowTransactionForm(!showTransactionForm)}>
                {showTransactionForm ? 'Cancelar' : '+ Nova Transação'}
              </Button>
            </div>

            {showTransactionForm && (
              <Card className="mb-6">
                <form onSubmit={handleCreateTransaction} className="space-y-4">
                  <Input
                    label="Descrição"
                    placeholder="Descrição da transação"
                    value={transactionData.description}
                    onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                    required
                  />

                  <Select
                    label="Tipo"
                    value={transactionData.type}
                    onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value as 'INPUT' | 'OUTPUT' })}
                    options={transactionTypes}
                  />

                  <Input
                    type="number"
                    label="Valor (R$)"
                    placeholder="0.00"
                    step="0.01"
                    value={transactionData.value}
                    onChange={(e) => setTransactionData({ ...transactionData, value: parseFloat(e.target.value) })}
                    required
                  />

                  <Input
                    label="Método de Pagamento (Opcional)"
                    placeholder="Dinheiro, Cartão, etc"
                    value={transactionData.payment_method}
                    onChange={(e) => setTransactionData({ ...transactionData, payment_method: e.target.value })}
                  />

                  <Button type="submit" variant="success" className="w-full">
                    Criar Transação
                  </Button>
                </form>
              </Card>
            )}

            {isLoading ? (
              <Card>
                <p className="text-center">Carregando transações...</p>
              </Card>
            ) : cashFlow && cashFlow.transactions.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500">Nenhuma transação registrada</p>
              </Card>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cashFlow?.transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.budget?.vehicle_plate && `Orçamento: ${transaction.budget.vehicle_plate}`}</p>
                      </div>
                      <p className={`text-lg font-bold ${transaction.type === 'INPUT' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'INPUT' ? '+' : '-'} {formatPrice(transaction.value)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold mb-4">💰 Simulador de Taxa</h2>

              {!showTaxCalc ? (
                <Button variant="primary" className="w-full" onClick={() => setShowTaxCalc(true)}>
                  Calcular Taxa
                </Button>
              ) : (
                <form onSubmit={handleCalculateTax} className="space-y-4">
                  <Input
                    type="number"
                    label="Valor (R$)"
                    placeholder="0.00"
                    step="0.01"
                    value={taxCalcData.amount}
                    onChange={(e) => setTaxCalcData({ ...taxCalcData, amount: parseFloat(e.target.value) })}
                    required
                  />

                  <Select
                    label="Parcelas"
                    value={taxCalcData.installments}
                    onChange={(e) => setTaxCalcData({ ...taxCalcData, installments: parseInt(e.target.value) })}
                    options={installmentOptions}
                  />

                  <Button type="submit" variant="success" className="w-full">
                    Simular
                  </Button>
                </form>
              )}

              {taxResult && (
                <div className="mt-6 pt-6 border-t space-y-2">
                  <p className="text-sm text-gray-600">Resultado da Simulação:</p>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm"><strong>Valor Original:</strong> {formatPrice(taxResult.originalAmount)}</p>
                    <p className="text-sm"><strong>Taxa:</strong> {taxResult.taxPercentage}%</p>
                    <p className="text-sm"><strong>Juros:</strong> {formatPrice(taxResult.taxAmount)}</p>
                    <div className="border-t pt-2 mt-2">
                      <p className="text-lg font-bold text-blue-600">{taxResult.details.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
