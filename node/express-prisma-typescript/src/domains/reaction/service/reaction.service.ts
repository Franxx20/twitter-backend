import {ReactionInputDTO, ReactionDTO, CreateReactionDTO, ReactionDeleteDTO} from '@domains/reaction/dto';
import {ReactionAction} from "@prisma/client";

export interface ReactionService {
  createReaction: (userId: string, reaction: CreateReactionDTO) => Promise<ReactionDTO>;
  // deleteReaction: (userId: string, postId: string, action: ReactionAction) => Promise<void>;
  deleteReaction: (userId: string, reactionDeleteDTO: ReactionDeleteDTO) => Promise<void>;

  getReaction: (reactionId: string) => Promise<ReactionDTO>;
  getAllReactions: () => Promise<ReactionDTO[]>;
  getReactionsByUser: (userId: string) => Promise<ReactionDTO[]>;
  getReactionsFromPost: (postId: string) => Promise<ReactionDTO[]>;
}
