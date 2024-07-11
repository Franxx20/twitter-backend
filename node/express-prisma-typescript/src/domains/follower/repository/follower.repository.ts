import { CreateFollowInputDTO, FollowerDTO } from '@domains/follower/dto';

export interface FollowerRepository {
  create: (followerId: string, data: CreateFollowInputDTO) => Promise<FollowerDTO>;
  delete: (followId: string) => Promise<void>;
  getById: (followId: string) => Promise<FollowerDTO | null>;
  getByFollowerId: (followerId: string) => Promise<FollowerDTO[]>;
  getAllFollows: () => Promise<FollowerDTO[]>;
}
