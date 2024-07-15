import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';

export interface CommentService {
  getAllCommentsFromPost: (userId: string, postId: string) => Promise<CommentDTO[]>;
  createComment: (userId: string, postId: string, data: CreatePostInputDTO) => Promise<CommentDTO>;
  deleteComment: (userId: string, postId: string) => Promise<void>;
}
