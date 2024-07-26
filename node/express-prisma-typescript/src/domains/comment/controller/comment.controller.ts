import { NextFunction, Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
import 'express-async-errors';

import { BodyValidation, db } from '@utils';

import { CommentRepositoryImpl } from '../repository';
import { CommentService, CommentServiceImpl } from '../service';
import { CreatePostDTO } from '@domains/post/dto';

export const commentRouter = Router();

// User dependency injection
const service: CommentService = new CommentServiceImpl(new CommentRepositoryImpl(db));

commentRouter.get('/:commentId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { commentId } = req.params;

  try {
    const comment = await service.getComment(userId, commentId);
    return res.status(HttpStatus.OK).json(comment);
  } catch (e) {
    next(e);
  }
});

commentRouter.get('/:postId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;
  const { limit, skip } = req.query as Record<string, string>;

  try {
    console.log('buscando todos los comentarios de un post');
    const comments = await service.getAllCommentsFromPostPaginated(userId, postId, {
      limit: Number(limit),
      skip: Number(skip),
    });

    const parentPost = await service.getParentPost(postId);

    return res.status(HttpStatus.OK).json({
      parentPost,
      comments,
    });
  } catch (e) {
    next(e);
  }
});

commentRouter.get('/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { userId: authorId } = req.params;

  try {
    const comments = await service.getAllCommentsFromUser(userId, authorId);
    return res.status(HttpStatus.OK).json(comments);
  } catch (e) {
    next(e);
  }
});

commentRouter.post(
  '/:postId',
  BodyValidation(CreatePostDTO),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.context;
    const { postId } = req.params;
    const data = req.body;

    try {
      const comment = await service.createComment(userId, postId, data);
      return res.status(HttpStatus.CREATED).json(comment);
    } catch (e) {
      next(e);
    }
  }
);

commentRouter.delete('/:postId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;

  try {
    await service.deleteComment(userId, postId);
    return res.status(HttpStatus.OK).send(`Deleted comment ${postId}`);
  } catch (e) {
    next(e)
  }
});
