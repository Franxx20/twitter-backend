import { FollowerService } from '@domains/follower/service/follower.service'
import { CreateFollowInputDTO, FollowerDTO } from '@domains/follower/dto'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { FollowerRepository } from '@domains/follower/repository'

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly repository: FollowerRepository) {
  }

  async createFollower (followerId: string, data: CreateFollowInputDTO): Promise<FollowerDTO> {
    await validate(data)
    return await this.repository.create(followerId, data)
  }

  async deleteFollower (followerId: string, followId: string): Promise<void> {
    const follow = await this.repository.getById(followId)
    if (!follow) throw new NotFoundException('follow')
    if (follow.followerId !== followerId) throw new ForbiddenException()
    await this.repository.delete(followId)
  }

  async getFollow (followerId: string, followId: string): Promise<FollowerDTO> {
    const follow = await this.repository.getById(followId)
    if (!follow) throw new NotFoundException('follow')
    return follow
  }

  async getAllFollows(): Promise<FollowerDTO[]> {
    // return Promise.resolve([]);
    return await this.repository.getAllFollows();
  }
}
