import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { getClientIp } from '../utils/getClientIp';

const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
};

const authKey = (req: Request) => `login:${getClientIp(req)}`;
const registerKey = (req: Request) => `register:${getClientIp(req)}`;
const budgetKey = (req: Request) => `budget-public:${getClientIp(req)}`;
const apiKey = (req: Request) => `api:${getClientIp(req)}`;

/**
 * Rate limiter para rota de login
 * 5 tentativas a cada 15 minutos por IP
 */
export const loginRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: authKey,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

/**
 * Rate limiter para criação de usuário
 * 3 cadastros por hora por IP
 */
export const registerRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: registerKey,
  message: { error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' },
});

/**
 * Rate limiter para aprovação/visualização pública de orçamento
 * 10 requisições a cada 15 minutos por IP (proteção contra abuso)
 */
export const publicBudgetRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: budgetKey,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

/**
 * Rate limiter global para API
 * 200 requests a cada 15 minutos por IP
 * Não conta requisições que já possuem limiter próprio
 */
export const apiRateLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: apiKey,
  skip: (req) => {
    const p = req.path;
    return (
      p === '/session' ||
      p === '/users' ||
      p.startsWith('/budget/approve') ||
      p.startsWith('/budget/share')
    );
  },
  message: { error: 'Limite de requisições atingido. Tente novamente mais tarde.' },
});
