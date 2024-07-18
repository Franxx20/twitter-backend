import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';
import { OffsetPagination } from '@types';

export interface CommentRepository {
  create: (userId: string, parentPostId: string, data: CreatePostInputDTO) => Promise<CommentDTO>;
  delete: (postId: string) => Promise<void>;

  getById: (postId: string) => Promise<CommentDTO | null>;
  getAllCommentsFromPost: (postId: string, options: OffsetPagination) => Promise<CommentDTO[]>;
  getAllCommentsFromUser: (userId: string) => Promise<CommentDTO[]>;

  isPostAuthorPublicOrFollowed: (userId: string, postId: string) => Promise<boolean>;
}
