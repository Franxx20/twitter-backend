import { NextFunction, Request, Response, Router } from 'express';
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

userRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { limit, skip } = req.query as Record<string, string>;

  try {
    const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) });

    return res.status(HttpStatus.OK).json({ message: 'user Recomendations', users });
  } catch (e) {
    next(e);
  }
});

userRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;

  try {
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
  } catch (e) {
    next(e);
  }
});

userRouter.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId: otherUserId } = req.params;
  const { userId } = res.locals.context;

  try {
    const result = await service.isUserFollowed(userId, otherUserId);
    const user = await service.getUser(otherUserId);

    return res.status(HttpStatus.OK).json({
      isFollowing: result,
      user,
    });
  } catch (e) {
    next(e);
  }
});

// Create endpoint GET api/user/by_username/:username to return a list of UserViewDTO
// of those users whose usernames are included in :username. Add pagination.

userRouter.get('/by_username/:username', async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params;

  try {
    const users = await service.getUsersContainsUsername(username);

    return res.status(HttpStatus.OK).json(users);
  } catch (e) {
    next(e);
  }
});

userRouter.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;

  try {
    await service.deleteUser(userId);

    return res.status(HttpStatus.OK);
  } catch (e) {
    next(e);
  }
});

userRouter.put(
  '/update',
  BodyValidation(UserUpdateInputDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.context;
    const { name, password, visibility, profilePicture } = req.body;

    try {
      let url: string = '';
      const user = await service.updateUser(userId, { name, password, visibility, profilePicture });
      if (user?.profilePicture) {
        const preSignedUrl = await generatePreSignedUrl(user.profilePicture);
        url = preSignedUrl.signedUrl;
      }

      res.status(HttpStatus.OK).send({
        message: 'User updated successfully',
        user,
        url,
      });
    } catch (e) {
      next(e);
    }
  }
);
