import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentDTO } from '@domains/comment/dto';

export interface CommentService {
  createComment: (userId: string, postId: string, data: CreatePostInputDTO) => Promise<CommentDTO>;
  deleteComment: (userId: string, postId: string) => Promise<void>;

  getComment: (userId: string, postId: string) => Promise<CommentDTO>;
  getAllCommentsFromPost: (userId: string, postId: string) => Promise<CommentDTO[]>;
  getAllCommentsFromUser: (userId: string) => Promise<CommentDTO[]>;
}
