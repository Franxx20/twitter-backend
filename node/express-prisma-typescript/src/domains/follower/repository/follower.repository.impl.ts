import { CreateFollowInputDTO, FollowerDTO } from '@domains/follower/dto';
import { FollowerRepository } from '@domains/follower/repository/follower.repository';
import { PrismaClient } from '@prisma/client';

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(followerId: string, data: CreateFollowInputDTO): Promise<FollowerDTO> {
    const follow = await this.db.follow.create({
      data: {
        followerId,
        ...data,
      },
    });
    return new FollowerDTO(follow);
  }

  async delete(followId: string): Promise<void> {
    // await Promise.resolve(undefined)
    await this.db.follow.delete({
      where: {
        id: followId,
      },
    });
  }

  async getByFollowerId(followerId: string): Promise<FollowerDTO[]> {
    // return await Promise.resolve([])
    const follows = await this.db.follow.findMany({
      where: {
        followerId,
      },
    });
    return follows.map((follow) => new FollowerDTO(follow));
  }

  async getById(followId: string): Promise<FollowerDTO | null> {
    // await Promise.resolve(undefined)
    const follow = await this.db.follow.findUnique({
      where: {
        id: followId,
      },
    });
    return follow != null ? new FollowerDTO(follow) : null;
  }

  async getAllFollows(): Promise<FollowerDTO[]> {
    return await this.db.follow.findMany({});
  }
}
