import { PrismaClient, Visibility } from '@prisma/client';

import { ReactionRepository } from '.';
import { ReactionDTO, CreateReactionDTO } from '../dto';
import * as console from 'node:console';

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(userId: string, data: CreateReactionDTO): Promise<ReactionDTO> {
    const reaction = await this.db.reaction.create({
      data: {
        authorId: userId,
        postId: data.postId,
        action: data.action,
      },
    });
    console.log(reaction, new ReactionDTO(reaction));
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
  async getAll(): Promise<ReactionDTO[]> {
    const reactions = await this.db.reaction.findMany({});

    return reactions.map((reaction) => new ReactionDTO(reaction));
  }

  async getById(reactionId: string): Promise<ReactionDTO | null> {
    const reaction = await this.db.reaction.findUnique({
      where: {
        id: reactionId,
      },
    });

    return reaction != null ? new ReactionDTO(reaction) : null;
  }

  async getByAuthorId(authorId: string): Promise<ReactionDTO[] | null> {
    const reactions = await this.db.reaction.findMany({
      where: {
        authorId,
      },
    });

    // deberia retonar una lista vacia en vez de nulos?
    return reactions != null ? reactions.map((reaction) => new ReactionDTO(reaction)) : null;
  }

  async getByPostId(postId: string): Promise<ReactionDTO[] | null> {
    const reactions = await this.db.reaction.findMany({
      where: {
        postId,
      },
    });
    return reactions != null ? reactions.map((reaction) => new ReactionDTO(reaction)) : null;
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
}
