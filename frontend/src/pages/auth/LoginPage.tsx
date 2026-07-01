import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isRegistering) {
      if (!name) setErrors((prev) => ({ ...prev, name: 'Nome é obrigatório' }));
      if (!email) setErrors((prev) => ({ ...prev, email: 'Email é obrigatório' }));
      if (!password) setErrors((prev) => ({ ...prev, password: 'Senha é obrigatória' }));
      if (!confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: 'Confirme a senha' }));
      if (password && confirmPassword && password !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'As senhas não conferem' }));
      }

      if (!name || !email || !password || !confirmPassword || password !== confirmPassword) {
        return;
      }

      setIsLoading(true);
      try {
        await authService.createUser({ name, email, password });
        toast.success('Conta criada com sucesso! Aguarde o super admin liberar as permissões.');
        setIsRegistering(false);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        const message = error.response?.data?.error || 'Erro ao criar conta';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email) setErrors((prev) => ({ ...prev, email: 'Email é obrigatório' }));
    if (!password) setErrors((prev) => ({ ...prev, password: 'Senha é obrigatória' }));

    if (!email || !password) return;

    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setToken(result.token);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">🔧 Oficina Mecânica</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />
          )}

          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Input
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          {isRegistering && (
            <Input
              type="password"
              label="Confirmar senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {isRegistering ? 'Criar conta' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegistering((prev) => !prev)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isRegistering ? 'Já tenho conta' : 'Criar conta'}
          </button>
        </div>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Para contratar o plano PRO, entre em contato pelo WhatsApp<br />
          <span className="font-semibold">14996459936</span>
        </p>

        <p className="text-center text-gray-600 mt-2 text-sm">
          Credenciais de demonstração:<br />
          Email: admin@oficina.com<br />
          Senha: 123456
        </p>
      </div>
    </div>
  );
};
