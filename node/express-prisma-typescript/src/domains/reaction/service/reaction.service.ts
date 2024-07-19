import { ReactionInputDTO, ReactionDTO, CreateReactionDTO, ReactionDeleteDTO } from '@domains/reaction/dto';
import { ReactionAction } from '@prisma/client';
import { ExtendedPostDTO } from '@domains/post/dto';

export interface ReactionService {
  createReaction: (userId: string, reaction: CreateReactionDTO) => Promise<ReactionDTO>;
  // deleteReaction: (userId: string, postId: string, action: ReactionAction) => Promise<void>;
  deleteReaction: (userId: string, reactionDeleteDTO: ReactionDeleteDTO) => Promise<void>;

  getReaction: (reactionId: string) => Promise<ReactionDTO>;
  getAllReactions: () => Promise<ReactionDTO[]>;

  getReactionsFromUser: (userId: string, authorId: string) => Promise<ReactionDTO[]>;
  getReactionsFromPost: (userId: string, postId: string) => Promise<ReactionDTO[]>;


  getAllLikesFromUser: (userId: string, authorId: string) => Promise<ReactionDTO[]>;
  getAllRetweetsFromUser: (userId: string, authorId: string) => Promise<ReactionDTO[]>;
}
