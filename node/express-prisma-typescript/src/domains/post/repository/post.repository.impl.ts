import { PrismaClient, Visibility } from '@prisma/client';

import { CursorPagination } from '@types';

import { PostRepository } from '.';
import { CreatePostDTO, ExtendedPostDTO, PostDTO } from '../dto';

export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(postData: CreatePostDTO): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: postData.userId,
        ...postData,
      },
    });
    return new PostDTO(post);
  }

  // All users are currently public, meaning that I can see tweets from anyone, without having to follow them.
  // Add the ability for users to have private profiles and store it in the User table.
  // Update the GET api/post to return only posts with public account authors or private account authors that the user follows.
  async getAllByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const userFollows = await this.db.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followedId: true,
      },
    });

    const followedIds = userFollows.map((follow) => follow.followedId);

    const posts = await this.db.post.findMany({
      where: {
        OR: [
          {
            author: {
              visibility: Visibility.PUBLIC,
            },
          },
          {
            author: {
              visibility: Visibility.PRIVATE,
              id: { in: followedIds },
            },
          },
        ],
      },

      include: {
        author: true,
      },

      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'asc',
        },
      ],
    });

    return posts.map((post) => new ExtendedPostDTO(post));
  }

  async delete(postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async getById(postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      },
    });
    return post != null ? new PostDTO(post) : null;
  }

  async getByAuthorId(authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId,
      },
      include: {
        author: true,
      },
    });
    return posts.map((post) => new ExtendedPostDTO(post));
  }

  async isPostAuthorPublicOrFollowed(userId: string, authorId: string): Promise<boolean> {
    const author = await this.db.user.findUnique({
      where: {
        id: authorId,
      },
    });

    if (!author) return false;

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
