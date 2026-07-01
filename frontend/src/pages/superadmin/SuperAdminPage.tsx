import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { companyService } from '../../services/companyService';
import { authService } from '../../services/authService';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

interface Company {
  id: string;
  name: string;
  plan: 'FREE' | 'PRO';
  active: boolean;
  users: { id: string; name: string; email: string; role: string }[];
}

export const SuperAdminPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'FREE' | 'PRO'>('FREE');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companyService.listCompanies();
      setCompanies(data);
    } catch {
      toast.error('Erro ao carregar empresas');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await companyService.createCompany({ name, plan, active });
      setName('');
      setPlan('FREE');
      setActive(true);
      await loadCompanies();
      toast.success('Empresa criada com sucesso');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar empresa');
    }
  };

  const handleToggleActive = async (company: Company) => {
    try {
      await companyService.updateCompany(company.id, { active: !company.active });
      await loadCompanies();
      toast.success('Status da empresa atualizado');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar empresa');
    }
  };

  const handlePlanChange = async (company: Company, newPlan: 'FREE' | 'PRO') => {
    try {
      await companyService.updateCompany(company.id, { plan: newPlan });
      await loadCompanies();
      toast.success('Plano atualizado');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar plano');
    }
  };

  const handleRoleChange = async (company: Company, userId: string, newRole: 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN') => {
    try {
      await authService.updateUser(userId, { role: newRole, company_id: company.id });
      await loadCompanies();
      toast.success('Permissão atualizada');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar permissão');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <h1 className="text-2xl font-bold mb-4">🧑‍💼 Painel do Super Admin</h1>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Nome da Empresa" value={name} onChange={(e) => setName(e.target.value)} required />
            <Select
              label="Plano"
              value={plan}
              onChange={(e) => setPlan(e.target.value as 'FREE' | 'PRO')}
              options={[{ value: 'FREE', label: 'FREE' }, { value: 'PRO', label: 'PRO' }]}
            />
            <div className="flex items-end">
              <Button type="submit" variant="primary" className="w-full">Criar Empresa</Button>
            </div>
          </form>
        </Card>

        <div className="grid gap-4">
          {companies.map((company) => (
            <Card key={company.id}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                  <p className="text-sm text-gray-500">{company.active ? 'Ativa' : 'Inativa'} • {company.plan}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant={company.active ? 'danger' : 'success'} onClick={() => handleToggleActive(company)}>
                    {company.active ? 'Inativar' : 'Ativar'}
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Select
                  label="Plano da Empresa"
                  value={company.plan}
                  onChange={(e) => handlePlanChange(company, e.target.value as 'FREE' | 'PRO')}
                  options={[{ value: 'FREE', label: 'FREE' }, { value: 'PRO', label: 'PRO' }]}
                />
              </div>

              <div className="mt-4">
                <p className="font-semibold mb-2">Usuários</p>
                <ul className="text-sm space-y-3">
                  {company.users.length === 0 ? <li>Nenhum usuário</li> : company.users.map((user) => (
                    <li key={user.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded p-3">
                      <span>{user.name} ({user.email})</span>
                      <Select
                        label="Permissão"
                        value={user.role}
                        onChange={(e) => handleRoleChange(company, user.id, e.target.value as 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN')}
                        options={[
                          { value: 'MECHANIC', label: 'Mecânico' },
                          { value: 'ADMIN', label: 'Administrador' },
                          { value: 'SUPER_ADMIN', label: 'Super Admin' },
                        ]}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Para contratar o plano PRO, entre em contato pelo WhatsApp 14996459936.
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};
