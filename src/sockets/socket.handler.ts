import { Server, Socket } from 'socket.io';

export interface DriverLocationPayload {
  driverId: string;
  orderId?: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

// In-memory cache of latest driver locations keyed by orderId and driverId
export const latestDriverLocations = new Map<string, DriverLocationPayload>();

export const initSocketGateway = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for orders
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Customer order status listen
    socket.on('subscribe_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
      // If there's already a cached driver location for this order, immediately push it
      if (orderId && latestDriverLocations.has(orderId)) {
        socket.emit('driver_location_update', latestDriverLocations.get(orderId));
      }
    });

    // Driver location stream (Emitted every 5 seconds by the active driver)
    const handleDriverLocation = (data: DriverLocationPayload) => {
      const payload: DriverLocationPayload = {
        ...data,
        timestamp: data.timestamp || Date.now(),
      };

      if (payload.orderId) {
        latestDriverLocations.set(payload.orderId, payload);
        io.to(`order_${payload.orderId}`).emit('driver_location_update', payload);
      }
      if (payload.driverId) {
        latestDriverLocations.set(payload.driverId, payload);
      }

      // Broadcast globally so any tracking screen updates in real time
      io.emit('driver_location_update', payload);
      io.emit('driver_location_admin', payload);
    };

    socket.on('driver_location', handleDriverLocation);
    socket.on('update_driver_location', handleDriverLocation);

    // Request latest driver location
    socket.on('get_driver_location', (query: { orderId?: string; driverId?: string }, callback) => {
      const loc = (query.orderId && latestDriverLocations.get(query.orderId)) ||
                  (query.driverId && latestDriverLocations.get(query.driverId));
      if (typeof callback === 'function') {
        callback(loc || null);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};
