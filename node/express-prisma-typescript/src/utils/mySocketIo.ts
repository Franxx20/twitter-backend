import { io } from '@server';
import { Logger } from '@utils/logger';

// io.use((socket, next) => {
//   const token = socket.handshake.headers.authorization;
//   // Logger.info(token);
//   console.log(token)
//   next();
// });
//
// io.on('connection', (socket) => {
//   console.log(`socket ${socket.id} connected`); // send an event to the client
//
//   socket.on('message', async ({ senderId, receiverId, message }) => {
//     const roomId = [senderId as string, receiverId as string].sort().join('-');
//     await socket.join(roomId);
//
//     io.to(roomId).emit('message', { message });
//     // an event was received from the client
//   }); // upon disconnection
//
//   socket.on('disconnect', (reason) => {
//     console.log(`socket ${socket.id} disconnected due to ${reason}`);
//   });
// });
