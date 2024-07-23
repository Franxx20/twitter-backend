import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDTO {
  constructor(message: MessageDTO) {
    this.senderId = message.senderId;
    this.receiverId = message.receiverId;
    this.content = message.content;
  }

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
