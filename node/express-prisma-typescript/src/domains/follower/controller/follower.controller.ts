import { NextFunction, Request, Response, Router } from 'express';

import 'express-async-errors';
import { db } from '@utils';
import { FollowerRepositoryImpl } from '../repository';

import { FollowerService, FollowerServiceImpl } from '../service';
import { FollowerDTO } from '../dto';
import HttpStatus from 'http-status';

export const followerRouter: Router = Router();

// here we are applying dependency injection
const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db));

followerRouter.post('/follow/:user_id', async (req: Request, res: Response, next: NextFunction) => {
  // const { userId: followerId } = res.locals.context;
  // const { user_id: followedId } = req.params;
  const followerId: string = res.locals.context.userId;
  const followedId: string = req.params.user_id;

  try {
    const follow: FollowerDTO = await service.createFollower(followerId, followedId);

    console.log(`${followerId} wants to follow ${followedId}`);

    return res.status(HttpStatus.CREATED).json({
      message: `${followerId} Following ${followedId}`,
      follow,
    });
  } catch (e) {
    next(e);
  }
});

followerRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(HttpStatus.OK).json(await service.getAllFollows());
  } catch (e) {
    next(e);
  }
});

followerRouter.post('/unfollow/:user_id', async (req: Request, res: Response, next: NextFunction) => {
  // const { userId: followerId } = res.locals.context;
  // // eslint-disable-next-line @typescript-eslint/naming-convention
  // const { user_id: followedId } = req.params;
  const followerId: string = res.locals.context.userId;
  const followedId: string = req.params.user_id;

  try {
    console.log(`${followerId} wants to unfollow ${followedId}`);

    await service.deleteFollower(followerId, followedId);

    return res.status(HttpStatus.OK).send(`${followerId} unfollowed (deleted)  Follower ${followedId}`);
  } catch (e) {
    next(e);
  }
});
