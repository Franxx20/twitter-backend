import { ReactionDTO, CreateReactionDTO } from '../dto';

export interface ReactionRepository {
  create: (userId: string, data: CreateReactionDTO) => Promise<ReactionDTO>;
  delete: (reactionId: string) => Promise<void>;

  getById: (reactionId: string) => Promise<ReactionDTO | null>;
  getByAuthorId: (authorId: string) => Promise<ReactionDTO[] | null>;
  getByPostId: (postId: string) => Promise<ReactionDTO[] | null>;
  getAll: () => Promise<ReactionDTO[]>;

  isReactionAuthorPublicOrFollowed: (userId: string, authorId: string) => Promise<boolean>;
}
