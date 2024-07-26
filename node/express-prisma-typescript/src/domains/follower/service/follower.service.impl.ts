import { FollowerService } from '@domains/follower/service/follower.service';
import { CreateFollow, DeleteFollowDTO, FollowerDTO, GetFollowDTO } from '@domains/follower/dto';
import { validate } from 'class-validator';
import { ForbiddenException, NotFoundException, ValidationException } from '@utils';
import { FollowerRepository } from '@domains/follower/repository';

export class FollowerServiceImpl implements FollowerService {
  constructor(private readonly repository: FollowerRepository) {}

  /* TODO no se siga a si mismo.
  // TODO no lo cree si ya existe
  // TODO no cree si el seguido no existe
  // TODO si ya le signo que no le deje volver a seguir
  */
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

  async deleteFollower(followerId: string, followedId: string): Promise<void> {
    const data = new DeleteFollowDTO(followerId, followedId);
    const errors = await validate(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new ValidationException(errors.map((error) => ({ ...error, target: undefined, value: undefined })));
    }

    const follow = await this.repository.getById(followerId, followedId);
    if (!follow) throw new NotFoundException('follow');
    if (follow.followerId !== followerId) throw new ForbiddenException();
    await this.repository.delete(follow.id);
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

    const follow = await this.repository.getById(followerId, followId);
    if (!follow) throw new NotFoundException('follow');
    return follow;
  }

  async getAllFollows(): Promise<FollowerDTO[]> {
    return await this.repository.getAllFollows();
  }
}
