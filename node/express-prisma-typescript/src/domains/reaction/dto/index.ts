import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Reaction, ReactionAction } from '@prisma/client';

export class ReactionDTO {
  constructor(reaction: Reaction) {
    this.id = reaction.id;
    this.authorId = reaction.authorId;
    this.postId = reaction.postId;
    this.action = reaction.action;
    this.createdAt = reaction.createdAt;
  }

  id: string;
  authorId: string;
  postId: string;
  action: ReactionAction;
  createdAt: Date;
}

export class ReactionInputDTO {
  @IsEnum(ReactionAction)
  @IsNotEmpty()
  action!: ReactionAction;
}

export class userIdBodyDTO {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}

export class CreateReactionDTO {
  constructor(postId: string, reaction: ReactionInputDTO) {
    this.postId = postId;
    this.action = reaction.action;
  }

  @IsEnum(ReactionAction)
  @IsNotEmpty()
  action!: ReactionAction;

  @IsString()
  @IsNotEmpty()
  postId!: string;
}
