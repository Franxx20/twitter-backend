import { Server } from 'socket.io';
import { Constants, ForbiddenException, isUserFollowed, NotFoundException, UnauthorizedException } from '@utils';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { messageService } from '@domains/message/controller';
import http, { IncomingMessage, ServerResponse } from 'node:http';

export const initSocketServer = (httpServer: http.Server<typeof IncomingMessage, typeof ServerResponse>): void => {
  const io = new Server(httpServer, {
    cors: {
      origin: Constants.CORS_WHITELIST,
      methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {},
  });

  io.use((socket, next): void => {
    const token = socket.handshake.headers.authorization;
    if (token === undefined) {
      next(new UnauthorizedException('MISSING_TOKEN'));
    } else {
      jwt.verify(token, Constants.TOKEN_SECRET, (err: VerifyErrors | null, context) => {
        if (err) next(new UnauthorizedException('INVALID_TOKEN'));
        if (context === undefined) next(new NotFoundException('MISSING MESSAGE DATA'));
        const decodedToken = context as JwtPayload;
        socket.data.userId = decodedToken.userId;
        if (socket.data.userId === null || socket.data.userId === undefined) {
          throw new NotFoundException('MISSING USER ID');
        }
        next();
      });
    }
  });

  io.on('connection', async (socket): Promise<void> => {
    console.log(`socket ${socket.id} connected`);
    socket.broadcast.emit('user connected', {
      userId: socket.data.userId,
      sessionId: socket.id,
    });

    await socket.leave(socket.id);
    await socket.join(socket.data.userId);
    console.log(socket.rooms);

    socket.on('message', async ({ receiverId, content }): Promise<void> => {
      const senderId = socket.data.userId;

      if (await isUserFollowed(senderId, receiverId)) {
        io.to(senderId).to(receiverId).emit('message', {
          message: content,
          from: receiverId,
          receiverId,
        });

        await messageService.create({ senderId, receiverId, content });
      } else {
        throw new ForbiddenException();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`socket ${socket.id} disconnected due to ${reason}`);
      const senderId = socket.data.userId;
      socket.broadcast.emit('user disconnected', {
        userId: senderId,
      });
    });
  });
};
