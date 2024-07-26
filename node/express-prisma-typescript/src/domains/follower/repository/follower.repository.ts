import { CreateFollow, FollowerDTO } from '@domains/follower/dto';

export interface FollowerRepository {
  create: (data: CreateFollow) => Promise<FollowerDTO>;
  delete: (followId: string) => Promise<void>;
  getById: (followerId: string, followedId: string) => Promise<FollowerDTO | null>;
  getByFollowerId: (followerId: string) => Promise<FollowerDTO[]>;
  getAllFollows: () => Promise<FollowerDTO[]>;
}
