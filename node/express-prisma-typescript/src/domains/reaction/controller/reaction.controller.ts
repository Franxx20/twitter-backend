import { NextFunction, Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors';

import { BodyValidation, db } from '@utils';

import { ReactionRepositoryImpl } from '../repository';
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service';
import { CreateReactionDTO, DeleteReactionDTO, ReactionActionDTO } from '@domains/reaction/dto';
import { UserRepositoryImpl } from '@domains/user/repository';

export const reactionRouter = Router();

// Use dependency injection
const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db), new UserRepositoryImpl(db));

// Add the ability to react to a post (like and retweet)
// both should be stored in the same table and
// using the endpoints POST api/reaction/:post_id and DELETE api/reaction/:post_id.

reactionRouter.get('/likes', async (req: Request, res: Response, next: NextFunction) => {
  const { authorId } = req.query;
  const { userId } = res.locals.context;

  try {
    const likes = await service.getAllLikesFromUser(userId, authorId as string);

    return res.status(HttpStatus.OK).json(likes);
  } catch (e) {
    next(e);
  }
});

reactionRouter.get('/retweets', async (req: Request, res: Response, next: NextFunction) => {
  // const { userId: authorId } = req.params;
  const { authorId } = req.query;
  const { userId } = res.locals.context;

  try {
    const retweets = await service.getAllRetweetsFromUser(userId, authorId as string);

    return res.status(HttpStatus.OK).json(retweets);
  } catch (e) {
    next(e);
  }
});

reactionRouter.post(
  '/:post_id',
  BodyValidation(ReactionActionDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.context;
    const data = req.body;
    const { post_id: postId } = req.params;

    try {
      const reaction = await service.createReaction(new CreateReactionDTO(userId, postId, data));

      return res.status(HttpStatus.OK).json(reaction);
    } catch (e) {
      next(e);
    }
  }
);

reactionRouter.delete(
  '/:post_id',
  BodyValidation(ReactionActionDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.context;
    const data = req.body;

    const { post_id: postId } = req.params;

    try {
      await service.deleteReaction(new DeleteReactionDTO(userId, postId, data.action));

      return res.status(HttpStatus.OK).json({ message: `Deleted reaction from ${postId}` });
    } catch (e) {
      next(e);
    }
  }
);
