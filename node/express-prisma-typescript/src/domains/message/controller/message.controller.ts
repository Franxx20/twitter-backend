import { MessageServiceImpl } from '@domains/message/service';
import { MessageRepositoryImpl } from '@domains/message/repository';
import { db } from '@utils';

export const messageService = new MessageServiceImpl(new MessageRepositoryImpl(db));
