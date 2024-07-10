import { OffsetPagination } from '@types'
import { UserDTO ,UpdateInputDTO} from '../dto'
// import { Visibility } from '@prisma/client';
// import {userUP
// import {UserUpdateDTO} from '../dto';

export interface UserService {
  deleteUser: (userId: string) => Promise<void>
  getUser: (userId: string) => Promise<UserDTO>
  getUserRecommendations: (userId: string, options: OffsetPagination) => Promise<UserDTO[]>
  updateUser:(userId: string, user: UpdateInputDTO) => Promise<void>
}
