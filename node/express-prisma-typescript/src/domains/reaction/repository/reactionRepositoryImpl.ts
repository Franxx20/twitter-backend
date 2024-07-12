import { PrismaClient, ReactionAction } from '@prisma/client';

import { ReactionRepository } from '.';
import { CreateReactionDTO, ReactionDTO } from '../dto';

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(authorId: string, data: CreateReactionDTO): Promise<ReactionDTO> {
    // return Promise.resolve(undefined);
    const reaction = await this.db.reaction.create({
      data: {
        authorId,
        ...data,
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
    // return await this.db.reaction.findMany({});
    const reactions = await this.db.reaction.findMany({});

    return reactions;
  }

  async getById(reactionId: string): Promise<ReactionDTO | null> {
    const reaction 
  }

  async getByAuthorId(authorId: string): Promise<ReactionDTO[] | null> {
    // return Promise.resolve(undefined);
    const reactions = await this.db.reaction.findMany({
      where: {
        authorId,
      },
    });

    return reactions;
  }

  async getByPostId(postId: string): Promise<ReactionDTO[] | null> {
    const reactions = await this.db.reaction.findMany({
      where: {
        postId,
      },
    });
    return reactions;
  }
}
