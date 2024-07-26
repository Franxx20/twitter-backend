import { OffsetPagination } from '@types';
import { UserUpdateInputDTO, UserUpdateOutputDTO, UserViewDTO } from '../dto';

export interface UserService {
  deleteUser: (userId: string) => Promise<void>;
  getUser: (userId: string) => Promise<UserViewDTO>;
  getUserRecommendations: (userId: string, options: OffsetPagination) => Promise<UserViewDTO[]>;
  updateUser: (userId: string, user: UserUpdateInputDTO) => Promise<UserUpdateOutputDTO | null>;
  getUsersContainsUsername: (username: string) => Promise<UserViewDTO[]>;
}
