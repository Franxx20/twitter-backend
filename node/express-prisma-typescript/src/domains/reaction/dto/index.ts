import { Reaction, ReactionAction } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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

export class CreateReactionDTO {
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsEnum(ReactionAction)
  @IsNotEmpty()
  action!: ReactionAction;
}
