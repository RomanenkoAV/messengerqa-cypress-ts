import { io } from 'socket.io-client';
import { api } from './api';
import type { Chat, Message, User } from '../shared/types';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found');
}

let currentUser: User | null = null;
let chats: Chat[] = [];
let selectedChat: Chat | null = null;
let messages: Message[] = [];
let searchQuery = '';

const socket = io({
  path: '/socket.io'
});

socket.on('message:new', async (message: Message) => {
  if (selectedChat?.id === message.chatId && !messages.some((item) => item.id === message.id)) {
    messages.push(message);
  }
  await refreshChats();
  renderMessenger();
});

socket.on('message:updated', async (updatedMessage: Message) => {
  messages = messages.map((message) =>
    message.id === updatedMessage.id ? updatedMessage : message
  );
  await refreshChats();
  renderMessenger();
});

socket.on('message:deleted', async ({ messageId }: { messageId: string }) => {
  messages = messages.filter((message) => message.id !== messageId);
  await refreshChats();
  renderMessenger();
});

socket.on('data:reset', async () => {
  if (api.hasToken()) {
    await loadMessenger();
  }
});

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      })[character] ?? character
  );
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function renderLogin(error = ''): void {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="brand-badge">QA</div>
        <h1>Messenger QA</h1>
        <p class="muted">Демонстрационный проект для UI и API автотестов</p>

        <form data-testid="login-form" class="login-form">
          <label>
            Email
            <input
              data-testid="email-input"
              name="email"
              type="email"
              value="demo@example.com"
              autocomplete="username"
            />
          </label>

          <label>
            Пароль
            <input
              data-testid="password-input"
              name="password"
              type="password"
              value="Password123!"
              autocomplete="current-password"
            />
          </label>

          <p data-testid="login-error" class="error ${error ? '' : 'hidden'}">${escapeHtml(error)}</p>

          <button data-testid="login-button" type="submit">Войти</button>
        </form>
      </section>
    </main>
  `;

  const form = document.querySelector<HTMLFormElement>('[data-testid="login-form"]');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');

    try {
      await api.login(email, password);
      await loadMessenger();
    } catch (error) {
      renderLogin(error instanceof Error ? error.message : 'Login failed');
    }
  });
}

async function refreshChats(): Promise<void> {
  chats = await api.getChats(searchQuery);
  if (selectedChat) {
    selectedChat = chats.find((chat) => chat.id === selectedChat?.id) ?? selectedChat;
  }
}

async function loadMessenger(): Promise<void> {
  try {
    currentUser = await api.getMe();
    await refreshChats();

    if (!selectedChat && chats.length > 0) {
      await selectChat(chats[0].id, false);
      return;
    }

    renderMessenger();
  } catch {
    api.logout();
    renderLogin();
  }
}

async function selectChat(chatId: string, shouldRender = true): Promise<void> {
  selectedChat = chats.find((chat) => chat.id === chatId) ?? null;
  if (!selectedChat) {
    messages = [];
    renderMessenger();
    return;
  }

  messages = await api.getMessages(selectedChat.id);
  await api.markRead(selectedChat.id);
  selectedChat.unreadCount = 0;

  if (shouldRender) {
    renderMessenger();
  } else {
    renderMessenger();
  }
}

function renderChatList(): string {
  if (chats.length === 0) {
    return '<div data-testid="empty-chats" class="empty">Чаты не найдены</div>';
  }

  return chats
    .map(
      (chat) => `
        <button
          data-testid="chat-item"
          data-chat-id="${chat.id}"
          class="chat-item ${selectedChat?.id === chat.id ? 'active' : ''}"
          type="button"
        >
          <span class="avatar">${escapeHtml(chat.avatar)}</span>
          <span class="chat-copy">
            <span class="chat-title">${escapeHtml(chat.title)}</span>
            <span class="chat-preview">${escapeHtml(chat.lastMessage)}</span>
          </span>
          ${chat.unreadCount > 0 ? `<span data-testid="unread-badge" class="unread">${chat.unreadCount}</span>` : ''}
        </button>
      `
    )
    .join('');
}

function renderMessages(): string {
  if (!selectedChat) {
    return '<div class="empty-panel">Выберите чат</div>';
  }

  if (messages.length === 0) {
    return '<div data-testid="empty-messages" class="empty-panel">Сообщений пока нет</div>';
  }

  return messages
    .map((message) => {
      const own = message.authorId === currentUser?.id;
      return `
        <article
          data-testid="message"
          data-message-id="${message.id}"
          class="message ${own ? 'own' : 'incoming'}"
        >
          <p data-testid="message-text">${escapeHtml(message.text)}</p>
          <footer>
            ${message.edited ? '<span data-testid="edited-label">изменено</span>' : ''}
            <time>${formatTime(message.createdAt)}</time>
            ${own ? `<span data-testid="message-status">${message.status}</span>` : ''}
          </footer>
          ${
            own
              ? `
                <div class="message-actions">
                  <button data-testid="edit-message" data-message-id="${message.id}" type="button">Изменить</button>
                  <button data-testid="delete-message" data-message-id="${message.id}" type="button">Удалить</button>
                </div>
              `
              : ''
          }
        </article>
      `;
    })
    .join('');
}

function renderMessenger(): void {
  if (!currentUser) {
    renderLogin();
    return;
  }

  app.innerHTML = `
    <main class="messenger" data-testid="messenger">
      <aside class="sidebar">
        <header class="sidebar-header">
          <div>
            <strong data-testid="current-user-name">${escapeHtml(currentUser.name)}</strong>
            <small>${escapeHtml(currentUser.email)}</small>
          </div>
          <button data-testid="logout-button" class="secondary" type="button">Выйти</button>
        </header>

        <div class="search-wrap">
          <input
            data-testid="chat-search"
            type="search"
            placeholder="Поиск чатов"
            value="${escapeHtml(searchQuery)}"
          />
        </div>

        <nav data-testid="chat-list" class="chat-list">
          ${renderChatList()}
        </nav>
      </aside>

      <section class="conversation">
        <header class="conversation-header">
          <div class="avatar">${escapeHtml(selectedChat?.avatar ?? '—')}</div>
          <div>
            <h2 data-testid="chat-title">${escapeHtml(selectedChat?.title ?? 'Чат не выбран')}</h2>
            <span class="online">online</span>
          </div>
        </header>

        <div data-testid="message-list" class="message-list">
          ${renderMessages()}
        </div>

        ${
          selectedChat
            ? `
              <form data-testid="message-form" class="composer">
                <textarea
                  data-testid="message-input"
                  maxlength="500"
                  placeholder="Введите сообщение"
                  rows="2"
                ></textarea>
                <button data-testid="send-message" type="submit">Отправить</button>
              </form>
            `
            : ''
        }
      </section>
    </main>
  `;

  document.querySelector('[data-testid="logout-button"]')?.addEventListener('click', () => {
    api.logout();
    currentUser = null;
    selectedChat = null;
    messages = [];
    renderLogin();
  });

  document.querySelector<HTMLInputElement>('[data-testid="chat-search"]')?.addEventListener(
    'input',
    async (event) => {
      searchQuery = (event.target as HTMLInputElement).value;
      await refreshChats();
      renderMessenger();
    }
  );

  document.querySelectorAll<HTMLButtonElement>('[data-testid="chat-item"]').forEach((button) => {
    button.addEventListener('click', async () => {
      await selectChat(button.dataset.chatId ?? '');
    });
  });

  const form = document.querySelector<HTMLFormElement>('[data-testid="message-form"]');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = document.querySelector<HTMLTextAreaElement>('[data-testid="message-input"]');
    const text = input?.value.trim() ?? '';

    if (!selectedChat || !text) {
      return;
    }

    const message = await api.sendMessage(selectedChat.id, text);
    if (!messages.some((item) => item.id === message.id)) {
      messages.push(message);
    }

    if (input) {
      input.value = '';
    }

    await refreshChats();
    renderMessenger();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-testid="edit-message"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const messageId = button.dataset.messageId ?? '';
      const message = messages.find((item) => item.id === messageId);
      if (!message) {
        return;
      }

      const text = window.prompt('Новый текст сообщения', message.text)?.trim();
      if (!text || text === message.text) {
        return;
      }

      const updated = await api.editMessage(messageId, text);
      messages = messages.map((item) => (item.id === messageId ? updated : item));
      await refreshChats();
      renderMessenger();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-testid="delete-message"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const messageId = button.dataset.messageId ?? '';
      if (!window.confirm('Удалить сообщение?')) {
        return;
      }

      await api.deleteMessage(messageId);
      messages = messages.filter((item) => item.id !== messageId);
      await refreshChats();
      renderMessenger();
    });
  });

  requestAnimationFrame(() => {
    const list = document.querySelector<HTMLDivElement>('[data-testid="message-list"]');
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  });
}

if (api.hasToken()) {
  void loadMessenger();
} else {
  renderLogin();
}
