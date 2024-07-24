import { CreatePostInputDTO, ExtendedPostDTO, PostDTO, PreSignedUrl } from '../dto';

import { PostRepository } from '../repository';
import { PostService } from '.';
import { validate } from 'class-validator';
import { ForbiddenException, InvalidUserException, NotFoundException, generatePreSignedUrls } from '@utils';
import { CursorPagination } from '@types';
import { isUserPublicOrFollowed } from '@utils/userValidation';

export class PostServiceImpl implements PostService {
  constructor(private readonly repository: PostRepository) {}

  async createPost(userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data);

    if (data.images !== undefined) {
      const urls: PreSignedUrl[] = await generatePreSignedUrls(data.images);
      console.log(urls);
      data.images = urls.map((url) => url.key);
    }
    return await this.repository.create(userId, data);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId);
    // solo se puede borrar un post si el userId es del autor
    if (!post) throw new NotFoundException('post');
    if (post.authorId !== userId) throw new ForbiddenException();
    await this.repository.delete(postId);
  }

  async getPost(userId: string, postId: string): Promise<PostDTO> {
    const post = await this.repository.getById(postId);

    if (!post) throw new NotFoundException('post');
    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, post.authorId);
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

  async getPostsByAuthor(userId: any, authorId: string): Promise<ExtendedPostDTO[]> {
    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, authorId);
    // const result = await isUserPublicOrFollowed(userId, authorId);
    if (!result) {
      throw new InvalidUserException();
    }
    const authors = await this.repository.getByAuthorId(authorId);

    if (!authors.length) throw new NotFoundException('authors');

    return authors;
  }
}
