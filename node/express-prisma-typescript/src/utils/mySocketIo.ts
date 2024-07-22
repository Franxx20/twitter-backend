import { io } from '../server';


io.on('connection', (socket) => {
  console.log(`socket ${socket.id} connected`); // send an event to the client
  socket.emit('foo', 'bar');
  socket.on('foobar', () => {
    // an event was received from the client
  }); // upon disconnection
  socket.on('disconnect', (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });
});
