import { PrismaClient, ReactionAction, Visibility } from '@prisma/client';

import { ReactionRepository } from '.';
import { ReactionDTO, CreateReactionDTO } from '../dto';
import { ForbiddenException } from '@utils';

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(authorId: string, data: CreateReactionDTO): Promise<ReactionDTO> {
    const oldReaction = await this.db.reaction.findFirst({
      where: {
        postId: data.postId,
        action: data.action,
      },
    });

    if (oldReaction) {
      throw new ForbiddenException();
    }

    const reaction = await this.db.reaction.create({
      data: {
        authorId,
        ...data,
      },
    });
    // console.log(reaction, new ReactionDTO(reaction));
    return new ReactionDTO(reaction);
  }

  async delete(reactionId: string): Promise<void> {
    await this.db.reaction.delete({
      where: {
        id: reactionId,
      },
    });
  }

  // make better checks later
  async getAllReactions(): Promise<ReactionDTO[]> {
    const reactions = await this.db.reaction.findMany({});

    return reactions.map((reaction) => new ReactionDTO(reaction));
  }

  async getByReactionId(reactionId: string): Promise<ReactionDTO | null> {
    const reaction = await this.db.reaction.findUnique({
      where: {
        id: reactionId,
      },
    });

    return reaction !== null ? new ReactionDTO(reaction) : null;
  }

  async getAllReactionsFromUser(authorId: string): Promise<ReactionDTO[]> {
    const reactions = await this.db.reaction.findMany({
      where: {
        authorId,
      },
    });

    // deberia retonar una lista vacia en vez de nulos?
    // return reactions != null ? reactions.map((reaction) => new ReactionDTO(reaction)) : null;
    return reactions.map((reaction) => new ReactionDTO(reaction));
  }

  async getAllReactionsFromPost(postId: string): Promise<ReactionDTO[]> {
    const reactions = await this.db.reaction.findMany({
      where: {
        postId,
      },
    });
    // return reactions != null ? reactions.map((reaction) => new ReactionDTO(reaction)) : null;
    return reactions.map((reaction) => new ReactionDTO(reaction));
  }

  async getAllLikesFromUser(userId: string): Promise<ReactionDTO[]> {
    // return Promise.resolve([]);
    const likes = await this.db.reaction.findMany({
      where: {
        authorId: userId,
        action: ReactionAction.LIKE,
      },
    });

    return likes.map((like) => new ReactionDTO(like));
  }

  async getAllRetweetsFromUser(userId: string): Promise<ReactionDTO[]> {
    // return Promise.resolve([]);
    const retweets = await this.db.reaction.findMany({
      where: {
        authorId: userId,
        action: ReactionAction.RETWEET,
      },
    });

    return retweets.map((retweet) => new ReactionDTO(retweet));
  }

  // check this later
  async isReactionAuthorPublicOrFollowed(userId: string, authorId: string): Promise<boolean> {
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

  async getAuthorIdOfPost(postId: string): Promise<string | null> {
    const authorId = await this.db.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });
    if (!authorId) return null;
    return authorId.authorId;
  }
}
