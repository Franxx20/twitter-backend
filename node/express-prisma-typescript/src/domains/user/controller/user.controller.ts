import { Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers

import 'express-async-errors';

import { BodyValidation, db } from '@utils';

import { UserRepositoryImpl } from '../repository';
import { UserService, UserServiceImpl } from '../service';
import { UpdateInputDTO } from '@domains/user/dto';
import bcrypt from 'bcrypt';
import { Constants } from '@utils';

export const userRouter = Router();

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db));

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { limit, skip } = req.query as Record<string, string>;

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) });

  return res.status(HttpStatus.OK).json({ message: 'user Recomendations', users });
});

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;

  const user = await service.getUser(userId);

  return res.status(HttpStatus.OK).json(user);
});

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params;

  const user = await service.getUser(otherUserId);

  return res.status(HttpStatus.OK).json(user);
});

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;

  await service.deleteUser(userId);

  return res.status(HttpStatus.OK);
});

userRouter.put('/update', BodyValidation(UpdateInputDTO), async (req: Request, res: Response) => {
  // Obtener el userId del contexto (por ejemplo, desde el token JWT)
  const { userId } = res.locals.context;
  const { name, password, visibility } = req.body;

  console.log(`${userId as string} ${name as string}, ${password as string}, ${visibility as string}`);

  // Hashear la contraseña si está presente
  const hashedPassword = (password as string) ? await bcrypt.hash(password, Constants.SALT_OR_ROUNDS) : undefined;

  await service.updateUser(userId, new UpdateInputDTO(name, hashedPassword, visibility));

  res.status(HttpStatus.OK).send({ message: 'User updated successfully' });
});
