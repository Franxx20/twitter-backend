import { Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
import 'express-async-errors';

import { db, BodyValidation } from '@utils';

import { CommentRepositoryImpl } from '../repository';
import { CommentService, CommentServiceImpl } from '../service';
import { CreatePostInputDTO } from '@domains/post/dto';

export const commentRouter = Router();

// User dependency injection
const service: CommentService = new CommentServiceImpl(new CommentRepositoryImpl(db));

commentRouter.get('/:commentId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { commentId } = req.params;

  const comment = await service.getComment(userId, commentId);

  return res.status(HttpStatus.OK).json(comment);
});

commentRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;
  const { limit, skip } = req.query as Record<string, string>;

  console.log('buscando todos los comentarios de un post');
  const comments = await service.getAllCommentsFromPostPaginated(userId, postId, { limit: Number(limit), skip: Number(skip) });
  console.log(comments);

  return res.status(HttpStatus.OK).json(comments);
});

commentRouter.get('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { userId: authorId } = req.params;

  console.log('buscando todos los comentarios de un authorId');
  const comments = await service.getAllCommentsFromUser(userId, authorId);

  return res.status(HttpStatus.OK).json(comments);
});

commentRouter.post('/:postId', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;
  const data = req.body;

  const comment = await service.createComment(userId, postId, data);

  return res.status(HttpStatus.CREATED).json(comment);
});

commentRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;

  await service.deleteComment(userId, postId);

  return res.status(HttpStatus.OK).send(`Deleted comment ${postId}`);
});
