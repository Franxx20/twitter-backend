import { Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers

import 'express-async-errors';

import { BodyValidation, db, generatePreSignedUrl } from '@utils';

import { UserRepositoryImpl } from '../repository';
import { UserService, UserServiceImpl } from '../service';
import { UserUpdateInputDTO } from '@domains/user/dto';

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

  let url: string = '';
  if (user.profilePicture) {
    const preSignedUrl = await generatePreSignedUrl(user.profilePicture);
    url = preSignedUrl.signedUrl;
  }

  return res.status(HttpStatus.OK).json({
    user,
    url,
  });
});

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params;
  const { userId } = res.locals.context;

  const result = await service.isUserFollowed(userId, otherUserId);
  const user = await service.getUser(otherUserId);

  return res.status(HttpStatus.OK).json({
    isFollowing: result,
    user,
  });
});

// Create endpoint GET api/user/by_username/:username to return a list of UserViewDTO
// of those users whose usernames are included in :username. Add pagination.

userRouter.get('/by_username/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  const users = await service.getUsersContainsUsername(username);

  return res.status(HttpStatus.OK).json(users);
});

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;

  await service.deleteUser(userId);

  return res.status(HttpStatus.OK);
});

userRouter.put('/update', BodyValidation(UserUpdateInputDTO), async (req: Request, res: Response) => {
  // Obtener el userId del contexto (por ejemplo, desde el token JWT)
  const { userId } = res.locals.context;
  const { name, password, visibility, profilePicture } = req.body;

  console.log(`${userId as string} ${name as string}, ${password as string}, ${visibility as string}`);

  let url: string = '';
  const user = await service.updateUser(userId, new UserUpdateInputDTO(name, password, visibility, profilePicture));
  if (user?.profilePicture) {
    const preSignedUrl = await generatePreSignedUrl(user.profilePicture);
    url = preSignedUrl.signedUrl;
  }

  res.status(HttpStatus.OK).send({
    message: 'User updated successfully',
    user,
    url,
  });
});
