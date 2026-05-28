import type { Server, Socket } from 'socket.io';
import { createLogger } from '@/shared/utils/logger';
import { SocketOrderEventPublisher } from './socket-order-event.publisher';

interface RiderLocationData {
  orderId: string;
  lat: number;
  lng: number;
}

export class SocketGateway {
  private readonly logger = createLogger('SocketGateway');
  readonly orderEventPublisher: SocketOrderEventPublisher;

  constructor(private readonly io: Server) {
    this.orderEventPublisher = new SocketOrderEventPublisher(io);
    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.logger.info(`Client connected: ${socket.id}`);

      socket.on('join:customer', (customerId: string) => {
        if (!this.isValidId(customerId)) return;
        void socket.join(`customer:${customerId}`);
      });

      socket.on('join:restaurant', (restaurantId: string) => {
        if (!this.isValidId(restaurantId)) return;
        void socket.join(`restaurant:${restaurantId}`);
      });

      socket.on('join:rider', (riderId: string) => {
        if (!this.isValidId(riderId)) return;
        void socket.join(`rider:${riderId}`);
      });

      socket.on('join:order', (orderId: string) => {
        if (!this.isValidId(orderId)) return;
        void socket.join(`order:${orderId}`);
      });

      socket.on('rider:location', (data: RiderLocationData) => {
        if (!this.isValidId(data.orderId)) return;
        this.io.to(`order:${data.orderId}`).emit('rider:location:update', data);
      });

      socket.on('disconnect', (reason: string) => {
        this.logger.info(`Client disconnected: ${socket.id} (${reason})`);
      });
    });
  }

  emitOrderUpdate(orderId: string, data: unknown): void {
    this.io.to(`order:${orderId}`).emit('order:status:update', data);
  }

  emitNewOrder(restaurantId: string, data: unknown): void {
    this.io.to(`restaurant:${restaurantId}`).emit('order:new', data);
  }

  private isValidId(id: unknown): id is string {
    return typeof id === 'string' && id.length > 0 && id.length < 128;
  }
}