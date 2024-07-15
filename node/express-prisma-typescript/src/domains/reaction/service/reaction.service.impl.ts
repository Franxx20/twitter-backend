import { PrismaClient, ReactionAction } from '@prisma/client';
import { ReactionInputDTO, ReactionDTO, CreateReactionDTO } from '@domains/reaction/dto';
import { ReactionRepository } from '@domains/reaction/repository';
import { ReactionService } from '@domains/reaction/service/reaction.service';
import { ForbiddenException, NotFoundException } from '@utils';
import { validate } from 'class-validator';

export class ReactionServiceImpl implements ReactionService {
  constructor(private readonly repository: ReactionRepository) {}

  async createReaction(userId: string, data: CreateReactionDTO): Promise<ReactionDTO> {
    await validate(data);
    return await this.repository.create(userId, data);
  }

  async deleteReaction(userId: string, reactionId: string): Promise<void> {
    const reaction = await this.repository.getById(reactionId);
    if (!reaction) throw new NotFoundException('reaction');
    if (reaction.authorId !== userId) throw new ForbiddenException();
    await this.repository.delete(reactionId);
  }

  async getAllReactions(): Promise<ReactionDTO[]> {
    return await this.repository.getAll();
  }

  async getReaction(reactionId: string): Promise<ReactionDTO> {
    const reaction = await this.repository.getById(reactionId);
    if (!reaction) throw new NotFoundException('reaction');
    return reaction;
  }

  async getReactionsByUser(userId: string): Promise<ReactionDTO[]> {
    return Promise.resolve([]);
  }

  async getReactionsFromPost(postId: string): Promise<ReactionDTO[]> {
    return Promise.resolve([]);
  }
}
