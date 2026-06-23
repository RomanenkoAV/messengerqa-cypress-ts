describe('Messages API', () => {
  let token: string;

  beforeEach(() => {
    cy.resetApp();
    cy.apiLogin().then((value) => {
      token = value;
    });
  });

  it('creates and returns a message', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/chats/c1/messages`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        text: 'API message'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.text).to.eq('API message');
      expect(response.body.status).to.eq('sent');
    });
  });

  it('rejects an empty message', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/chats/c1/messages`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        text: '   '
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Message text is required');
    });
  });

  it('rejects a request without authorization', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/chats`,
      failOnStatusCode: false
    }).its('status').should('eq', 401);
  });
});
