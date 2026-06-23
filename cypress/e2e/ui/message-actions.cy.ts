import { MessengerPage } from '../../pages/MessengerPage';

describe('Message actions', () => {
  const messenger = new MessengerPage();

  beforeEach(() => {
    cy.resetApp();
    cy.login();
    messenger.selectChat('Anna Petrova');
  });

  it('edits an own message', () => {
    messenger.sendMessage('Initial text');

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Updated text');
    });

    messenger.messageByText('Initial text').within(() => {
      cy.get('[data-testid="edit-message"]').click({ force: true });
    });

    messenger.messageByText('Updated text')
      .should('contain.text', 'Updated text')
      .and('contain.text', 'изменено');
  });

  it('deletes an own message', () => {
    messenger.sendMessage('Delete me');

    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    messenger.messageByText('Delete me').within(() => {
      cy.get('[data-testid="delete-message"]').click({ force: true });
    });

    cy.get('[data-testid="message"]').should('not.contain.text', 'Delete me');
  });
});
