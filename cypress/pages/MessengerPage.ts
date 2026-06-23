export class MessengerPage {
  selectChat(title: string): void {
    cy.get('[data-testid="chat-item"]').contains(title).click();
  }

  searchChat(query: string): void {
    cy.get('[data-testid="chat-search"]').clear().type(query);
  }

  sendMessage(text: string): void {
    cy.get('[data-testid="message-input"]').type(text);
    cy.get('[data-testid="send-message"]').click();
  }

  lastMessageShouldContain(text: string): void {
    cy.get('[data-testid="message"]').last().should('contain.text', text);
  }

  messageByText(text: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .get('[data-testid="message"]')
      .filter(`:contains("${text}")`)
      .last();
  }
}
