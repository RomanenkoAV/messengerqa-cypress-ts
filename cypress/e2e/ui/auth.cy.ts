import { LoginPage } from '../../pages/LoginPage';

describe('Authentication', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    cy.resetApp();
    loginPage.visit();
  });

  it('logs in with valid credentials', () => {
    cy.fixture('users').then(({ validUser }) => {
      loginPage.login(validUser.email, validUser.password);
    });

    cy.get('[data-testid="messenger"]').should('be.visible');
    cy.get('[data-testid="current-user-name"]').should('contain.text', 'Arseniy QA');
  });

  it('shows an error for invalid credentials', () => {
    cy.fixture('users').then(({ invalidUser }) => {
      loginPage.login(invalidUser.email, invalidUser.password);
    });

    loginPage.errorShouldContain('Invalid email or password');
  });

  it('logs out and returns to the login page', () => {
    cy.login();
    cy.get('[data-testid="logout-button"]').click();

    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.window().its('localStorage.messenger_token').should('be.undefined');
  });
});
