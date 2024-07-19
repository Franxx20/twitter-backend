import { CursorPagination } from '@types';
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>;
  delete: (postId: string) => Promise<void>;

  getById: (postId: string) => Promise<PostDTO | null>;
  getByAuthorId: (authorId: string) => Promise<ExtendedPostDTO[]>;
  getAllByDatePaginated: (usedId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>;

  isPostAuthorPublicOrFollowed: (userId: string, authorId: string) => Promise<boolean>;

}
