import { NotFoundException } from '@utils/errors';
import { OffsetPagination } from 'types';
import { UserUpdateInputDTO, UserUpdateOutputDTO, UserViewDTO } from '../dto';
import { UserRepository } from '../repository';
import { UserService } from './user.service';
import bcrypt from 'bcrypt';
import { Constants, generatePreSignedUrl } from '@utils';

export class UserServiceImpl implements UserService {
  constructor(private readonly repository: UserRepository) {}

  async getUser(userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId);
    if (!user) throw new NotFoundException('user');
    return user;
  }

  async getUserRecommendations(userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    // DONE: make this return only users followed by users the original user follows
    return await this.repository.getRecommendedUsersPaginated(userId, options);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  async updateUser(userId: string, user: UserUpdateInputDTO): Promise<UserUpdateOutputDTO | null> {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, Constants.SALT_OR_ROUNDS);
    }
    if (user.profilePicture) {
      const preSignedUrl = await generatePreSignedUrl(user.profilePicture);
      user.profilePicture = preSignedUrl.key;
    }
    return await this.repository.updateUser(userId, user);
  }

  async getUsersContainsUsername(username: string): Promise<UserViewDTO[]> {
    // return Promise.resolve([]);
    const users = await this.repository.getUsersContainsUsername(username);
    if (users === null) throw new NotFoundException('users');
    return users;
  }

  async isUserFollowed(userId: string, otherUserId: string): Promise<boolean> {
    return await this.repository.isUserFollowed(userId, otherUserId);
  }
}
