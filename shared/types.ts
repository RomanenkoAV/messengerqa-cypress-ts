export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Chat {
  id: string;
  title: string;
  avatar: string;
  unreadCount: number;
  lastMessage: string;
  updatedAt: string;
  memberIds: string[];
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  text: string;
  createdAt: string;
  edited: boolean;
  status: MessageStatus;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}
