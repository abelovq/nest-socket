import { Message } from 'src/conversation/types';

export type ChangeMessageStatusDto = { id: number; status: boolean };
export type ChangeMessageStatus = ChangeMessageStatusDto;
export type getNotReadMessagesForSenderDetails = {
  senderId: number;
};

export type updateMessageDetails = {
  receiverId: number;
  senderId: number;
  body: Partial<Message>;
};

export type LastMessage = Omit<
  Message,
  'data' | 'user' | 'conversationId' | 'userId'
>;
