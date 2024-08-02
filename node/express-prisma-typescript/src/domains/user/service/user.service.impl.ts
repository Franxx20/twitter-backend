import { NotFoundException } from '@utils/errors';
import { OffsetPagination } from 'types';
import { UserDTO, UserUpdateInputDTO, UserUpdateOutputDTO, UserViewDTO } from '../dto';
import { UserRepository } from '../repository';
import { UserService } from './user.service';
import {  db, encryptPassword, generatePreSignedUrl } from '@utils';

export class UserServiceImpl implements UserService {
  constructor(private readonly repository: UserRepository) {}

  async getUser(userId: string): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId);
    if (!user) throw new NotFoundException('user');
    return user;
  }

  async getUserRecommendations(userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const users = await this.repository.getRecommendedUsersPaginated(userId, options);
    if (!users.length) throw new NotFoundException('users');
    return users;
  }

  async deleteUser(userId: string): Promise<UserDTO> {
    return await this.repository.delete(userId);
  }

  async updateUser(userId: string, userUpdateData: UserUpdateInputDTO): Promise<UserUpdateOutputDTO | null> {
    const user = await this.repository.getById(userId);
    if (!user) throw new NotFoundException('user');

    // console.log(userUpdateData);
    if (userUpdateData.password) {
      userUpdateData.password = await encryptPassword(userUpdateData.password)
    }
    if (userUpdateData.profilePicture) {
      const preSignedUrl = await generatePreSignedUrl(userUpdateData.profilePicture);
      userUpdateData.profilePicture = preSignedUrl.key;
    }
    return await this.repository.updateUser(userId, userUpdateData);
  }

  async getUsersContainsUsername(username: string): Promise<UserViewDTO[]> {
    const users = await this.repository.getUsersContainsUsername(username);
    if (!users.length) throw new NotFoundException('users');
    return users;
  }

  async isUserFollowed(followerID: string, followedID: string): Promise<boolean> {
    const follow = await db.follow.findFirst({
      where: {
        followerId: followerID,
        followedId: followedID,
      },
    });
    return follow !== null;
  }
}
