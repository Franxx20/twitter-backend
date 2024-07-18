import { OffsetPagination } from '@types';
import { UserDTO, UserUpdateInputDTO, UserUpdateOutputDTO, UserViewDTO } from '../dto';
// import { Visibility } from '@prisma/client';
// import {userUP
// import {UserUpdateDTO} from '../dto';

export interface UserService {
  deleteUser: (userId: string) => Promise<void>;
  getUser: (userId: string) => Promise<UserViewDTO>;
  getUserRecommendations: (userId: string, options: OffsetPagination) => Promise<UserViewDTO[]>;
  updateUser: (userId: string, user: UserUpdateInputDTO) => Promise<UserUpdateOutputDTO | null>;
}
