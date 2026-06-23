describe('Mobile viewport', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.resetApp();
    cy.login();
  });

  it('keeps the messenger usable on a mobile screen', () => {
    cy.get('[data-testid="messenger"]').should('be.visible');
    cy.get('[data-testid="chat-list"]').should('be.visible');
    cy.get('[data-testid="message-form"]').should('be.visible');
  });
});
