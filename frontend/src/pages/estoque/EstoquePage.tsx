import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { partService } from '../../services/partService';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { Part } from '../../types';

export const EstoquePage: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    cost_price: 0,
    sale_price: 0,
    quantity: 0,
    min_quantity: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      const allParts = await partService.listParts();
      setParts(allParts);
    } catch (error) {
      toast.error('Erro ao carregar peças');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Nome é obrigatório';
    if (!formData.sku) errors.sku = 'SKU é obrigatório';
    if (formData.sale_price < 0) errors.sale_price = 'Preço não pode ser negativo';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await partService.createPart(formData);
      toast.success('Peça criada com sucesso!');
      setFormData({
        name: '',
        sku: '',
        cost_price: 0,
        sale_price: 0,
        quantity: 0,
        min_quantity: 0,
      });
      setShowForm(false);
      loadParts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar peça');
    }
  };

  const formatPrice = (price: number) => (price / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📦 Estoque de Peças</h1>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nova Peça'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Cadastrar Nova Peça</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome da Peça"
                placeholder="Ex: Bateria"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={formErrors.name}
              />

              <Input
                label="SKU"
                placeholder="Ex: BAT-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                error={formErrors.sku}
              />

              <Input
                type="number"
                label="Preço de Custo (R$)"
                placeholder="0.00"
                step="0.01"
                value={formData.cost_price / 100}
                onChange={(e) => setFormData({ ...formData, cost_price: Math.round(parseFloat(e.target.value) * 100) })}
              />

              <Input
                type="number"
                label="Preço de Venda (R$)"
                placeholder="0.00"
                step="0.01"
                value={formData.sale_price / 100}
                onChange={(e) => setFormData({ ...formData, sale_price: Math.round(parseFloat(e.target.value) * 100) })}
                error={formErrors.sale_price}
              />

              <Input
                type="number"
                label="Quantidade"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />

              <Input
                type="number"
                label="Quantidade Mínima"
                placeholder="0"
                value={formData.min_quantity}
                onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
              />

              <Button type="submit" variant="success" className="md:col-span-2">
                Cadastrar Peça
              </Button>
            </form>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <p className="text-center text-gray-500">Carregando peças...</p>
          </Card>
        ) : parts.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">Nenhuma peça cadastrada ainda</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parts.map((part) => (
              <Card key={part.id} className={part.is_critical ? 'border-l-4 border-red-500' : ''}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{part.name}</h3>
                    <p className="text-sm text-gray-500">SKU: {part.sku}</p>
                  </div>
                  {part.is_critical && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Crítico</span>}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>💰 Venda: <strong>{formatPrice(part.sale_price)}</strong></p>
                  <p>📊 Estoque: <strong>{part.quantity}</strong> (Mín: {part.min_quantity})</p>
                  <p>📈 Margem: <strong>{(((part.sale_price - part.cost_price) / part.sale_price) * 100).toFixed(1)}%</strong></p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
