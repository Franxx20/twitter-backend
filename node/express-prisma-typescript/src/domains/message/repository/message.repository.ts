import { MessageDTO } from '@domains/message/dto';
import { CursorPagination } from '@types';

export interface MessageRepository {
  create: (message: MessageDTO) => Promise<MessageDTO>;
  delete: (messageId: string) => Promise<void>;

  getMessageById: (MessageId: string) => Promise<MessageDTO | null>;
  getAllMessagesFromChatPaginated: (
    senderId: string,
    receiverId: string,
    options: CursorPagination
  ) => Promise<MessageDTO[]>;

  // isReceiverFollowed: (senderId: string, receiverId: string) => Promise<boolean>;
}
