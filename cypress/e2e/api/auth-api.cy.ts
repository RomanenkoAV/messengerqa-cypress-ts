describe('Auth API', () => {
  it('returns a token for valid credentials', () => {
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
      email: 'demo@example.com',
      password: 'Password123!'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.token).to.eq('demo-token');
      expect(response.body.user.email).to.eq('demo@example.com');
    });
  });

  it('returns 401 for invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: {
        email: 'demo@example.com',
        password: 'wrong'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Invalid email or password');
    });
  });
});
