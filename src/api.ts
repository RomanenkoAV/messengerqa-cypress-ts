import type { Chat, LoginResponse, Message, User } from '../shared/types';

const tokenKey = 'messenger_token';

function getToken(): string {
  return localStorage.getItem(tokenKey) ?? '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: 'Request failed' }))) as {
      message?: string;
    };
    throw new Error(body.message ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem(tokenKey, response.token);
    return response;
  },

  logout(): void {
    localStorage.removeItem(tokenKey);
  },

  hasToken(): boolean {
    return Boolean(getToken());
  },

  getMe(): Promise<User> {
    return request<User>('/api/me');
  },

  getChats(query = ''): Promise<Chat[]> {
    const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
    return request<Chat[]>(`/api/chats${suffix}`);
  },

  getMessages(chatId: string): Promise<Message[]> {
    return request<Message[]>(`/api/chats/${chatId}/messages`);
  },

  sendMessage(chatId: string, text: string): Promise<Message> {
    return request<Message>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  editMessage(messageId: string, text: string): Promise<Message> {
    return request<Message>(`/api/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text })
    });
  },

  deleteMessage(messageId: string): Promise<void> {
    return request<void>(`/api/messages/${messageId}`, {
      method: 'DELETE'
    });
  },

  markRead(chatId: string): Promise<void> {
    return request<void>(`/api/chats/${chatId}/read`, {
      method: 'POST'
    });
  }
};
