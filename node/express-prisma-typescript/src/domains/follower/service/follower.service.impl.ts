import { FollowerService } from '@domains/follower/service/follower.service';
import { CreateFollow, DeleteFollowDTO, FollowerDTO, GetFollowDTO } from '@domains/follower/dto';
import { validate } from 'class-validator';
import { ForbiddenException, NotFoundException, ValidationException } from '@utils';
import { FollowerRepository } from '@domains/follower/repository';

export class FollowerServiceImpl implements FollowerService {
  constructor(private readonly repository: FollowerRepository) {}

  async createFollower(followerId: string, followedId: string): Promise<FollowerDTO> {
    const data = new CreateFollow(followerId, followedId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }
    return await this.repository.create(data);
  }

  async deleteFollower(followerId: string, followId: string): Promise<void> {
    const data = new DeleteFollowDTO(followerId, followId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    const follow = await this.repository.getById(followId);
    if (!follow) throw new NotFoundException('follow');
    if (follow.followerId !== followerId) throw new ForbiddenException();
    await this.repository.delete(followId);
  }

  async getFollow(followerId: string, followId: string): Promise<FollowerDTO> {
    const data = new GetFollowDTO(followerId, followId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    const follow = await this.repository.getById(followId);
    if (!follow) throw new NotFoundException('follow');
    return follow;
  }

  async getAllFollows(): Promise<FollowerDTO[]> {
    return await this.repository.getAllFollows();
  }
}
