import { CommentRepository } from '@domains/comment/repository/comment.repository';

import { CommentService } from '@domains/comment/service/comment.service';

import { validate } from 'class-validator';
import { CreatePostInputDTO, ExtendedPostDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';
import { ForbiddenException, InvalidUserException, NotFoundException } from '@utils';
import { OffsetPagination } from '@types';

export class CommentServiceImpl implements CommentService {
  constructor(private readonly repository: CommentRepository) {}

  async createComment(userId: string, parentPostId: string, data: CreatePostInputDTO): Promise<CommentDTO> {
    await validate(data);

    return await this.repository.create(userId, parentPostId, data);
  }

  async deleteComment(userId: string, postId: string): Promise<void> {
    const comment = await this.repository.getById(postId);
    if (!comment) throw new NotFoundException('comment');
    if (comment.authorId !== userId) throw new ForbiddenException();
    await this.repository.delete(postId);
  }

  async getComment(userId: string, postId: string): Promise<CommentDTO> {
    // return Promise.resolve(undefined);
    const comment = await this.repository.getById(postId);
    if (!comment) throw new NotFoundException('comment');

    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, comment.authorId);
    console.log(result);
    if (!result) throw new InvalidUserException();

    return comment;
  }

  async getAllCommentsFromUser(userId: string, authorId: string): Promise<CommentDTO[]> {
    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, authorId);
    if (!result) throw new InvalidUserException();

    const comments = await this.repository.getAllCommentsFromUser(authorId);
    if (!comments.length) throw new NotFoundException('comments');

    return comments;
  }

  async getAllCommentsFromPostPaginated(
    userId: string,
    postId: string,
    options: OffsetPagination
  ): Promise<CommentDTO[]> {
    const post = await this.repository.getById(postId);
    if (!post) throw new NotFoundException('post');

    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, post.authorId);
    if (!result) throw new InvalidUserException();

    const comments = await this.repository.getAllCommentsFromPost(postId, options);
    if (!comments.length) throw new NotFoundException('no comments found');
    return comments;
  }

  async getParentPost(parentPostId: string): Promise<ExtendedPostDTO | null> {
    const parentPostWithAuthor = await this.repository.getParentPost(parentPostId);
    if (parentPostWithAuthor === null) return null;

    return parentPostWithAuthor;
  }

}
