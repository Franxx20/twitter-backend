import { SignupInputDTO } from '@domains/auth/dto';
import { OffsetPagination } from '@types';
import { ExtendedUserDTO, UserUpdateInputDTO, UserDTO, UserViewDTO, UserUpdateOutputDTO } from '../dto';

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>;
  delete: (userId: string) => Promise<void>;
  getRecommendedUsersPaginated: (userId: string, options: OffsetPagination) => Promise<UserViewDTO[]>;
  getById: (userId: string) => Promise<UserViewDTO | null>;
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>;
  // updateVisibility: (user: UserUpdateDTO) => Promise<void>;
  updateUser: (userId: string, user: UserUpdateInputDTO) => Promise<UserUpdateOutputDTO | null>;

  getUsersContainsUsername: (username: string) => Promise<UserViewDTO[] | null>;
  isUserPublicOrFollowed: (userId: string, otherUserId: string) => Promise<boolean>;
  isUserFollowed: (userId: string, otherUserId: string) => Promise<boolean>;
}
