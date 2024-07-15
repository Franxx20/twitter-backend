import {  ReactionDTO, CreateReactionDTO, ReactionDeleteDTO } from '@domains/reaction/dto';
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

  async deleteReaction(userId: string, reactionDeleteDTO: ReactionDeleteDTO): Promise<void> {
    const reactions = await this.repository.getByPostId(reactionDeleteDTO.postId);
    if (!reactions) throw new NotFoundException('reaction');
    if (reactions[0].authorId !== userId || reactions.length === 0) throw new ForbiddenException();
    for (const reaction of reactions) {
      if (reaction.action === reactionDeleteDTO.action) await this.repository.delete(reaction.id);
    }
    await Promise.resolve();
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
    return await Promise.resolve([]);
  }

  async getReactionsFromPost(postId: string): Promise<ReactionDTO[]> {
    return await Promise.resolve([]);
  }
}
