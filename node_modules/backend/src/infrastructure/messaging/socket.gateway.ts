import type { Server, Socket } from 'socket.io';
import { createLogger } from '@/shared/utils/logger';

export class SocketGateway {
  private readonly logger = createLogger('SocketGateway');

  constructor(private readonly io: Server) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.logger.info(`Client connected: ${socket.id}`);

      socket.on('join:order', (orderId: string) => {
        void socket.join(`order:${orderId}`);
      });

      socket.on('join:restaurant', (restaurantId: string) => {
        void socket.join(`restaurant:${restaurantId}`);
      });

      socket.on('rider:location', (data: { orderId: string; lat: number; lng: number }) => {
        this.io.to(`order:${data.orderId}`).emit('rider:location:update', data);
      });

      socket.on('disconnect', () => {
        this.logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitOrderUpdate(orderId: string, data: unknown): void {
    this.io.to(`order:${orderId}`).emit('order:status:update', data);
  }

  emitNewOrder(restaurantId: string, data: unknown): void {
    this.io.to(`restaurant:${restaurantId}`).emit('order:new', data);
  }
}
