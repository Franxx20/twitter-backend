import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { Constants, db, Logger, NodeEnv } from '@utils';
import { router } from '@router';
import { ErrorHandling } from '@utils/errors';
import * as http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import { UserRepositoryImpl } from '@domains/user/repository';
import { MessageRepositoryImpl } from '@domains/message/repository';
import { SocketIoServer } from '@utils/socketIoServer';

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

app.use('/api', router);

app.use(ErrorHandling);

export const httpServer: http.Server<typeof IncomingMessage, typeof ServerResponse> = app.listen(Constants.PORT, () => {
  Logger.info(`
      ################################################
      🛡️  Server listening on port: ${Constants.PORT} ${Date()} 🛡️ 
      ################################################
    `);
});
// test

export const socketIoServer: SocketIoServer = new SocketIoServer(
  httpServer,
  new MessageRepositoryImpl(db),
  new UserRepositoryImpl(db)
);
socketIoServer.initSocketServer();
