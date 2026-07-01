import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { router } from './routes';
import { initializeWebSocket } from './websocket/manager';
import { prismaClient } from './prisma/client';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';

const app = express();
const httpServer = createServer(app);

// Trust proxy quando atrás de um load balancer (Render, Railway, Fly, etc.)
const trustProxy = env.TRUST_PROXY === 'true' ? true : env.TRUST_PROXY === 'false' ? false : Number(env.TRUST_PROXY);
app.set('trust proxy', trustProxy);

// CORS configurado com origens permitidas
const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: mobile, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limit global
app.use(apiRateLimiter);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logger (apenas em dev)
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize WebSocket
initializeWebSocket(httpServer);

// Routes
app.use(router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Global error handler (deve ser o último middleware)
app.use(errorHandler);

const startServer = async () => {
  try {
    // Test database connection
    await prismaClient.$queryRaw`SELECT 1`;
    logger.info('Conectado ao PostgreSQL com sucesso', { service: 'database' });

    httpServer.listen(env.PORT, () => {
      logger.info(`Servidor rodando na porta ${env.PORT}`, {
        env: env.NODE_ENV,
        cors: allowedOrigins,
      });
      logger.info('WebSocket habilitado', { service: 'websocket' });
    });
  } catch (error) {
    logger.error('Erro ao conectar ao banco de dados', { error });
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Sinal ${signal} recebido, encerrando servidor...`);
  httpServer.close();
  await prismaClient.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
