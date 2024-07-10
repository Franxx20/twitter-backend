import { CreateFollowInputDTO, FollowerDTO } from '@domains/follower/dto'

export interface FollowerService {
  createFollower: (followerId: string, body: CreateFollowInputDTO) => Promise<FollowerDTO>
  deleteFollower: (followerId: string, followId: string) => Promise<void>
  getFollow: (followerId: string, followId: string) => Promise<FollowerDTO>
}
