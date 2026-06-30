import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class WebSocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

      socket.on('join-budget', (budgetId: string) => {
        socket.join(`budget-${budgetId}`);
        console.log(`[WebSocket] Cliente ${socket.id} entrou na sala budget-${budgetId}`);
      });

      socket.on('leave-budget', (budgetId: string) => {
        socket.leave(`budget-${budgetId}`);
        console.log(`[WebSocket] Cliente ${socket.id} saiu da sala budget-${budgetId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
      });
    });
  }

  public emitStatusUpdated(budgetId: string, data: any) {
    this.io.to(`budget-${budgetId}`).emit('statusUpdated', data);
  }

  public emitStockUpdated(data: any) {
    this.io.emit('stockUpdated', data);
  }

  public emitScheduleUpdated(data: any) {
    this.io.emit('scheduleUpdated', data);
  }

  public getIO() {
    return this.io;
  }
}

let wsManagerInstance: WebSocketManager;

export const initializeWebSocket = (httpServer: HTTPServer) => {
  wsManagerInstance = new WebSocketManager(httpServer);
  return wsManagerInstance;
};

export const getWebSocketManager = () => {
  if (!wsManagerInstance) {
    throw new Error('WebSocket não foi inicializado');
  }
  return wsManagerInstance;
};
