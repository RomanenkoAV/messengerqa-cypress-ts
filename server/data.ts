import type { Chat, Message, User } from '../shared/types';

export const currentUser: User = {
  id: 'u1',
  name: 'Arseniy QA',
  email: 'demo@example.com',
  avatar: 'AQ'
};

export const users: User[] = [
  currentUser,
  {
    id: 'u2',
    name: 'Anna Petrova',
    email: 'anna@example.com',
    avatar: 'AP'
  },
  {
    id: 'u3',
    name: 'QA Team',
    email: 'qa-team@example.com',
    avatar: 'QT'
  }
];

const initialChats: Chat[] = [
  {
    id: 'c1',
    title: 'Anna Petrova',
    avatar: 'AP',
    unreadCount: 1,
    lastMessage: 'Посмотри новый билд',
    updatedAt: '2026-06-23T09:30:00.000Z',
    memberIds: ['u1', 'u2']
  },
  {
    id: 'c2',
    title: 'QA Team',
    avatar: 'QT',
    unreadCount: 0,
    lastMessage: 'Регресс завершён',
    updatedAt: '2026-06-23T08:10:00.000Z',
    memberIds: ['u1', 'u3']
  }
];

const initialMessages: Message[] = [
  {
    id: 'm1',
    chatId: 'c1',
    authorId: 'u2',
    text: 'Привет! Посмотри новый билд',
    createdAt: '2026-06-23T09:29:00.000Z',
    edited: false,
    status: 'read'
  },
  {
    id: 'm2',
    chatId: 'c1',
    authorId: 'u1',
    text: 'Проверю после smoke',
    createdAt: '2026-06-23T09:30:00.000Z',
    edited: false,
    status: 'read'
  },
  {
    id: 'm3',
    chatId: 'c2',
    authorId: 'u3',
    text: 'Регресс завершён без блокеров',
    createdAt: '2026-06-23T08:10:00.000Z',
    edited: false,
    status: 'read'
  }
];

export let chats: Chat[] = [];
export let messages: Message[] = [];

export function resetData(): void {
  chats = structuredClone(initialChats);
  messages = structuredClone(initialMessages);
}

resetData();
