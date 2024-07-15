import { CreatePostInputDTO, PostDTO } from '../dto';
import { PostRepository } from '../repository';
import { PostService } from '.';
import { validate } from 'class-validator';
import { ForbiddenException, InvalidUserException, NotFoundException } from '@utils';
import { CursorPagination } from '@types';

export class PostServiceImpl implements PostService {
  constructor(private readonly repository: PostRepository) {}

  async createPost(userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data);
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

  async getLatestPosts(userId: string, options: CursorPagination): Promise<PostDTO[]> {
    return await this.repository.getAllByDatePaginated(userId, options);
  }

  async getPostsByAuthor(userId: any, authorId: string): Promise<PostDTO[]> {
    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, authorId);
    if (!result) {
      throw new InvalidUserException();
    }
    return await this.repository.getByAuthorId(authorId);
  }
}
