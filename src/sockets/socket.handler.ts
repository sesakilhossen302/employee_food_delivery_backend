import { Server, Socket } from 'socket.io';

export const initSocketGateway = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join room for orders
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Customer order status listen
    socket.on('subscribe_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
    });

    // Driver location stream
    socket.on('driver_location', (data: { driverId: string; lat: number; lng: number; orderId?: string }) => {
      if (data.orderId) {
        io.to(`order_${data.orderId}`).emit('driver_location_update', data);
      }
      io.emit('driver_location_admin', data);
    });

    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });
};