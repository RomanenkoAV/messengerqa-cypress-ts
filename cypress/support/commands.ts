declare global {
  namespace Cypress {
    interface Chainable {
      resetApp(): Chainable<void>;
      login(email?: string, password?: string): Chainable<void>;
      apiLogin(): Chainable<string>;
    }
  }
}

Cypress.Commands.add('resetApp', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/test/reset`);
});

Cypress.Commands.add(
  'login',
  (email = 'demo@example.com', password = 'Password123!') => {
    cy.visit('/');
    cy.get('[data-testid="email-input"]').clear().type(email);
    cy.get('[data-testid="password-input"]').clear().type(password, { log: false });
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="messenger"]').should('be.visible');
  }
);

Cypress.Commands.add('apiLogin', () => {
  return cy
    .request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: {
        email: 'demo@example.com',
        password: 'Password123!'
      }
    })
    .then((response) => response.body.token as string);
});

export {};
