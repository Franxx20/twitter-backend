import { CreateReactionDTO, ReactionDeleteDTO, ReactionDTO } from '@domains/reaction/dto';
import { ReactionRepository } from '@domains/reaction/repository';
import { ReactionService } from '@domains/reaction/service/reaction.service';
import { ForbiddenException, isUserPublicOrFollowed, NotFoundException } from '@utils';
import { validate } from 'class-validator';

export class ReactionServiceImpl implements ReactionService {
  constructor(private readonly repository: ReactionRepository) {}

  async createReaction(userId: string, data: CreateReactionDTO): Promise<ReactionDTO> {
    await validate(data);
    return await this.repository.create(userId, data);
  }

  async deleteReaction(userId: string, reactionDeleteDTO: ReactionDeleteDTO): Promise<void> {
    const reactions = await this.repository.getAllReactionsFromPost(reactionDeleteDTO.postId);
    if (!reactions.length) throw new NotFoundException('reaction');
    if (reactions[0].authorId !== userId || reactions.length === 0) throw new ForbiddenException();
    for (const reaction of reactions) {
      if (reaction.action === reactionDeleteDTO.action) await this.repository.delete(reaction.id);
    }
    await Promise.resolve();
  }

  async getAllReactions(): Promise<ReactionDTO[]> {
    const reactions = await this.repository.getAllReactions();
    if (!reactions.length) throw new NotFoundException('reactions');
    return reactions;
  }

  async getReaction(reactionId: string): Promise<ReactionDTO> {
    const reaction = await this.repository.getByReactionId(reactionId);
    if (!reaction) throw new NotFoundException('reaction');
    return reaction;
  }

  async getReactionsFromUser(userId: string, authorId: string): Promise<ReactionDTO[]> {
    const result = await isUserPublicOrFollowed(userId, authorId);
    if (!result) throw new ForbiddenException();

    const reactions = await this.repository.getAllReactionsFromUser(authorId);
    if (!reactions.length) throw new NotFoundException('reactions');

    return reactions;
  }

  async getReactionsFromPost(userId: string, postId: string): Promise<ReactionDTO[]> {
    const authorId = await this.repository.getAuthorIdOfPost(postId);
    if (!authorId) throw new NotFoundException('authorId');

    const reactions = await this.repository.getAllReactionsFromPost(postId);
    if (!reactions.length) throw new NotFoundException('reactions');

    return reactions;
  }

  async getAllLikesFromUser(userId: string, authorId: string): Promise<ReactionDTO[]> {
    const result = await isUserPublicOrFollowed(userId, authorId);
    if (!result) throw new ForbiddenException();

    const reactions = await this.repository.getAllLikesFromUser(authorId);
    if (!reactions.length) throw new NotFoundException('reactions');

    return reactions;
  }

  async getAllRetweetsFromUser(userId: string, authorId: string): Promise<ReactionDTO[]> {
    const result = await isUserPublicOrFollowed(userId, authorId);
    if (!result) throw new ForbiddenException();

    const reactions = await this.repository.getAllRetweetsFromUser(authorId);
    if (!reactions.length) throw new NotFoundException('reactions');

    return reactions;
  }
}
