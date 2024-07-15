import { ReactionInputDTO, ReactionDTO, CreateReactionDTO } from '@domains/reaction/dto';

export interface ReactionService {
  createReaction: (userId: string, reaction: CreateReactionDTO) => Promise<ReactionDTO>;
  deleteReaction: (userId: string, reactionId: string) => Promise<void>;

  getReaction: (reactionId: string) => Promise<ReactionDTO>;
  getAllReactions: () => Promise<ReactionDTO[]>;
  getReactionsByUser: (userId: string) => Promise<ReactionDTO[]>;
  getReactionsFromPost: (postId: string) => Promise<ReactionDTO[]>;
}
