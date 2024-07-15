import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';

export interface CommentRepository {
  create: (userId: string, parentPostId: string, data: CreatePostInputDTO) => Promise<CommentDTO>;
  delete: (postId: string) => Promise<void>;

  getById: (postId: string) => Promise<CommentDTO | null>;
  getAllCommentsFromPost: (userId: string, postId: string) => Promise<CommentDTO[] | null>;
  getAllCommentsFromUser: (userId: string) => Promise<CommentDTO[] | null>;

  isPostAuthorPublicOrFollowed: (userId: string, postId: string) => Promise<boolean>;

}
