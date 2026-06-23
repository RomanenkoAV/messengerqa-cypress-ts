import { MessengerPage } from '../../pages/MessengerPage';

describe('Chat search', () => {
  const messenger = new MessengerPage();

  beforeEach(() => {
    cy.resetApp();
    cy.login();
  });

  it('filters chats by title', () => {
    messenger.searchChat('QA Team');

    cy.get('[data-testid="chat-item"]').should('have.length', 1);
    cy.get('[data-testid="chat-item"]').should('contain.text', 'QA Team');
  });

  it('shows an empty state when no chat matches', () => {
    messenger.searchChat('Missing chat');

    cy.get('[data-testid="empty-chats"]').should('contain.text', 'Чаты не найдены');
  });
});
