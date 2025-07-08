/// <reference types="cypress" />

describe('Staging smoke tests', () => {
  beforeEach(() => {
    cy.visit('/app.html');
  });

  it('shows sidebar icon on fresh board', () => {
    cy.get('[data-testid="sidebar-icon"]').should('be.visible');
  });

  it('imports kanban CSV and renders widgets', () => {
    cy.get('[data-testid="file-input"]').selectFile(
      'tests/fixtures/kanban.csv',
      { force: true },
    );
    cy.get('[data-testid="widget"]').should('have.length.greaterThan', 0);
    cy.undo();
    cy.get('[data-testid="widget"]').should('have.length', 0);
  });

  it('switches to dark theme', () => {
    cy.get('button[title="Toggle theme"]').click();
    cy.get('body').should('have.class', 'theme-dark');
  });
});
