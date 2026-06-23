import { MessengerPage } from '../../pages/MessengerPage';

describe('Sending messages', () => {
  const messenger = new MessengerPage();

  beforeEach(() => {
    cy.resetApp();
    cy.login();
    messenger.selectChat('Anna Petrova');
  });

  it('sends a text message and updates the chat preview', () => {
    cy.fixture('messages').then(({ short }) => {
      messenger.sendMessage(short);
      messenger.lastMessageShouldContain(short);

      cy.get('[data-testid="chat-item"]')
        .contains('Anna Petrova')
        .parents('[data-testid="chat-item"]')
        .should('contain.text', short);
    });
  });

  it('does not send an empty message', () => {
    cy.get('[data-testid="message"]').then(($messages) => {
      const count = $messages.length;
      cy.get('[data-testid="send-message"]').click();
      cy.get('[data-testid="message"]').should('have.length', count);
    });
  });

  it('shows sent status for own message', () => {
    messenger.sendMessage('Status check');
    cy.get('[data-testid="message-status"]').last().should('contain.text', 'sent');
  });
});
