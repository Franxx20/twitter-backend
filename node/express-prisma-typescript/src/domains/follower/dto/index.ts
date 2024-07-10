// import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFollowInputDTO {
  constructor(followerId: string) {
    this.followedId = followerId;
  }

  @IsString()
  @IsNotEmpty()
  followedId!: string;
}

export class FollowerDTO {
  constructor(follow: FollowerDTO) {
    this.id = follow.id;
    this.followedId = follow.followedId;
    this.followerId = follow.followerId;
    this.createdAt = follow.createdAt;
  }

  id: string;
  followerId: string;
  followedId: string;
  createdAt: Date;
}
