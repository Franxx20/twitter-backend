import {
  CreatePostDTO,
  DeletePostDTO,
  ExtendedPostDTO,
  GetPostDTO,
  PostDTO,
  PostsByAuthorDTO,
  PreSignedUrl,
} from '../dto';

import { PostRepository } from '../repository';
import { PostService } from '.';
import { validate } from 'class-validator';
import {
  ForbiddenException,
  generatePreSignedUrls,
  InvalidUserException,
  isUserPublicOrFollowed,
  NotFoundException,
  ValidationException,
} from '@utils';
import { CursorPagination } from '@types';

export class PostServiceImpl implements PostService {
  constructor(private readonly repository: PostRepository) {}

  async createPost(userId: string, content: string, images: string[]): Promise<PostDTO> {
    const data = new CreatePostDTO(userId, content, images);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    if (data.images !== undefined) {
      const urls: PreSignedUrl[] = await generatePreSignedUrls(data.images);
      console.log(urls);
      data.images = urls.map((url) => url.key);
    }
    return await this.repository.create(data);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const data = new DeletePostDTO(userId, postId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }
    const post = await this.repository.getById(postId);
    // solo se puede borrar un post si el userId es del autor
    if (!post) throw new NotFoundException('post');
    if (post.authorId !== userId) throw new ForbiddenException();
    await this.repository.delete(postId);
  }

  async getPost(userId: string, postId: string): Promise<PostDTO> {
    const data = new GetPostDTO(userId, postId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }
    const post = await this.repository.getById(postId);

    if (!post) throw new NotFoundException('post');
    const result = await isUserPublicOrFollowed(userId, post.authorId);
    if (!result) {
      throw new InvalidUserException();
    }

    return post;
  }

  async getLatestPosts(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.repository.getAllByDatePaginated(userId, options);
    if (!posts.length) throw new NotFoundException('posts');

    return posts;
  }

  async getPostsByAuthor(userId: string, authorId: string): Promise<ExtendedPostDTO[]> {
    const data = new PostsByAuthorDTO(userId, authorId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    const result = await isUserPublicOrFollowed(data.userId, data.authorId);
    if (!result) {
      throw new InvalidUserException();
    }
    const authors = await this.repository.getByAuthorId(data.authorId);

    if (!authors.length) throw new NotFoundException('authors');

    return authors;
  }
}
