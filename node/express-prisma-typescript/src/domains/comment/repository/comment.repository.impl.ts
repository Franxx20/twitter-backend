import { PrismaClient, Visibility } from '@prisma/client';

import { CommentRepository } from '@domains/comment/repository/comment.repository';
import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';

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

    return new CommentDTO(commentPost);
  }

  async delete(postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async getAllCommentsFromPost(authorId: string, parentPostId: string): Promise<CommentDTO[] | null> {
    const comments = await this.db.post.findMany({
      where: {
        parentPostId,
        // authorId:authorId,
      },
    });

    return comments !== null ? comments.map((comment) => new CommentDTO(comment)) : null;
  }

  async getAllCommentsFromUser(userId: string): Promise<CommentDTO[] | null> {
    const comments = await this.db.post.findMany({
      where: {
        authorId: userId,
        NOT: {
          parentPostId: null,
        },
      },
    });
    return comments !== null ? comments.map((comment) => new CommentDTO(comment)) : null;
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

    if (!author) {
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
}
