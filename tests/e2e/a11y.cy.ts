/// <reference types="cypress" />
import 'cypress-axe';

describe('Accessibility checks', () => {
  beforeEach(() => {
    cy.visit('/app.html');
    cy.injectAxe();
  });

  it('has no critical a11y violations', () => {
    cy.checkA11y(undefined, { includedImpacts: ['critical'] });
  });
});
