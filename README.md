# Messenger QA Cypress TypeScript

Полноценный учебный проект для портфолио QA Automation Engineer.

Стек

- TypeScript
- Cypress
- Vite
- Express
- Socket.IO
- REST API
- GitHub Actions
- GitLab CI

## Функции приложения

- авторизация
- список и поиск чатов
- история сообщений
- отправка сообщений
- редактирование и удаление собственных сообщений
- статусы сообщений
- входящие сообщения в realtime
- адаптивный интерфейс

## Покрытие автотестами

UI

- успешная и неуспешная авторизация
- logout
- поиск чатов
- пустой результат поиска
- отправка сообщения
- запрет пустого сообщения
- статус собственного сообщения
- редактирование
- удаление
- получение входящего сообщения без reload
- mobile viewport

API

- успешная авторизация
- неверный пароль
- создание сообщения
- валидация пустого сообщения
- запрос без токена

## Структура

```text
messengerqa-cypress-ts
├── cypress
│   ├── e2e
│   │   ├── api
│   │   └── ui
│   ├── fixtures
│   ├── pages
│   └── support
├── docs
├── server
├── shared
├── src
├── .github
├── cypress.config.ts
├── vite.config.ts
└── package.json
```

## Запуск

Нужен Node.js 20 или новее.

```bash
npm install
npm run dev
```

Frontend откроется на http://127.0.0.1:5173

API работает на http://127.0.0.1:3001

Тестовые данные

```text
Email      demo@example.com
Password   Password123!
```

## Запуск Cypress

Открытый режим

```bash
npm run cy:open
```

Headless режим с автоматическим запуском приложения

```bash
npm test
```

## Сборка

```bash
npm run build
```

## Документация

- docs/project-description.md
- docs/test-plan.md
- docs/test-cases.md
- docs/checklist.md
- docs/bug-report.md
- docs/automation-strategy.md
- docs/interview-presentation.md

## Идеи для развития

- Docker Compose
- Allure Report
- visual regression
- accessibility testing
- OpenAPI schema validation
- performance smoke через k6
- parallel execution
