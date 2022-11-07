export type CreateConversationDto = {
  senderId: number;
  receiverId: number;
  messages: Message[];
};

export type ConversationDetails = CreateConversationDto;

export type Message = {
  id: number;
  data: string;
  text: string;
  createdAt: Date;
  conversationId: number;
  userId: number;
};

export type MessageContent = {
  data: { [prop: string]: any };
  senderId: number;
  receiverId: number;
};
