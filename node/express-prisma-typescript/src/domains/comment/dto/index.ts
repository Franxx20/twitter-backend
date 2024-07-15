import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostDTO } from '@domains/post/dto';

export class CommentDTO extends PostDTO {
  constructor(comment: PostDTO) {
    super(comment);
    this.parentPostId = comment.id;
  }

  parentPostId!: string;
}

// export class CreateCommentInputDTO {
//   @IsString()
//   @IsNotEmpty()
//   @MaxLength(240)
//   content!: string;
//
//   @IsOptional()
//   @MaxLength(4)
//   images?: string[];
// }
//
// export class CommentDTO {
//   constructor(comment: CommentDTO) {
//     this.id = comment.id;
//     this.authorId = comment.authorId;
//     this.content = comment.content;
//     this.parentPostId = comment.parentPostId;
//     this.images = comment.images;
//     this.createdAt = comment.createdAt;
//   }
//
//   id: string;
//   authorId: string;
//   parentPostId: string;
//   content: string;
//   images: string[];
//   createdAt: Date;
// }
