import { MessageService } from '@domains/message/service/message.service';
import { MessageDTO } from '@domains/message/dto';
import { CursorPagination } from '@types';
import { validate } from 'class-validator';
import { MessageRepository } from '@domains/message/repository';
import { ForbiddenException, InvalidUserException, NotFoundException } from '@utils';

export class MessageServiceImpl implements MessageService {
  constructor(private readonly repository: MessageRepository) {}

  async create(message: MessageDTO): Promise<MessageDTO> {
    await validate(message);

    return await this.repository.create(message);
  }

  async delete(senderId: string, messageId: string): Promise<void> {
    const message = await this.repository.getMessageById(messageId);
    if (message === null) throw new NotFoundException('message');

    if (message.senderId !== senderId) throw new ForbiddenException();

    await this.repository.delete(messageId);
  }

  async getAllMessagesFromChatPaginated(
    senderId: string,
    receiverId: string,
    options: CursorPagination
  ): Promise<MessageDTO[]> {
    // return Promise.resolve([]);
    const result = await this.repository.isReceiverFollowed(senderId, receiverId);
    if (!result) throw new InvalidUserException();

    const messages = await this.repository.getAllMessagesFromChatPaginated(senderId, receiverId, options);
    if (!messages.length) throw new NotFoundException('messages');

    return messages;
  }

  async getMessageById(messageId: string): Promise<MessageDTO> {
    // return Promise.resolve(undefined);
    const message = await this.repository.getMessageById(messageId);
    if (message === null) throw new NotFoundException('message');

    return message;
  }

  async isReceiverFollowed(senderId: string, receiverId: string): Promise<boolean> {
    return await this.repository.isReceiverFollowed(senderId, receiverId);
  }
}
