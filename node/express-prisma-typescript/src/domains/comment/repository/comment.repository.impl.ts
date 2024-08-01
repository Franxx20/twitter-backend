import { PrismaClient } from '@prisma/client';

import { CommentRepository } from '@domains/comment/repository/comment.repository';
import { CreatePostDTO, ExtendedPostDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';
import { CursorPagination } from '@types';

export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(authorId: string, parentPostId: string, data: CreatePostDTO): Promise<CommentDTO> {
    const commentPost = await this.db.post.create({
      data: {
        authorId,
        parentPostId,
        ...data,
      },
    });

    return new CommentDTO(commentPost);
  }

  async delete(postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId,
      },
    });

  }

  async getAllCommentsFromPost(postId: string, options: CursorPagination): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      include: {
        reactions: {
          orderBy: {
            action: 'asc',
          },
        },
      },
      where: {
        id: postId,

      },
    });
    return comments.map((comment) => new CommentDTO(comment));
  }

  async getAllCommentsFromUser(authorId: string): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        authorId,
        NOT: {
          parentPostId: null,
        },
      },
    });
    return comments.map((comment) => new CommentDTO(comment));
  }

  async getById(postId: string): Promise<CommentDTO | null> {
    const commentPost = await this.db.post.findUnique({
      where: {
        id: postId,
      },
    });

    return commentPost !== null ? new CommentDTO(commentPost) : null;
  }

  async getParentPost(postId: string): Promise<ExtendedPostDTO | null> {
    const postWithAuthor = await this.db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
      },
    });
    if (postWithAuthor === null) return null;
    return new ExtendedPostDTO(postWithAuthor);
  }
}
