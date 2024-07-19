import { PostDTO } from '@domains/post/dto';

export class CommentDTO extends PostDTO {
  constructor(comment: PostDTO) {
    super(comment);
    this.parentPostId = comment.id;
  }

  parentPostId!: string;
}