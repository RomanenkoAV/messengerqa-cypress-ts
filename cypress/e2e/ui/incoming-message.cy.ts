import { MessengerPage } from '../../pages/MessengerPage';

describe('Incoming messages', () => {
  const messenger = new MessengerPage();

  beforeEach(() => {
    cy.resetApp();
    cy.login();
    messenger.selectChat('Anna Petrova');
  });

  it('shows a new incoming message without page reload', () => {
    cy.fixture('messages').then(({ incoming }) => {
      cy.request('POST', `${Cypress.env('apiUrl')}/test/incoming`, {
        chatId: 'c1',
        text: incoming
      });

      messenger.lastMessageShouldContain(incoming);
    });
  });
});
