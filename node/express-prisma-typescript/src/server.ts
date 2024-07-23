import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { Constants, NodeEnv, Logger, UnauthorizedException, NotFoundException, ForbiddenException } from '@utils';
import { router } from '@router';
import { ErrorHandling } from '@utils/errors';
import { DisconnectReason, Server, Socket } from 'socket.io';
import jwt, { JwtPayload, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import { MessageServiceImpl } from '@domains/message/service';
import { MessageRepositoryImpl } from '@domains/message/repository';
import { messageService } from '@domains/message/controller';
import { MessageDTO } from '@domains/message/dto';

export const app = express();

// Set up request logger
if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny')); // Log requests only in development environments
}

// Set up request parsers
app.use(express.json()); // Parses application/json payloads request bodies
app.use(express.urlencoded({ extended: false })); // Parse application/x-www-form-urlencoded request bodies
app.use(cookieParser()); // Parse cookies

// Set up CORS
app.use(
  cors({
    origin: Constants.CORS_WHITELIST,
  })
);

/* socket.io
1) el servidor inicia el servidor de socket.io
2) el usuario inicia sesion (desde su respectivo endpoint)
3) el usuario usuario inicia sesion mandando como parametros su su id, token (desde postman)
4) el servidor verifica que dicho usuario verifica haya iniciado sesion haciendo
uso de un middleware y devuelve el socket de conexion
5) el usuario envia un mensaje que ademas posee como parametros su id y el id del usuario con el que se
quiere comunicar (desde postman)
6) el servidor verifica que ya hay creado un room para el id usuario y id usuario 2
si no existe uno el servidor crea un canal para ambos usuarios, guarda el mensaje en la base de datos
y emite el mensajen dentro del room
7) se repite el paso 5) y 6) estableciendo una comunicación entre ambos usuarios
8) el usuario o el servidor finalizar la conexión
9) fin de caso de uso.
*/

app.use('/api', router);

app.use(ErrorHandling);

export const httpServer = app.listen(Constants.PORT, () => {
  Logger.info(`
      ################################################
      🛡️  Server listening on port: ${Constants.PORT} ${Date()} 🛡️ 
      ################################################
    `);
});

export const io = new Server(httpServer, {
  cors: {
    origin: Constants.CORS_WHITELIST,
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.headers.authorization;
  if (token === undefined) {
    next(new UnauthorizedException('MISSING_TOKEN'));
  } else {
    jwt.verify(token, Constants.TOKEN_SECRET, (err: VerifyErrors | null, context) => {
      // TODO need to add context verification
      if (err) next(new UnauthorizedException('INVALID_TOKEN'));
      if (context === undefined) next(new NotFoundException('MISSING MESSAGE DATA'));
      const decodedToken = context as JwtPayload;
      socket.data.userId = decodedToken.userId;
      next();
    });
  }
});

io.on('connection', async (socket): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`socket ${socket.id} connected`);
  socket.broadcast.emit('user connected', {
    userId: socket.data.userId,
    sessionId: socket.id,
  });
  await socket.join(socket.data.userId);

  socket.on('message', async ({ receiverId, content }, next): Promise<void> => {
    const senderId = socket.data.userId;

    if (await messageService.isReceiverFollowed(senderId, receiverId)) {
      await messageService.create({ senderId, receiverId, content });

      io.to(senderId).to(receiverId).emit('message', {
        message: content,
        from: receiverId,
        receiverId,
      });
    } else {
      next(new ForbiddenException());
    }
  });

  // upon disconnection
  socket.on('disconnect', (reason) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
    const senderId = socket.data.userId;
    socket.broadcast.emit('user disconnected', {
      userId: senderId,
    });
  });
});
