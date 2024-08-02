import { NextFunction, Request, Response, Router } from 'express';
import HttpStatus from 'http-status';
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors';

import { BodyValidation, db } from '@utils';

import { PostRepositoryImpl } from '../repository';
import { PostService, PostServiceImpl } from '../service';
import { CreatePostDTO } from '../dto';
import { UserRepositoryImpl } from '@domains/user/repository';

export const postRouter = Router();

// Use dependency injection
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db), new UserRepositoryImpl(db));

// All users are currently public, meaning that I can see tweets from anyone, without having to follow them.
// Add the ability for users to have private profiles and store it in the User table.
// Update the GET api/post to return only posts with public account authors or private account authors that the user follows.
postRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { limit, before, after } = req.query as Record<string, string>;

  try {
    const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after });

    return res.status(HttpStatus.OK).json(posts);
  } catch (e) {
    next(e);
  }
});

postRouter.get('/:postId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;

  try {
    const post = await service.getPost(userId, postId);

    return res.status(HttpStatus.OK).json(post);
  } catch (e) {
    next(e);
  }
});

postRouter.get('/by_user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.context.userId;
  const authorId = req.params.userId;
  console.log(authorId);
  try {
    const posts = await service.getPostsByAuthor(userId, authorId);

    return res.status(HttpStatus.OK).json(posts);
  } catch (e) {
    next(e);
  }
});

postRouter.post('/', BodyValidation(CreatePostDTO), async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const data = req.body;
  console.log(data);
  console.log(userId)

  try {
    const post = await service.createPost(userId, data.content, data.images);

    return res.status(HttpStatus.CREATED).json(post);
  } catch (e) {
    next(e);
  }
});

postRouter.delete('/:postId', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = res.locals.context;
  const { postId } = req.params;

  try {
    await service.deletePost(userId, postId);

    return res.status(HttpStatus.OK).send(`Deleted post ${postId}`);
  } catch (e) {
    next(e);
  }
});
