import { PrismaClient, ReactionAction } from '@prisma/client';

import { ReactionRepository } from '.';
import { CreateReactionDTO, ReactionDTO } from '../dto';
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

    if (data.action === ReactionAction.LIKE) {
      await this.db.post.update({
        where: {
          id: data.postId,
        },
        data: {
          qtyLikes: {
            increment: 1,
          },
        },
      });
    } else if (data.action === ReactionAction.RETWEET) {
      await this.db.post.update({
        where: {
          id: data.postId,
        },
        data: {
          qtyRetweets: {
            increment: 1,
          },
        },
      });
    }

    return new ReactionDTO(reaction);
  }

  async delete(authorId: string, postId: string, reactionAction: ReactionAction): Promise<void> {
    const reactionId = await this.db.reaction.findFirst({
      where: {
        authorId,
        postId,
        action: reactionAction,
      },
      select: {
        id: true,
      },
    });

    const deletedReaction = await this.db.reaction.delete({
      where: {
        id: reactionId?.id,
      },
    });
    if (deletedReaction.action === ReactionAction.LIKE) {
      await this.db.post.update({
        where: {
          id: deletedReaction.postId,
        },
        data: {
          qtyLikes: {
            increment: 1,
          },
        },
      });
    } else if (deletedReaction.action === ReactionAction.RETWEET) {
      await this.db.post.update({
        where: {
          id: deletedReaction.postId,
        },
        data: {
          qtyRetweets: {
            increment: 1,
          },
        },
      });
    }
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
