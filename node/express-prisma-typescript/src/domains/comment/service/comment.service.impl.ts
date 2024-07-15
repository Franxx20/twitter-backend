import { CommentRepository } from '@domains/comment/repository/comment.repository';

import { CommentService } from '@domains/comment/service/comment.service';

import { validate } from 'class-validator';
import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';
import { ForbiddenException, InvalidUserException, NotFoundException } from '@utils';

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
    console.log(result);
    if (!result) throw new InvalidUserException();

    const comments = await this.repository.getAllCommentsFromUser(authorId);
    if (!comments) throw new NotFoundException('comments');

    return comments;
  }

  async getAllCommentsFromPost(userId: string, postId: string): Promise<CommentDTO[]> {
    const post = await this.repository.getById(postId);
    if (!post) throw new NotFoundException('post');

    const result = await this.repository.isPostAuthorPublicOrFollowed(userId, post.authorId);
    console.log(result);
    if (!result) throw new InvalidUserException();

    const comments = await this.repository.getAllCommentsFromPost(userId, postId);
    console.log(comments);
    if (!comments) throw new NotFoundException('no comments found');
    return comments;
  }
}
