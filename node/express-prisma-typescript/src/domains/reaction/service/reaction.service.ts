import { CreateReactionDTO, ReactionDeleteDTO, ReactionDTO } from '@domains/reaction/dto';

export interface ReactionService {
  createReaction: (userId: string, reaction: CreateReactionDTO) => Promise<ReactionDTO>;
  deleteReaction: (userId: string, reactionDeleteDTO: ReactionDeleteDTO) => Promise<void>;

  getReaction: (reactionId: string) => Promise<ReactionDTO>;
  getAllReactions: () => Promise<ReactionDTO[]>;

  getReactionsFromUser: (userId: string, authorId: string) => Promise<ReactionDTO[]>;
  getReactionsFromPost: (userId: string, postId: string) => Promise<ReactionDTO[]>;

  getAllLikesFromUser: (userId: string, authorId: string) => Promise<ReactionDTO[]>;
  getAllRetweetsFromUser: (userId: string, authorId: string) => Promise<ReactionDTO[]>;
}
