import { SignupInputDTO } from '@domains/auth/dto';
import { PrismaClient, Visibility } from '@prisma/client';
import { OffsetPagination } from '@types';
import { ExtendedUserDTO, UserDTO, UserUpdateInputDTO, UserUpdateOutputDTO, UserViewDTO } from '../dto';
import { UserRepository } from './user.repository';

// import { Visibility } from '@prisma/client';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: SignupInputDTO): Promise<UserDTO> {
    const user = await this.db.user.create({
      data,
    });

    return new UserDTO(user);
  }

  // async getById(userId: string): Promise<UserViewDTO | null> {
  //   const user: User | null = await this.db.user.findUnique({
  //     where: {
  //       id: userId,
  //     },
  //   });
  //   return user ? new UserViewDTO(user) : null;
  // }
  async getById(userId: string): Promise<UserViewDTO | null> {
    if (!userId) {
      return null;
    }

    const user = await this.db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user === null) return null;
    return new UserViewDTO(user);
  }

  async delete(userId: string): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async getRecommendedUsersPaginated(userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const userFollows = await this.db.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followedId: true,
      },
    });
    const followedIds = userFollows.map((follow) => follow.followedId);

    const users = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc',
        },
      ],
      where: {
        id: { in: followedIds },
      },
    });
    return users.map((user) => new UserViewDTO(user));
  }

  async getByEmailOrUsername(email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            username,
          },
        ],
      },
    });
    if (user === null) return null;

    return new ExtendedUserDTO(user);
  }

  async updateVisibility(userId: string, visibility: string): Promise<void> {
    await this.db.user.update({
      where: {
        id: userId,
      },
      data: {
        visibility: visibility as Visibility,
      },
    });
  }

  async updateUser(userId: string, user: UserUpdateInputDTO): Promise<UserUpdateOutputDTO | null> {
    const updatedUser = await this.db.user.update({
      where: {
        id: userId,
      },
      data: {
        ...user,
      },
    });

    if (updatedUser === null) return null;
    // Create a UserUpdateOutputDTO and convert null values to undefined
    return new UserUpdateOutputDTO({
      id: updatedUser.id,
      name: updatedUser.name ?? undefined,
      profilePicture: updatedUser.profilePicture ?? undefined,
      visibility: updatedUser.visibility ?? undefined,
    });
  }

  async isUserPublicOrFollowed(userId: string, otherUserId: string): Promise<boolean> {
    // return Promise.resolve(false);
    const otherUser = await this.db.user.findUnique({
      where: {
        id: otherUserId,
      },
    });

    if (otherUser === null) {
      console.log(`otherUserId ${otherUserId} not found`);
      return false;
    }

    if (otherUser.visibility === Visibility.PUBLIC) return true;

    if (otherUser.visibility === Visibility.HIDDEN) return false;

    const follow = await this.db.follow.findFirst({
      where: {
        followerId: userId,
        followedId: otherUserId,
      },
    });

    return follow !== null;
  }
}
