export class LoginPage {
  visit(): void {
    cy.visit('/');
  }

  fillEmail(email: string): void {
    cy.get('[data-testid="email-input"]').clear().type(email);
  }

  fillPassword(password: string): void {
    cy.get('[data-testid="password-input"]').clear().type(password, { log: false });
  }

  submit(): void {
    cy.get('[data-testid="login-button"]').click();
  }

  login(email: string, password: string): void {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
  }

  errorShouldContain(text: string): void {
    cy.get('[data-testid="login-error"]').should('be.visible').and('contain.text', text);
  }
}
