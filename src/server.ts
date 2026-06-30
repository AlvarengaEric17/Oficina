import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { router } from './routes';
import { initializeWebSocket } from './websocket/manager';
import { prismaClient } from './prisma/client';

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize WebSocket
initializeWebSocket(httpServer);

// Routes
app.use(router);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Error]', err);

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await prismaClient.$queryRaw`SELECT 1`;
    console.log('[Database] Conectado ao PostgreSQL com sucesso');

    httpServer.listen(PORT, () => {
      console.log(`[Server] Servidor rodando na porta ${PORT}`);
      console.log(`[Server] WebSocket habilitado`);
    });
  } catch (error) {
    console.error('[Database] Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Encerrando servidor...');
  httpServer.close();
  await prismaClient.$disconnect();
  process.exit(0);
});

startServer();
