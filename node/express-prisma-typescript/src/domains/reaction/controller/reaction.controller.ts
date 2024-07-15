import { Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors';

import {db, BodyValidation, NotFoundException} from '@utils';

import { ReactionRepositoryImpl } from '../repository';
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service';
import { CreateReactionDTO, ReactionDeleteDTO, ReactionInputDTO } from '@domains/reaction/dto';
import { validate } from 'class-validator';

export const reactionRouter = Router();

// Use dependency injection
const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db));

// Add the ability to react to a post (like and retweet)
// both should be stored in the same table and
// using the endpoints POST api/reaction/:post_id and DELETE api/reaction/:post_id.

// Deberia checkear que el usuario no le de like
// o Retweet al mismo post mas de una vez?

reactionRouter.get('/likes/user/:userId', async (req: Request, res: Response) => {
  const { userId:authorId } = req.params
  const {authorId} = res.locals.context;

  const reactions = await this.service.getAllLikesByAuthorId(userId,authorId);
  if(!reactions)
    throw new NotFoundException("reactions not found")

  return res.status(HttpStatus.OK).json(reactions);
})

reactionRouter.post('/:post_id', BodyValidation(ReactionInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const data = req.body;

  console.log(data);
  console.log(userId);

  const { post_id: postId } = req.params;

  console.log(postId);

  // add user_id to validate
  const createReactionDTO = new CreateReactionDTO(postId, data);
  await validate(createReactionDTO);

  const reaction = await service.createReaction(userId, createReactionDTO);

  return res.status(HttpStatus.OK).json(reaction);
});

reactionRouter.delete('/:post_id', BodyValidation(ReactionInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const data = req.body;

  const { post_id: postId } = req.params;

  await service.deleteReaction(userId, new ReactionDeleteDTO(postId, data));

  return res.status(HttpStatus.OK).json({ message: `Deleted reaction from ${postId}` });
});
