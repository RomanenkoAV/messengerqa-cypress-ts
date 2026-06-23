import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { chats, currentUser, messages, resetData } from './data';
import type { Chat, Message } from '../shared/types';

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT ?? 3001);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://127.0.0.1:5173'
  }
});

app.use(cors());
app.use(express.json());

const token = 'demo-token';

function auth(req: Request, res: Response, next: NextFunction): void {
  if (req.header('authorization') !== `Bearer ${token}`) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
}

function updateChatPreview(chatId: string, text: string): void {
  const chat = chats.find((item) => item.id === chatId);
  if (!chat) {
    return;
  }

  chat.lastMessage = text;
  chat.updatedAt = new Date().toISOString();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (email !== 'demo@example.com' || password !== 'Password123!') {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  res.json({
    token,
    user: currentUser
  });
});

app.get('/api/me', auth, (_req, res) => {
  res.json(currentUser);
});

app.get('/api/chats', auth, (req, res) => {
  const query = String(req.query.q ?? '').trim().toLowerCase();
  const result = chats
    .filter((chat) => chat.title.toLowerCase().includes(query))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  res.json(result);
});

app.get('/api/chats/:chatId/messages', auth, (req, res) => {
  const chat = chats.find((item) => item.id === req.params.chatId);
  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  const result = messages
    .filter((message) => message.chatId === chat.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  res.json(result);
});

app.post('/api/chats/:chatId/messages', auth, (req, res) => {
  const chat = chats.find((item) => item.id === req.params.chatId);
  const text = String(req.body?.text ?? '').trim();

  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  if (!text) {
    res.status(400).json({ message: 'Message text is required' });
    return;
  }

  if (text.length > 500) {
    res.status(400).json({ message: 'Message is too long' });
    return;
  }

  const message: Message = {
    id: `m${Date.now()}`,
    chatId: chat.id,
    authorId: currentUser.id,
    text,
    createdAt: new Date().toISOString(),
    edited: false,
    status: 'sent'
  };

  messages.push(message);
  updateChatPreview(chat.id, text);
  io.emit('message:new', message);

  res.status(201).json(message);
});

app.patch('/api/messages/:messageId', auth, (req, res) => {
  const message = messages.find((item) => item.id === req.params.messageId);
  const text = String(req.body?.text ?? '').trim();

  if (!message) {
    res.status(404).json({ message: 'Message not found' });
    return;
  }

  if (message.authorId !== currentUser.id) {
    res.status(403).json({ message: 'Only own messages can be edited' });
    return;
  }

  if (!text) {
    res.status(400).json({ message: 'Message text is required' });
    return;
  }

  message.text = text;
  message.edited = true;
  updateChatPreview(message.chatId, text);
  io.emit('message:updated', message);

  res.json(message);
});

app.delete('/api/messages/:messageId', auth, (req, res) => {
  const index = messages.findIndex((item) => item.id === req.params.messageId);

  if (index === -1) {
    res.status(404).json({ message: 'Message not found' });
    return;
  }

  if (messages[index].authorId !== currentUser.id) {
    res.status(403).json({ message: 'Only own messages can be deleted' });
    return;
  }

  const [deleted] = messages.splice(index, 1);
  const lastMessage = messages
    .filter((message) => message.chatId === deleted.chatId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  updateChatPreview(deleted.chatId, lastMessage?.text ?? '');
  io.emit('message:deleted', { messageId: deleted.id, chatId: deleted.chatId });

  res.status(204).send();
});

app.post('/api/chats/:chatId/read', auth, (req, res) => {
  const chat = chats.find((item) => item.id === req.params.chatId);
  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  chat.unreadCount = 0;
  res.status(204).send();
});

app.post('/api/test/reset', (_req, res) => {
  resetData();
  io.emit('data:reset');
  res.status(204).send();
});

app.post('/api/test/incoming', (req, res) => {
  const chatId = String(req.body?.chatId ?? 'c1');
  const text = String(req.body?.text ?? 'Новое входящее сообщение');
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    res.status(404).json({ message: 'Chat not found' });
    return;
  }

  const authorId = chat.memberIds.find((id) => id !== currentUser.id) ?? 'u2';
  const message: Message = {
    id: `incoming-${Date.now()}`,
    chatId,
    authorId,
    text,
    createdAt: new Date().toISOString(),
    edited: false,
    status: 'delivered'
  };

  messages.push(message);
  chat.unreadCount += 1;
  updateChatPreview(chatId, text);
  io.emit('message:new', message);

  res.status(201).json(message);
});

io.on('connection', (socket) => {
  socket.emit('connected', { id: socket.id });
});

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`Messenger API is running on http://127.0.0.1:${port}`);
});
