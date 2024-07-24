import { CreateReactionDTO, ReactionDTO } from '../dto';

export interface ReactionRepository {
  create: (userId: string, data: CreateReactionDTO) => Promise<ReactionDTO>;
  delete: (reactionId: string) => Promise<void>;

  /// cambiar el retorno de los metodos que devuelvan listas para que no devuelvan null.
  getByReactionId: (reactionId: string) => Promise<ReactionDTO | null>;
  getAllReactionsFromUser: (userId: string) => Promise<ReactionDTO[]>;
  getAllReactionsFromPost: (postId: string) => Promise<ReactionDTO[]>;
  getAllReactions: () => Promise<ReactionDTO[]>;

  getAllLikesFromUser: (userId: string) => Promise<ReactionDTO[]>;
  getAllRetweetsFromUser: (userId: string) => Promise<ReactionDTO[]>;

  getAuthorIdOfPost: (postId: string) => Promise<string | null>;
}
