import { PrismaClient, Visibility } from '@prisma/client';

import { CommentRepository } from '@domains/comment/repository/comment.repository';
import { CreatePostInputDTO, ExtendedPostDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';
import { OffsetPagination } from '@types';

export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(authorId: string, parentPostId: string, data: CreatePostInputDTO): Promise<CommentDTO> {
    const commentPost = await this.db.post.create({
      data: {
        authorId,
        parentPostId,
        ...data,
      },
    });
    // Increment the qtyComments field in the parent post
    await this.db.post.update({
      where: {
        id: parentPostId,
      },
      data: {
        qtyComments: {
          increment: 1,
        },
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
    // Increment the qtyComments field in the parent post
    await this.db.post.update({
      where: {
        id: postId,
      },
      data: {
        qtyComments: {
          decrement: 1,
        },
      },
    });
  }

  async getAllCommentsFromPost(postId: string, options: OffsetPagination): Promise<CommentDTO[]> {
    const comments = await this.db.post.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      // ask
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
    // return Promise.resolve(undefined);
    const commentPost = await this.db.post.findUnique({
      where: {
        id: postId,
      },
    });

    return commentPost !== null ? new CommentDTO(commentPost) : null;
  }

  async isPostAuthorPublicOrFollowed(userId: string, authorId: string): Promise<boolean> {
    const author = await this.db.user.findUnique({
      where: {
        id: authorId,
      },
    });

    if (author === null) {
      console.log(`authorId ${authorId} not found`);
      return false;
    }

    if (author.visibility === Visibility.PUBLIC) return true;

    if (author.visibility === Visibility.HIDDEN) return false;

    const follow = await this.db.follow.findFirst({
      where: {
        followerId: userId,
        followedId: authorId,
      },
    });

    return follow !== null;
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
