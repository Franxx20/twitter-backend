import { Request, Response, Router } from 'express';

import 'express-async-errors';
import { db } from '@utils';
import { FollowerRepositoryImpl } from '../repository';

import { FollowerService, FollowerServiceImpl } from '../service';
import { CreateFollowInputDTO, FollowerDTO } from '../dto';
// import { FollowerDTO } from '../dto';
import HttpStatus from 'http-status';

export const followerRouter: Router = Router();

// here we are applying dependency injection
const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db));

followerRouter.post('/follow/:user_id', async (req: Request, res: Response) => {
  const { userId: followerId } = res.locals.context;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_id: followedId } = req.params;

  // const follow: FollowerDTO = await service.add(followerId, followedId);
  const follow: FollowerDTO = await service.createFollower(followerId, new CreateFollowInputDTO(followedId));

  console.log(`${followerId as string} wants to follow ${followedId}`);

  return res.status(HttpStatus.CREATED).json({
    message: `${followerId as string} Following ${followedId}`,
    follow,
  });
});

followerRouter.post('/unfollow/:user_id', async (req: Request, res: Response) => {
  const { userId: followerId } = res.locals.context;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_id: followedId } = req.params;

  console.log(`${followerId as string} wants to unfollow ${followedId}`);

  await service.deleteFollower(followerId, followedId);

  return res.status(HttpStatus.OK).send(`${followerId as string} unfollowed (deleted)  Follower ${followedId}`);
});
