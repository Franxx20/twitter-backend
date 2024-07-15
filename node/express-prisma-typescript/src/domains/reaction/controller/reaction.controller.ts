import { Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors';

import { db, BodyValidation } from '@utils';

import { ReactionRepositoryImpl } from '../repository';
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service';
import { CreateReactionDTO, ReactionInputDTO } from '@domains/reaction/dto';
import { validate } from 'class-validator';

export const reactionRouter = Router();

// Use dependency injection
const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db));

// Add the ability to react to a post (like and retweet)
// both should be stored in the same table and
// using the endpoints POST api/reaction/:post_id and DELETE api/reaction/:post_id.

reactionRouter.post('/:post_id', BodyValidation(ReactionInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const data = req.body;

  const { post_id: postId } = req.params;

  // add user_id to validate
  const createReactionDTO = new CreateReactionDTO(postId, data);
  await validate(createReactionDTO);

  const reaction = await service.createReaction(userId, createReactionDTO);

  return res.status(HttpStatus.OK).json(reaction);
});
