import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketGateway } from './sockets/socket.handler.js';

const bootstrap = async () => {
  await connectDB();

  const server = http.createServer();
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  });

  initSocketGateway(io);

  const app = createApp(io);
  server.on('request', app);

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Gas Station Backend Server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
    console.log(`📡 Socket.io gateway listening`);
  });
};

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
});